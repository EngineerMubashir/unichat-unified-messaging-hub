import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, Dimensions, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio, Video, ResizeMode } from 'expo-av';

type ChatRouteParams = { id: string; name: string; avatar: string; baseUrl?: string };
type Message = { 
  id: string; 
  text?: string; 
  sender: 'me' | 'other'; 
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'file'; 
  media_url?: string; 
  filename?: string; 
  caption?: string;
  time: string; 
  timestamp: number; 
  status?: 'sent' | 'delivered' | 'read'; 
};

const { width } = Dimensions.get('window');
const DEFAULT_BASE_URL = 'http://192.168.137.16:4001';
// const DEFAULT_BASE_URL = 'https://a6875668170a.ngrok-free.app';

export default function MessengerChatScreen() {
  const route = useRoute<any>();
  const { id, name, avatar, baseUrl } = route.params as ChatRouteParams;
  const BASE_URL = baseUrl || DEFAULT_BASE_URL;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudio, setPlayingAudio] = useState<{ [key: string]: Audio.Sound }>({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // ------------------ FETCH MESSAGES ------------------
  const fetchMessages = async () => {
    try {
      const [sentRes, recvRes] = await Promise.all([
        fetch(`${BASE_URL}/messenger/sent`),
        fetch(`${BASE_URL}/messenger/received`)
      ]);
      const sentData = await sentRes.json();
      const recvData = await recvRes.json();

      const combined: Message[] = [
        ...sentData.map((m: any) => ({
          id: String(m.id),
          text: m.text,
          sender: 'me' as const,
          type: m.type,
          media_url: m.media_url,
          filename: m.filename || m.caption,
          caption: m.caption,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.timestamp,
          status: m.status
        })),
        ...recvData.map((m: any) => ({
          id: String(m.id),
          text: m.text,
          sender: 'other' as const,
          type: m.type,
          media_url: m.media_url,
          filename: m.filename || m.caption,
          caption: m.caption,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.timestamp
        }))
      ];

      combined.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(combined);
    } catch (err) {
      console.error('Fetch messenger messages error:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { 
      if (pollRef.current) clearInterval(pollRef.current); 
      if (recording) recording.stopAndUnloadAsync();
      // Clean up audio players
      Object.values(playingAudio).forEach(sound => {
        sound.unloadAsync().catch(console.error);
      });
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ------------------ AUDIO PLAYBACK ------------------
  const playAudio = async (messageId: string, audioUrl: string) => {
    try {
      // Stop currently playing audio if any
      if (currentlyPlaying && playingAudio[currentlyPlaying]) {
        await playingAudio[currentlyPlaying].stopAsync();
        await playingAudio[currentlyPlaying].unloadAsync();
        delete playingAudio[currentlyPlaying];
        if (currentlyPlaying === messageId) {
          setCurrentlyPlaying(null);
          return;
        }
      }

      // Create new audio instance
      const { sound } = await Audio.Sound.createAsync(
        { uri: `${BASE_URL}${audioUrl}` },
        { shouldPlay: true }
      );

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setCurrentlyPlaying(null);
          sound.unloadAsync().catch(console.error);
          delete playingAudio[messageId];
        }
      });

      setPlayingAudio(prev => ({ ...prev, [messageId]: sound }));
      setCurrentlyPlaying(messageId);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio message');
    }
  };

  const stopAudio = async (messageId: string) => {
    if (playingAudio[messageId]) {
      await playingAudio[messageId].stopAsync();
      await playingAudio[messageId].unloadAsync();
      delete playingAudio[messageId];
      setCurrentlyPlaying(null);
    }
  };

  // ------------------ DOWNLOAD DOCUMENT ------------------
  const downloadDocument = (documentUrl: string, filename: string) => {
    const fullUrl = `${BASE_URL}${documentUrl}`;
    if (Platform.OS === 'web') {
      // For web, open in new tab
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mobile, you might want to use a file viewer library
      Alert.alert('Document', `Opening: ${filename}`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => {
          // You can implement native document viewing here
          console.log('Opening document:', fullUrl);
        }}
      ]);
    }
  };

  // ------------------ SEND TEXT ------------------
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setIsSending(true); 
    setInputText('');
    
    try {
      const response = await fetch(`${BASE_URL}/messenger/send`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text }) 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${errorText}`);
      }
      
      fetchMessages();
    } catch (err) { 
      console.error('Send messenger text error:', err); 
      Alert.alert('Error', 'Failed to send text message'); 
      setInputText(text); 
    } finally { 
      setIsSending(false); 
    }
  };

  // ------------------ SEND MEDIA ------------------
  const sendMedia = async (asset: any, type: 'image'|'video'|'audio'|'document'|'file') => {
    if (!asset.uri) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      let fileName = asset.name || asset.filename || asset.uri.split('/').pop() || `file.${type}`;
      let mimeType = asset.mimeType || 'application/octet-stream';
      let mediaType = type;
      
      // Determine correct type and MIME type based on file
      if (type === 'image') {
        mimeType = asset.mimeType || 'image/jpeg';
        mediaType = 'image';
      } else if (type === 'video') {
        mimeType = asset.mimeType || 'video/mp4';
        mediaType = 'video';
      } else if (type === 'audio') {
        mimeType = asset.mimeType || 'audio/m4a';
        mediaType = 'audio';
      } else {
        // For documents, determine if it's a known document type
        if (asset.mimeType) {
          if (asset.mimeType.startsWith('image/')) {
            mediaType = 'image';
          } else if (asset.mimeType.startsWith('video/')) {
            mediaType = 'video';
          } else if (asset.mimeType.startsWith('audio/')) {
            mediaType = 'audio';
          } else {
            mediaType = 'file'; // Use 'file' instead of 'document' to match HTML version
          }
        } else {
          mediaType = 'file';
        }
      }

      // Append the file
      if (Platform.OS === 'web') {
        if (asset.uri.startsWith('data:') || asset.uri.startsWith('blob:')) {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          formData.append('file', blob, fileName);
        } else {
          formData.append('file', asset, fileName);
        }
      } else {
        const file = {
          uri: asset.uri,
          name: fileName,
          type: mimeType
        } as any;
        formData.append('file', file);
      }

      // Add type and caption (matching HTML format)
      formData.append('type', mediaType);
      formData.append('caption', fileName);

      console.log('Sending messenger media:', { type: mediaType, fileName, mimeType });

      const res = await fetch(`${BASE_URL}/messenger/send-media`, { 
        method: 'POST', 
        body: formData,
        headers: {
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      });
      
      if (!res.ok) { 
        const errorText = await res.text(); 
        console.error('Messenger media send error response:', errorText); 
        throw new Error(`Media upload failed: ${errorText}`); 
      }

      const result = await res.json();
      console.log('Media upload successful:', result);
      fetchMessages();
    } catch (err: any) { 
      console.error('Send messenger media error:', err); 
      Alert.alert('Error', `Failed to send ${type}: ${err?.message || err}`); 
    } finally { 
      setIsUploading(false); 
    }
  };

  // ------------------ PICK IMAGE/VIDEO ------------------
  const pickImageOrVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to send images/videos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ['images', 'videos'],
        quality: 0.7,
        allowsEditing: false
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'image';
        await sendMedia(asset, mediaType);
      }
    } catch (err) {
      console.error('Pick messenger image/video error:', err);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  // ------------------ PICK DOCUMENT ------------------
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Type assertion for mimeType property
        (asset as any).mimeType = (asset as any).mimeType || 'application/octet-stream';
        await sendMedia(asset, 'file'); // Use 'file' instead of 'document'
      } else if ((result as any).type === 'success') {
        // Legacy format support - type assertion for older DocumentPicker versions
        (result as any).mimeType = (result as any).mimeType || 'application/octet-stream';
        await sendMedia(result, 'file'); // Use 'file' instead of 'document'
      }
    } catch (err: any) {
      console.error('Pick messenger document error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // ------------------ VOICE RECORDING ------------------
  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permissions to record voice messages');
        return;
      }
      
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording); 
      setIsRecording(true);
    } catch (err: any) {
      console.error('Messenger start recording error:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        const fileName = `voice_${Date.now()}.m4a`;
        await sendMedia({ 
          uri, 
          name: fileName, 
          filename: fileName,
          mimeType: 'audio/m4a' 
        }, 'audio');
      }
    } catch (err: any) {
      console.error('Messenger stop recording error:', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // ------------------ RENDER MESSAGE ------------------
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    const bubbleStyle = [styles.bubble, isMe ? styles.messengerSent : styles.received];
    const textColor = isMe ? '#fff' : '#000';
    
    return (
      <View style={[styles.messageRow, isMe ? {justifyContent:'flex-end'} : {justifyContent:'flex-start'}]}>
        {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View style={bubbleStyle}>
          {item.type === 'text' && (
            <Text style={[styles.messageText, {color: textColor}]}>{item.text}</Text>
          )}
          
          {item.type === 'image' && (
            <TouchableOpacity onPress={() => {/* Add image preview modal if needed */}}>
              <Image 
                source={{ uri: `${BASE_URL}${item.media_url}` }} 
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          {item.type === 'video' && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: `${BASE_URL}${item.media_url}` }}
                style={styles.videoPlayer}
                useNativeControls={playingVideo === item.id}
                resizeMode={ResizeMode.COVER}
                shouldPlay={playingVideo === item.id}
                isLooping={false}
                onPlaybackStatusUpdate={(status) => {
                  if (status.isLoaded && status.didJustFinish) {
                    setPlayingVideo(null);
                  }
                }}
              />
              {playingVideo !== item.id && (
                <TouchableOpacity 
                  style={styles.videoPlayButton}
                  onPress={() => setPlayingVideo(item.id)}
                >
                  <Ionicons 
                    name="play-circle" 
                    size={48} 
                    color="white" 
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {item.type === 'audio' && (
            <TouchableOpacity 
              onPress={() => playAudio(item.id, item.media_url!)}
              style={styles.audioContainer}
            >
              <Ionicons 
                name={currentlyPlaying === item.id ? "pause-circle" : "play-circle"} 
                size={32} 
                color={textColor} 
              />
              <Text style={[styles.audioText, {color: textColor}]}>
                {currentlyPlaying === item.id ? 'Playing...' : 'Voice message'}
              </Text>
            </TouchableOpacity>
          )}
          
          {(item.type === 'document' || item.type === 'file') && (
            <TouchableOpacity 
              onPress={() => downloadDocument(item.media_url!, item.filename || item.caption || 'Document')}
              style={styles.documentContainer}
            >
              <Ionicons name="document-text" size={24} color={textColor} />
              <Text style={[styles.documentText, {color: textColor}]}>
                {item.filename || item.caption || '📄 File'}
              </Text>
              <Ionicons name="download" size={16} color={textColor} />
            </TouchableOpacity>
          )}
          
          <Text style={[styles.timeText, {color: isMe ? '#fff' : '#666'}]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <View style={styles.platformRow}>
            <Ionicons name="logo-facebook" size={14} color="#0084FF" />
            <Text style={styles.platformText}>Messenger</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
      
      {isUploading && (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="small" color="#0084FF" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="Type a message" 
          style={styles.input} 
          editable={!isSending && !isRecording}
          multiline
        />
        
        <TouchableOpacity 
          onPress={isRecording ? stopRecording : startRecording} 
          style={[styles.sendButton, isRecording && styles.recordingButton]}
        >
          <Ionicons 
            name={isRecording ? "stop" : "mic"} 
            size={20} 
            color={isRecording ? "#FF0000" : "#666"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={sendMessage} 
          style={[styles.sendButton, (!inputText.trim() || isSending) && styles.disabledButton]}
          disabled={!inputText.trim() || isSending}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={(!inputText.trim() || isSending) ? "#ccc" : "#0084FF"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={pickImageOrVideo} 
          style={styles.sendButton}
          disabled={isUploading}
        >
          <Ionicons name="image" size={20} color={isUploading ? "#ccc" : "#666"}/>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={pickDocument} 
          style={styles.sendButton}
          disabled={isUploading}
        >
          <Ionicons name="attach" size={20} color={isUploading ? "#ccc" : "#666"}/>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 64, 
    paddingHorizontal: 15, 
    backgroundColor: '#0084FF', 
    paddingTop: 2
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerInfo: { marginLeft: 10, flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  platformRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  platformText: { fontSize: 12, marginLeft: 4, color: '#fff' },
  messageRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  bubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
  messengerSent: { backgroundColor: '#0084FF', borderTopRightRadius: 0 },
  received: { backgroundColor: '#e5e5ea', borderTopLeftRadius: 0 },
  messageText: { fontSize: 14, lineHeight: 18 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    backgroundColor: '#fff', 
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  input: { 
    flex: 1, 
    minHeight: 40,
    maxHeight: 45, 
    borderRadius: 20, 
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8
  },
  sendButton: { 
    marginLeft: 4, 
    padding: 10, 
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
  mediaImage: { 
    width: width * 0.6, 
    height: width * 0.45, 
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  mediaText: {
    marginLeft: 8,
    fontSize: 14
  },
  videoContainer: {
    position: 'relative',
    width: width * 0.6,
    height: width * 0.85,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000'
  },
  videoPlayer: {
    width: '100%',
    height: '100%'
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 120
  },
  audioText: {
    marginLeft: 8,
    fontSize: 14
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 150
  },
  documentText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f8ff'
  },
  uploadingText: { marginLeft: 8, color: '#0084FF', fontSize: 14 },
  recordingButton: { backgroundColor: '#ffebee' },
  disabledButton: { opacity: 0.5 }
});




// import React, { useEffect, useRef, useState } from 'react';
// import { 
//   View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, Dimensions, ActivityIndicator 
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute } from '@react-navigation/native';
// import * as DocumentPicker from 'expo-document-picker';
// import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av';

// type ChatRouteParams = { id: string; name: string; avatar: string; baseUrl?: string };
// type Message = { 
//   id: string; 
//   text?: string; 
//   sender: 'me' | 'other'; 
//   type: 'text' | 'image' | 'video' | 'audio' | 'document'; 
//   media_url?: string; 
//   filename?: string; 
//   time: string; 
//   timestamp: number; 
//   status?: 'sent' | 'delivered' | 'read'; 
// };

// const { width } = Dimensions.get('window');
// const DEFAULT_BASE_URL = 'http://localhost:4000';

// export default function MessengerChatScreen() {
//   const route = useRoute<any>();
//   const { id, name, avatar, baseUrl } = route.params as ChatRouteParams;
//   const BASE_URL = baseUrl || DEFAULT_BASE_URL;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [playingAudio, setPlayingAudio] = useState<{ [key: string]: Audio.Sound }>({});
//   const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

//   const pollRef = useRef<NodeJS.Timeout | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   // ------------------ FETCH MESSAGES ------------------
//   const fetchMessages = async () => {
//     try {
//       const [sentRes, recvRes] = await Promise.all([
//         fetch(`${BASE_URL}/messenger/sent`),
//         fetch(`${BASE_URL}/messenger/received`)
//       ]);
//       const sentData = await sentRes.json();
//       const recvData = await recvRes.json();

//       const combined: Message[] = [
//         ...sentData.map((m: any) => ({
//           id: String(m.id),
//           text: m.text,
//           sender: 'me' as const,
//           type: m.type,
//           media_url: m.media_url,
//           filename: m.filename,
//           time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           timestamp: m.timestamp,
//           status: m.status
//         })),
//         ...recvData.map((m: any) => ({
//           id: String(m.id),
//           text: m.text,
//           sender: 'other' as const,
//           type: m.type,
//           media_url: m.media_url,
//           filename: m.filename,
//           time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           timestamp: m.timestamp
//         }))
//       ];

//       combined.sort((a, b) => a.timestamp - b.timestamp);
//       setMessages(combined);
//     } catch (err) {
//       console.error('Fetch messenger messages error:', err);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     pollRef.current = setInterval(fetchMessages, 3000);
//     return () => { 
//       if (pollRef.current) clearInterval(pollRef.current); 
//       if (recording) recording.stopAndUnloadAsync();
//       // Clean up audio players
//       Object.values(playingAudio).forEach(sound => {
//         sound.unloadAsync().catch(console.error);
//       });
//     };
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, [messages]);

//   // ------------------ AUDIO PLAYBACK ------------------
//   const playAudio = async (messageId: string, audioUrl: string) => {
//     try {
//       // Stop currently playing audio if any
//       if (currentlyPlaying && playingAudio[currentlyPlaying]) {
//         await playingAudio[currentlyPlaying].stopAsync();
//         await playingAudio[currentlyPlaying].unloadAsync();
//         delete playingAudio[currentlyPlaying];
//         if (currentlyPlaying === messageId) {
//           setCurrentlyPlaying(null);
//           return;
//         }
//       }

//       // Create new audio instance
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: `${BASE_URL}${audioUrl}` },
//         { shouldPlay: true }
//       );

//       // Set up playback status update
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           setCurrentlyPlaying(null);
//           sound.unloadAsync().catch(console.error);
//           delete playingAudio[messageId];
//         }
//       });

//       setPlayingAudio(prev => ({ ...prev, [messageId]: sound }));
//       setCurrentlyPlaying(messageId);
//     } catch (error) {
//       console.error('Error playing audio:', error);
//       Alert.alert('Error', 'Failed to play audio message');
//     }
//   };

//   const stopAudio = async (messageId: string) => {
//     if (playingAudio[messageId]) {
//       await playingAudio[messageId].stopAsync();
//       await playingAudio[messageId].unloadAsync();
//       delete playingAudio[messageId];
//       setCurrentlyPlaying(null);
//     }
//   };

//   // ------------------ DOWNLOAD DOCUMENT ------------------
//   const downloadDocument = (documentUrl: string, filename: string) => {
//     const fullUrl = `${BASE_URL}${documentUrl}`;
//     if (Platform.OS === 'web') {
//       // For web, open in new tab
//       const link = document.createElement('a');
//       link.href = fullUrl;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } else {
//       // For mobile, you might want to use a file viewer library
//       Alert.alert('Document', `Opening: ${filename}`, [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Open', onPress: () => {
//           // You can implement native document viewing here
//           console.log('Opening document:', fullUrl);
//         }}
//       ]);
//     }
//   };

//   // ------------------ SEND TEXT ------------------
//   const sendMessage = async () => {
//     const text = inputText.trim();
//     if (!text || isSending) return;
//     setIsSending(true); 
//     setInputText('');
    
//     try {
//       const response = await fetch(`${BASE_URL}/messenger/send`, { 
//         method: 'POST', 
//         headers: { 'Content-Type': 'application/json' }, 
//         body: JSON.stringify({ text }) 
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to send message: ${errorText}`);
//       }
      
//       fetchMessages();
//     } catch (err) { 
//       console.error('Send messenger text error:', err); 
//       Alert.alert('Error', 'Failed to send text message'); 
//       setInputText(text); 
//     } finally { 
//       setIsSending(false); 
//     }
//   };

//   // ------------------ SEND MEDIA ------------------
//   const sendMedia = async (asset: any, type: 'image'|'video'|'audio'|'document') => {
//     if (!asset.uri) return;
//     setIsUploading(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('type', type);
      
//       let fileName = asset.name || asset.filename || asset.uri.split('/').pop() || `file.${type}`;
//       let mimeType = asset.mimeType || 'application/octet-stream';
      
//       // Set appropriate MIME types
//       if (type === 'image') {
//         mimeType = asset.mimeType || 'image/jpeg';
//       } else if (type === 'video') {
//         mimeType = asset.mimeType || 'video/mp4';
//       } else if (type === 'audio') {
//         mimeType = asset.mimeType || 'audio/m4a';
//       } else if (type === 'document') {
//         mimeType = asset.mimeType || 'application/pdf';
//       }

//       if (Platform.OS === 'web') {
//         if (asset.uri.startsWith('data:') || asset.uri.startsWith('blob:')) {
//           const response = await fetch(asset.uri);
//           const blob = await response.blob();
//           formData.append('file', blob, fileName);
//         } else {
//           formData.append('file', asset, fileName);
//         }
//       } else {
//         const file = {
//           uri: asset.uri,
//           name: fileName,
//           type: mimeType
//         } as any;
//         formData.append('file', file);
//       }

//       console.log('Sending messenger media:', { type, fileName, mimeType });

//       const res = await fetch(`${BASE_URL}/messenger/send-media`, { 
//         method: 'POST', 
//         body: formData,
//         headers: {
//           // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
//         }
//       });
      
//       if (!res.ok) { 
//         const errorText = await res.text(); 
//         console.error('Messenger media send error response:', errorText); 
//         throw new Error(`Media upload failed: ${errorText}`); 
//       }

//       const result = await res.json();
//       console.log('Media upload successful:', result);
//       fetchMessages();
//     } catch (err: any) { 
//       console.error('Send messenger media error:', err); 
//       Alert.alert('Error', `Failed to send ${type}: ${err?.message || err}`); 
//     } finally { 
//       setIsUploading(false); 
//     }
//   };

//   // ------------------ PICK IMAGE/VIDEO ------------------
//   const pickImageOrVideo = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission needed', 'Please grant media library permissions to send images/videos');
//       return;
//     }
    
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({ 
//         mediaTypes: ['images', 'videos'],
//         quality: 0.7,
//         allowsEditing: false
//       });
      
//       if (!result.canceled && result.assets[0]) {
//         const asset = result.assets[0];
//         const mediaType = asset.type === 'video' ? 'video' : 'image';
//         await sendMedia(asset, mediaType);
//       }
//     } catch (err) {
//       console.error('Pick messenger image/video error:', err);
//       Alert.alert('Error', 'Failed to pick media');
//     }
//   };

//   // ------------------ PICK DOCUMENT ------------------
//   const pickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({ 
//         type: '*/*',
//         copyToCacheDirectory: true
//       });
      
//       if (!result.canceled && result.assets && result.assets[0]) {
//         const asset = result.assets[0];
//         // Type assertion for mimeType property
//         (asset as any).mimeType = (asset as any).mimeType || 'application/octet-stream';
//         await sendMedia(asset, 'document');
//       } else if ((result as any).type === 'success') {
//         // Legacy format support - type assertion for older DocumentPicker versions
//         (result as any).mimeType = (result as any).mimeType || 'application/octet-stream';
//         await sendMedia(result, 'document');
//       }
//     } catch (err: any) {
//       console.error('Pick messenger document error:', err);
//       Alert.alert('Error', 'Failed to pick document');
//     }
//   };

//   // ------------------ VOICE RECORDING ------------------
//   const startRecording = async () => {
//     try {
//       if (recording) {
//         await recording.stopAndUnloadAsync();
//         setRecording(null);
//       }

//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission needed', 'Please grant microphone permissions to record voice messages');
//         return;
//       }
      
//       await Audio.setAudioModeAsync({ 
//         allowsRecordingIOS: true, 
//         playsInSilentModeIOS: true 
//       });
      
//       const { recording: newRecording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
      
//       setRecording(newRecording); 
//       setIsRecording(true);
//     } catch (err: any) {
//       console.error('Messenger start recording error:', err);
//       Alert.alert('Error', 'Failed to start recording');
//     }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
    
//     try {
//       setIsRecording(false);
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);
      
//       if (uri) {
//         const fileName = `voice_${Date.now()}.m4a`;
//         await sendMedia({ 
//           uri, 
//           name: fileName, 
//           filename: fileName,
//           mimeType: 'audio/m4a' 
//         }, 'audio');
//       }
//     } catch (err: any) {
//       console.error('Messenger stop recording error:', err);
//       Alert.alert('Error', 'Failed to stop recording');
//     }
//   };

//   // ------------------ RENDER MESSAGE ------------------
//   const renderMessage = ({ item }: { item: Message }) => {
//     const isMe = item.sender === 'me';
//     const bubbleStyle = [styles.bubble, isMe ? styles.messengerSent : styles.received];
//     const textColor = isMe ? '#fff' : '#000';
    
//     return (
//       <View style={[styles.messageRow, isMe ? {justifyContent:'flex-end'} : {justifyContent:'flex-start'}]}>
//         {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
//         <View style={bubbleStyle}>
//           {item.type === 'text' && (
//             <Text style={[styles.messageText, {color: textColor}]}>{item.text}</Text>
//           )}
          
//           {item.type === 'image' && (
//             <Image source={{ uri: `${BASE_URL}${item.media_url}` }} style={styles.mediaImage} />
//           )}
          
//           {item.type === 'video' && (
//             <View style={styles.mediaContainer}>
//               <Ionicons name="videocam" size={24} color={textColor} />
//               <Text style={[styles.mediaText, {color: textColor}]}>{item.filename}</Text>
//             </View>
//           )}
          
//           {item.type === 'audio' && (
//             <TouchableOpacity 
//               onPress={() => playAudio(item.id, item.media_url!)}
//               style={styles.audioContainer}
//             >
//               <Ionicons 
//                 name={currentlyPlaying === item.id ? "pause-circle" : "play-circle"} 
//                 size={32} 
//                 color={textColor} 
//               />
//               <Text style={[styles.audioText, {color: textColor}]}>
//                 {currentlyPlaying === item.id ? 'Playing...' : 'Voice message'}
//               </Text>
//             </TouchableOpacity>
//           )}
          
//           {item.type === 'document' && (
//             <TouchableOpacity 
//               onPress={() => downloadDocument(item.media_url!, item.filename!)}
//               style={styles.documentContainer}
//             >
//               <Ionicons name="document-text" size={24} color={textColor} />
//               <Text style={[styles.documentText, {color: textColor}]}>{item.filename}</Text>
//               <Ionicons name="download" size={16} color={textColor} />
//             </TouchableOpacity>
//           )}
          
//           <Text style={[styles.timeText, {color: isMe ? '#fff' : '#666'}]}>{item.time}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Image source={{ uri: avatar }} style={styles.headerAvatar} />
//         <View style={styles.headerInfo}>
//           <Text style={styles.headerName}>{name}</Text>
//           <View style={styles.platformRow}>
//             <Ionicons name="logo-facebook" size={14} color="#0084FF" />
//             <Text style={styles.platformText}>Messenger</Text>
//           </View>
//         </View>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item => item.id}
//         renderItem={renderMessage}
//         contentContainerStyle={{ padding: 12 }}
//         showsVerticalScrollIndicator={false}
//       />
      
//       {isUploading && (
//         <View style={styles.uploadingIndicator}>
//           <ActivityIndicator size="small" color="#0084FF" />
//           <Text style={styles.uploadingText}>Uploading...</Text>
//         </View>
//       )}
      
//       <View style={styles.inputContainer}>
//         <TextInput 
//           value={inputText} 
//           onChangeText={setInputText} 
//           placeholder="Type a message" 
//           style={styles.input} 
//           editable={!isSending && !isRecording}
//           multiline
//         />
        
//         <TouchableOpacity 
//           onPress={isRecording ? stopRecording : startRecording} 
//           style={[styles.sendButton, isRecording && styles.recordingButton]}
//         >
//           <Ionicons 
//             name={isRecording ? "stop" : "mic"} 
//             size={20} 
//             color={isRecording ? "#FF0000" : "#666"}
//           />
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           onPress={sendMessage} 
//           style={[styles.sendButton, (!inputText.trim() || isSending) && styles.disabledButton]}
//           disabled={!inputText.trim() || isSending}
//         >
//           <Ionicons 
//             name="send" 
//             size={20} 
//             color={(!inputText.trim() || isSending) ? "#ccc" : "#0084FF"}
//           />
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           onPress={pickImageOrVideo} 
//           style={styles.sendButton}
//           disabled={isUploading}
//         >
//           <Ionicons name="image" size={20} color={isUploading ? "#ccc" : "#666"}/>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           onPress={pickDocument} 
//           style={styles.sendButton}
//           disabled={isUploading}
//         >
//           <Ionicons name="attach" size={20} color={isUploading ? "#ccc" : "#666"}/>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   header: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     height: 64, 
//     paddingHorizontal: 15, 
//     backgroundColor: '#0084FF', 
//     paddingTop: 2
//   },
//   headerAvatar: { width: 40, height: 40, borderRadius: 20 },
//   headerInfo: { marginLeft: 10, flex: 1 },
//   headerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
//   platformRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
//   platformText: { fontSize: 12, marginLeft: 4, color: '#fff' },
//   messageRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
//   bubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
//   messengerSent: { backgroundColor: '#0084FF', borderTopRightRadius: 0 },
//   received: { backgroundColor: '#e5e5ea', borderTopLeftRadius: 0 },
//   messageText: { fontSize: 14, lineHeight: 18 },
//   timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
//   inputContainer: { 
//     flexDirection: 'row', 
//     padding: 10, 
//     backgroundColor: '#fff', 
//     alignItems: 'flex-end',
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0'
//   },
//   input: { 
//     flex: 1, 
//     minHeight: 40,
//     maxHeight: 45, 
//     borderRadius: 20, 
//     backgroundColor: '#f0f0f0', 
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginRight: 8
//   },
//   sendButton: { 
//     marginLeft: 4, 
//     padding: 10, 
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
//   mediaImage: { width: width * 0.5, height: width * 0.4, borderRadius: 8 },
//   mediaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8
//   },
//   mediaText: {
//     marginLeft: 8,
//     fontSize: 14
//   },
//   audioContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     minWidth: 120
//   },
//   audioText: {
//     marginLeft: 8,
//     fontSize: 14
//   },
//   documentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     minWidth: 150
//   },
//   documentText: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14
//   },
//   uploadingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 10,
//     backgroundColor: '#f0f8ff'
//   },
//   uploadingText: { marginLeft: 8, color: '#0084FF', fontSize: 14 },
//   recordingButton: { backgroundColor: '#ffebee' },
//   disabledButton: { opacity: 0.5 }
// });