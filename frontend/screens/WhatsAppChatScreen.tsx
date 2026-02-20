import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, Dimensions, ActivityIndicator, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Video } from 'expo-av';

type ChatRouteParams = { id: string; name: string; avatar: string; baseUrl?: string };
type Message = { 
  id: string; 
  text?: string; 
  sender: 'me' | 'other'; 
  type: 'text' | 'image' | 'video' | 'audio' | 'document'; 
  media_url?: string; 
  filename?: string; 
  time: string; 
  timestamp: number; 
  status?: 'sent' | 'delivered' | 'read'; 
  duration?: number; // for audio/video
  file_size?: number; // for documents
};

type MediaAsset = {
  uri?: string;
  name?: string;
  filename?: string;
  mimeType?: string;
  blob?: Blob;
};

const { width } = Dimensions.get('window');
const DEFAULT_BASE_URL = 'http://192.168.137.16:4000';

export default function WhatsAppChatScreen() {
  const route = useRoute<any>();
  const { id, name, avatar, baseUrl } = route.params as ChatRouteParams;
  const BASE_URL = baseUrl || DEFAULT_BASE_URL;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Recording state (native)
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Recording state (web)
  const mediaStreamRef = useRef<MediaStream | null>(null as any);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null as any);
  const mediaChunksRef = useRef<BlobPart[]>([]);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  // ------------------ FETCH MESSAGES ------------------
  const fetchMessages = async () => {
    try {
      const [sentRes, recvRes] = await Promise.all([
        fetch(`${BASE_URL}/whatsapp/sent`),
        fetch(`${BASE_URL}/whatsapp/received`)
      ]);
      const sentData = await sentRes.json();
      const recvData = await recvRes.json();

      const combined: Message[] = [
        ...sentData.map((m: any) => ({
          id: String(m.id),
          text: m.text,
          sender: 'me' as const,
          type: m.type || 'text',
          media_url: m.media_url,
          filename: m.filename,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.timestamp,
          status: m.status,
          duration: m.duration,
          file_size: m.file_size
        })),
        ...recvData.map((m: any) => ({
          id: String(m.id),
          text: m.text,
          sender: 'other' as const,
          type: m.type || 'text',
          media_url: m.media_url,
          filename: m.filename,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.timestamp,
          duration: m.duration,
          file_size: m.file_size
        }))
      ];

      combined.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(combined);

      // Mark messages as read when fetched
      await markMessagesAsRead();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Fetch WhatsApp messages error:', errorMessage);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      await fetch(`${BASE_URL}/whatsapp/mark-read`, { method: 'POST' });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { 
      if (pollRef.current) clearInterval(pollRef.current); 
      if (recording) recording.stopAndUnloadAsync().catch(()=>{});
      if (soundRef.current) soundRef.current.unloadAsync().catch(()=>{});
      // cleanup web stream if any
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      // cleanup video refs
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.unloadAsync?.().catch(() => {});
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ------------------ HELPERS ------------------
  const extFromMime = (mime: string) => {
    if (!mime) return 'bin';
    if (mime.includes('ogg')) return 'ogg';
    if (mime.includes('opus')) return 'opus.ogg';
    if (mime.includes('aac')) return 'aac';
    if (mime.includes('mpeg')) return 'mp3';
    if (mime.includes('mp4')) return 'm4a';
    if (mime.includes('amr')) return 'amr';
    return 'bin';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ------------------ AUDIO PLAYBACK ------------------
  const playAudio = async (mediaUrl: string, messageId: string) => {
    try {
      if (playingAudio === messageId) {
        // Stop current audio
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setPlayingAudio(null);
        return;
      }

      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: `${BASE_URL}${mediaUrl}` },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setPlayingAudio(messageId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  // ------------------ VIDEO PLAYBACK ------------------
  const toggleVideoPlayback = async (messageId: string) => {
    try {
      const video = videoRefs.current[messageId];
      if (!video) return;

      if (playingVideo === messageId) {
        // Pause current video
        await video.pauseAsync();
        setPlayingVideo(null);
      } else {
        // Stop other videos first
        if (playingVideo && videoRefs.current[playingVideo]) {
          await videoRefs.current[playingVideo]!.pauseAsync();
        }
        
        // Play this video
        await video.playAsync();
        setPlayingVideo(messageId);
      }
    } catch (err) {
      console.error('Video playback error:', err);
      Alert.alert('Error', 'Failed to control video playback');
    }
  };

  const onVideoPlaybackStatusUpdate = (messageId: string) => (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      setPlayingVideo(null);
    }
    if (status.isLoaded && !status.isPlaying && playingVideo === messageId) {
      setPlayingVideo(null);
    }
  };

  // ------------------ DOCUMENT OPENING ------------------
  const openDocument = async (mediaUrl: string, filename?: string) => {
    try {
      const fullUrl = `${BASE_URL}${mediaUrl}`;
      if (Platform.OS === 'web') {
        window.open(fullUrl, '_blank');
      } else {
        const supported = await Linking.canOpenURL(fullUrl);
        if (supported) {
          await Linking.openURL(fullUrl);
        } else {
          Alert.alert('Cannot open file', 'No app found to open this file type');
        }
      }
    } catch (err) {
      console.error('Document open error:', err);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  // ------------------ SEND MEDIA (URI OR BLOB) ------------------
  const sendMedia = async (asset: MediaAsset, type: 'image'|'video'|'audio'|'document') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);

      let fileName =
        asset.name ||
        asset.filename ||
        (asset.uri ? asset.uri.split('/').pop() : undefined) ||
        `file.${type}`;
      let mimeType = asset.mimeType || 'application/octet-stream';

      if (type === 'image' && mimeType === 'application/octet-stream') mimeType = 'image/jpeg';
      if (type === 'video' && mimeType === 'application/octet-stream') mimeType = 'video/mp4';
      if (type === 'audio' && mimeType === 'application/octet-stream') mimeType = 'audio/m4a';

      if (type === 'audio' && fileName && !/\.(aac|m4a|mp3|amr|ogg|opus)$/i.test(fileName)) {
        fileName = `voice.${extFromMime(mimeType)}`;
      }

      if (asset.blob) {
        const webFile = new File([asset.blob], fileName, { type: mimeType });
        formData.append('file', webFile);
      } else if (Platform.OS === 'web') {
        if (!asset.uri) throw new Error('Missing asset uri for web upload');
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const webFile = new File([blob], fileName, { type: mimeType });
        formData.append('file', webFile);
      } else {
        if (!asset.uri) throw new Error('Missing asset uri');
        const file: any = { uri: asset.uri, name: fileName, type: mimeType };
        formData.append('file', file);
      }

      const res = await fetch(`${BASE_URL}/whatsapp/send-media`, { method: 'POST', body: formData });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`WhatsApp media upload failed: ${txt}`);
      }
      fetchMessages();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Send WhatsApp media error:', errorMessage);
      Alert.alert('Error', `Failed to send ${type}: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const sendRecordedAudioBlobWeb = async (blob: Blob, mime: string) => {
    const ext = extFromMime(mime);
    const filename = `voice.${ext}`;
    await sendMedia({ blob, name: filename, mimeType: mime }, 'audio');
  };

  // ------------------ SEND TEXT ------------------
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setIsSending(true); setInputText('');
    try {
      await fetch(`${BASE_URL}/whatsapp/send`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text }) 
      });
      fetchMessages();
    } catch (err: unknown) { 
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Send WhatsApp text error:', errorMessage); 
      Alert.alert('Error', 'Failed to send text'); 
      setInputText(text); 
    }
    finally { setIsSending(false); }
  };

  // ------------------ PICK IMAGE/VIDEO ------------------
  const pickImageOrVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.7,
        allowsEditing: false
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mediaType = asset.type === 'video' ? 'video' : 'image';
        const mime = (asset as any).mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
        await sendMedia({ uri: asset.uri, name: asset.fileName || asset.uri.split('/').pop(), mimeType: mime }, mediaType as 'image' | 'video');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Pick WhatsApp image/video error:', errorMessage);
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
        const asset = result.assets[0] as MediaAsset;
        asset.mimeType = asset.mimeType || 'application/octet-stream';
        await sendMedia(asset, 'document');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Pick WhatsApp document error:', errorMessage);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // ------------------ VOICE RECORDING ------------------
  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaChunksRef.current = [];

        const stream = await (navigator.mediaDevices as any).getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        let preferredType = '';
        if ((window as any).MediaRecorder && (window as any).MediaRecorder.isTypeSupported) {
          if ((window as any).MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
            preferredType = 'audio/ogg; codecs=opus';
          } else if ((window as any).MediaRecorder.isTypeSupported('audio/ogg')) {
            preferredType = 'audio/ogg';
          } else if ((window as any).MediaRecorder.isTypeSupported('audio/mp4')) {
            preferredType = 'audio/mp4';
          } else {
            Alert.alert('Recording format not supported', 'Your browser does not support OGG/MP4 audio recording. Please use mobile (Android/iOS) or a different browser.');
            stream.getTracks().forEach((t: any) => t.stop());
            return;
          }
        }

        const mediaRecorder: any = new (window as any).MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } else {
        if (recording) {
          await recording.stopAndUnloadAsync();
          setRecording(null);
        }

        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed');
        
        await Audio.setAudioModeAsync({ 
          allowsRecordingIOS: true, 
          playsInSilentModeIOS: true 
        });
        
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording); 
        setIsRecording(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('WhatsApp start recording error:', errorMessage);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);

      if (Platform.OS === 'web') {
        if (!mediaRecorderRef.current) return;
        const mr: any = mediaRecorderRef.current;
        if (mr.state !== 'inactive') mr.stop();

        await new Promise(res => setTimeout(res, 100));

        const mime = mr.mimeType || (mr.options && mr.options.mimeType) || 'audio/ogg';
        const blob = new Blob(mediaChunksRef.current, { type: mime });

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t: any) => t.stop());
          mediaStreamRef.current = null as any;
        }
        mediaRecorderRef.current = null as any;
        mediaChunksRef.current = [];

        await sendRecordedAudioBlobWeb(blob, mime);
      } else {
        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          await sendMedia({ uri, name: 'voice.m4a', mimeType: 'audio/m4a' }, 'audio');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('WhatsApp stop recording error:', errorMessage);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // ------------------ RENDER MESSAGE COMPONENTS ------------------
  const renderVideoMessage = (item: Message) => {
    if (!item.media_url) return null;
    
    const isPlaying = playingVideo === item.id;
    
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => { videoRefs.current[item.id] = ref; }}
          source={{ uri: `${BASE_URL}${item.media_url}` }}
          style={styles.videoPlayer}
          resizeMode="contain"
          shouldPlay={false}
          isLooping={false}
          onPlaybackStatusUpdate={onVideoPlaybackStatusUpdate(item.id)}
        />
        <TouchableOpacity 
          style={styles.videoPlayButton}
          onPress={() => toggleVideoPlayback(item.id)}
        >
          <View style={styles.playButtonBackground}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#fff" 
            />
          </View>
        </TouchableOpacity>
        {item.duration && (
          <View style={styles.videoDurationBadge}>
            <Text style={styles.videoDurationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAudioMessage = (item: Message, textColor: string) => {
    if (!item.media_url) return null;
    
    const isPlaying = playingAudio === item.id;
    
    return (
      <TouchableOpacity 
        style={styles.audioContainer}
        onPress={() => playAudio(item.media_url!, item.id)}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color={textColor} 
        />
        <View style={styles.audioInfo}>
          <Text style={[styles.audioFilename, { color: textColor }]}>
            {item.filename || 'Voice message'}
          </Text>
          {item.duration && (
            <Text style={[styles.audioDuration, { color: textColor }]}>
              {formatDuration(item.duration)}
            </Text>
          )}
        </View>
        <Ionicons name="volume-high" size={20} color={textColor} />
      </TouchableOpacity>
    );
  };

  const renderDocumentMessage = (item: Message, textColor: string) => {
    if (!item.media_url) return null;
    
    return (
      <TouchableOpacity 
        style={styles.documentContainer}
        onPress={() => openDocument(item.media_url!, item.filename)}
      >
        <Ionicons name="document" size={32} color={textColor} />
        <View style={styles.documentInfo}>
          <Text style={[styles.documentFilename, { color: textColor }]}>
            {item.filename || 'Document'}
          </Text>
          {item.file_size && (
            <Text style={[styles.documentSize, { color: textColor }]}>
              {formatFileSize(item.file_size)}
            </Text>
          )}
        </View>
        <Ionicons name="download" size={20} color={textColor} />
      </TouchableOpacity>
    );
  };

  // ------------------ RENDER MESSAGE ------------------
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    const bubbleStyle = [styles.bubble, isMe ? styles.whatsappSent : styles.received];
    const textColor = isMe ? '#fff' : '#000';
    
    return (
      <View style={[styles.messageRow, isMe ? {justifyContent:'flex-end'} : {justifyContent:'flex-start'}]}>
        {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View style={bubbleStyle}>
          {item.type === 'text' && <Text style={[styles.messageText, {color: textColor}]}>{item.text}</Text>}
          {item.type === 'image' && !!item.media_url && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: `${BASE_URL}${item.media_url}` }} style={styles.mediaImage} />
            </View>
          )}
          {item.type === 'video' && renderVideoMessage(item)}
          {item.type === 'audio' && renderAudioMessage(item, textColor)}
          {item.type === 'document' && renderDocumentMessage(item, textColor)}
          
          <View style={styles.messageFooter}>
            <Text style={[styles.timeText, {color: isMe ? '#fff' : '#666'}]}>{item.time}</Text>
            {isMe && item.status && (
              <View style={styles.statusContainer}>
                <Ionicons 
                  name="checkmark" 
                  size={12} 
                  color={item.status === 'read' ? '#4FC3F7' : '#fff'} 
                />
                {(item.status === 'delivered' || item.status === 'read') && (
                  <Ionicons 
                    name="checkmark" 
                    size={12} 
                    color={item.status === 'read' ? '#4FC3F7' : '#fff'}
                    style={{ marginLeft: -4 }} 
                  />
                )}
              </View>
            )}
          </View>
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
            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
            <Text style={styles.platformText}>WhatsApp</Text>
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
          <ActivityIndicator size="small" color="#25D366" />
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
          <Ionicons name="send" size={20} color={(!inputText.trim() || isSending) ? "#ccc" : "#25D366"}/>
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
    height: 90, 
    paddingHorizontal: 15, 
    backgroundColor: '#25D366', 
    paddingTop: 20
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerInfo: { marginLeft: 10, flex: 1 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  platformRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  platformText: { fontSize: 12, marginLeft: 4, color: '#fff' },
  messageRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
  bubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
  whatsappSent: { backgroundColor: '#25D366', borderTopRightRadius: 0 },
  received: { backgroundColor: '#e5e5ea', borderTopLeftRadius: 0 },
  messageText: { fontSize: 14, lineHeight: 18 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  timeText: { fontSize: 10 },
  statusContainer: { flexDirection: 'row', marginLeft: 4 },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', paddingHorizontal: 12 },
  sendButton: { marginLeft: 8, padding: 10, borderRadius: 20 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
  
  // Media components
  mediaContainer: { marginBottom: 4 },
  mediaImage: { width: width * 0.5, height: width * 0.4, borderRadius: 8 },
  mediaFilename: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  mediaDuration: { fontSize: 10, marginTop: 2, opacity: 0.7 },
  
  // Enhanced Video player styles
  videoContainer: { 
    position: 'relative',
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  videoPlayer: { 
    width: width * 0.6, 
    height: width * 0.9, 
    backgroundColor: '#000'
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1
  },
  playButtonBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  
  // Audio components
  audioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    minWidth: 200, 
    paddingVertical: 4 
  },
  audioInfo: { flex: 1, marginLeft: 8 },
  audioFilename: { fontSize: 14, fontWeight: '500' },
  audioDuration: { fontSize: 12, marginTop: 2, opacity: 0.7 },
  
  // Document components
  documentContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    minWidth: 200, 
    paddingVertical: 4 
  },
  documentInfo: { flex: 1, marginLeft: 8 },
  documentFilename: { fontSize: 14, fontWeight: '500' },
  documentSize: { fontSize: 12, marginTop: 2, opacity: 0.7 },
  
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#e8f5e8'
  },
  uploadingText: { marginLeft: 8, color: '#25D366', fontSize: 14 },
  recordingButton: { backgroundColor: '#ffebee' },
  disabledButton: { opacity: 0.5 }
});