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
// type Message = { id: string; text?: string; sender: 'me' | 'other'; type: 'text' | 'image' | 'video' | 'audio' | 'document'; media_url?: string; filename?: string; time: string; timestamp: number; status?: 'sent' | 'delivered' | 'read'; };

// const { width } = Dimensions.get('window');
// const DEFAULT_BASE_URL = 'http://localhost:4000';

// export default function ChatScreen() {
//   const route = useRoute<any>();
//   const { id, name, avatar, baseUrl } = route.params as ChatRouteParams;
//   const BASE_URL = baseUrl || DEFAULT_BASE_URL;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);

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
//       console.error('Fetch messages error:', err);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     pollRef.current = setInterval(fetchMessages, 3000);
//     return () => { 
//       if (pollRef.current) clearInterval(pollRef.current); 
//       if (recording) recording.stopAndUnloadAsync(); 
//     };
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, [messages]);

//   // ------------------ SEND TEXT ------------------
//   const sendMessage = async () => {
//     const text = inputText.trim();
//     if (!text || isSending) return;
//     setIsSending(true); setInputText('');
//     try {
//       await fetch(`${BASE_URL}/messenger/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
//       fetchMessages();
//     } catch (err) { console.error('Send text error:', err); Alert.alert('Error', 'Failed to send text'); setInputText(text); }
//     finally { setIsSending(false); }
//   };

//   // ------------------ SEND MEDIA ------------------
//   const sendMedia = async (asset: any, type: 'image'|'video'|'audio'|'document') => {
//     if (!asset.uri) return;
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('type', type);
      
//       // Fix the file object structure for React Native
//       let fileName = asset.name || asset.filename || asset.uri.split('/').pop() || `file.${type}`;
      
//       // Handle different asset types properly
//       let mimeType = asset.mimeType || 'application/octet-stream';
//       if (type === 'image') {
//         mimeType = asset.mimeType || 'image/jpeg';
//       } else if (type === 'video') {
//         mimeType = asset.mimeType || 'video/mp4';
//       } else if (type === 'audio') {
//         mimeType = asset.mimeType || 'audio/m4a';
//       } else if (type === 'document') {
//         mimeType = asset.mimeType || 'application/octet-stream';
//       }

//       // Handle different URI types for web
//       if (Platform.OS === 'web') {
//         if (asset.uri.startsWith('data:')) {
//           // Convert base64 data URI to Blob for web
//           const response = await fetch(asset.uri);
//           const blob = await response.blob();
//           formData.append('file', blob, fileName);
//         } else if (asset.uri.startsWith('blob:')) {
//           // Handle blob URLs (from audio recordings)
//           const response = await fetch(asset.uri);
//           const blob = await response.blob();
//           formData.append('file', blob, fileName);
//         } else {
//           // Handle regular file objects
//           formData.append('file', asset, fileName);
//         }
//       } else {
//         // Create the file object properly for React Native
//         const file = {
//           uri: asset.uri,
//           name: fileName,
//           type: mimeType
//         } as any;
//         formData.append('file', file);
//       }

//       console.log('Sending media:', { type, fileName, mimeType, uri: asset.uri.substring(0, 100) + '...' });

//       const res = await fetch(`${BASE_URL}/messenger/send-media`, { 
//         method: 'POST', 
//         body: formData
//         // DO NOT set Content-Type header - let the browser set it automatically with boundary
//       });
      
//       if (!res.ok) { 
//         const txt = await res.text(); 
//         console.error('Media send error response:', txt); 
//         throw new Error(`Media upload failed: ${txt}`); 
//       }

//       fetchMessages();
//     } catch (err) { 
//       console.error('Send media error:', err); 
//       Alert.alert('Error', `Failed to send ${type}: ${err.message || err}`); 
//     }
//     finally { setIsUploading(false); }
//   };

//   // ------------------ PICK IMAGE/VIDEO ------------------
//   const pickImageOrVideo = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') return Alert.alert('Permission needed');
    
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({ 
//         mediaTypes: ['images', 'videos'], // Fixed deprecated MediaTypeOptions
//         quality: 0.7,
//         allowsEditing: false
//       });
      
//       if (!result.canceled && result.assets[0]) {
//         const asset = result.assets[0];
//         const mediaType = asset.type === 'video' ? 'video' : 'image';
//         await sendMedia(asset, mediaType);
//       }
//     } catch (err) {
//       console.error('Pick image/video error:', err);
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
      
//       console.log('Document picker result:', result);
      
//       if (!result.canceled && result.assets && result.assets[0]) {
//         const asset = result.assets[0];
//         // Ensure we have proper mimeType for documents
//         asset.mimeType = asset.mimeType || 'application/octet-stream';
//         await sendMedia(asset, 'document');
//       } else if (result.type === 'success') {
//         // Handle older API format
//         result.mimeType = result.mimeType || 'application/octet-stream';
//         await sendMedia(result, 'document');
//       }
//     } catch (err) {
//       console.error('Pick document error:', err);
//       Alert.alert('Error', 'Failed to pick document');
//     }
//   };

//   // ------------------ VOICE RECORDING ------------------
//   const startRecording = async () => {
//     try {
//       // Stop any existing recording first
//       if (recording) {
//         await recording.stopAndUnloadAsync();
//         setRecording(null);
//       }

//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') return Alert.alert('Permission needed');
      
//       await Audio.setAudioModeAsync({ 
//         allowsRecordingIOS: true, 
//         playsInSilentModeIOS: true 
//       });
      
//       console.log('Starting recording...');
//       const { recording: newRecording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
      
//       setRecording(newRecording); 
//       setIsRecording(true);
//     } catch (err) {
//       console.error('Start recording error:', err);
//       Alert.alert('Error', 'Failed to start recording');
//     }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
    
//     try {
//       setIsRecording(false);
//       console.log('Stopping recording...');
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);
      
//       if (uri) {
//         await sendMedia({ uri, name: 'voice.m4a' }, 'audio');
//       }
//     } catch (err) {
//       console.error('Stop recording error:', err);
//       Alert.alert('Error', 'Failed to stop recording');
//     }
//   };

//   // ------------------ RENDER ------------------
//   const renderMessage = ({ item }: { item: Message }) => {
//     const isMe = item.sender==='me';
//     const bubbleStyle = [styles.bubble, isMe ? styles.messengerSent : styles.received];
//     const textColor = isMe?'#fff':'#000';
//     return (
//       <View style={[styles.messageRow, isMe?{justifyContent:'flex-end'}:{justifyContent:'flex-start'}]}>
//         {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
//         <View style={bubbleStyle}>
//           {item.type==='text' && <Text style={[styles.messageText,{color:textColor}]}>{item.text}</Text>}
//           {item.type==='image' && <Image source={{ uri: `${BASE_URL}${item.media_url}` }} style={styles.mediaImage} />}
//           {item.type==='video' && <Text style={{color:textColor}}>[Video] {item.filename}</Text>}
//           {item.type==='audio' && <Text style={{color:textColor}}>[Audio] {item.filename}</Text>}
//           {item.type==='document' && <Text style={{color:textColor}}>[Document] {item.filename}</Text>}
//           <Text style={[styles.timeText,{color:isMe?'#fff':'#666', fontSize:10}]}>{item.time}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={90}>
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item=>item.id}
//         renderItem={renderMessage}
//         contentContainerStyle={{ padding:12 }}
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
//           <Ionicons name="send" size={20} color={(!inputText.trim() || isSending) ? "#ccc" : "#0084FF"}/>
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
//   container:{flex:1,backgroundColor:'#f5f5f5'},
//   messageRow:{flexDirection:'row',marginVertical:4,alignItems:'flex-end'},
//   bubble:{padding:10,borderRadius:12,maxWidth:'75%'},
//   messengerSent:{backgroundColor:'#0084FF',borderTopRightRadius:0},
//   received:{backgroundColor:'#e5e5ea',borderTopLeftRadius:0},
//   messageText:{fontSize:14,lineHeight:18},
//   timeText:{fontSize:10,marginTop:2},
//   inputContainer:{flexDirection:'row',padding:10,backgroundColor:'#fff',alignItems:'center'},
//   input:{flex:1,height:40,borderRadius:20,backgroundColor:'#f0f0f0',paddingHorizontal:12},
//   sendButton:{marginLeft:8,padding:10,borderRadius:20},
//   avatar:{width:32,height:32,borderRadius:16,marginRight:6},
//   mediaImage:{width:width*0.5,height:width*0.4,borderRadius:8},
//   uploadingIndicator:{
//     flexDirection:'row',
//     alignItems:'center',
//     justifyContent:'center',
//     padding:10,
//     backgroundColor:'#f0f8ff'
//   },
//   uploadingText:{
//     marginLeft:8,
//     color:'#0084FF',
//     fontSize:14
//   },
//   recordingButton:{
//     backgroundColor:'#ffebee'
//   },
//   disabledButton:{
//     opacity:0.5
//   }
// });




// import React, { useEffect, useRef, useState } from 'react';
// import { 
//   View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, Dimensions, ActivityIndicator 
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute } from '@react-navigation/native';
// import * as DocumentPicker from 'expo-document-picker';
// import * as ImagePicker from 'expo-image-picker';
// import { Audio, AVPlaybackStatus } from 'expo-av';

// type ChatRouteParams = { 
//   id: string; 
//   name: string; 
//   avatar: string; 
//   baseUrl?: string 
// };

// type Message = { 
//   id: string; 
//   text?: string; 
//   sender: 'me' | 'other'; 
//   time: string; 
//   timestamp?: number;
//   type: 'text' | 'image' | 'audio' | 'video' | 'document';
//   media_url?: string;
//   filename?: string;
//   status?: 'sent' | 'delivered' | 'read';
// };

// const DEFAULT_BASE_URL = 'http://localhost:4000';
// const { width } = Dimensions.get('window');

// export default function ChatScreen() {
//   const route = useRoute<any>();
//   const { id, name, avatar, baseUrl } = route.params as ChatRouteParams;
//   const BASE_URL = baseUrl || DEFAULT_BASE_URL;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [playingId, setPlayingId] = useState<string | null>(null);

//   const pollRef = useRef<NodeJS.Timeout | null>(null);
//   const flatListRef = useRef<FlatList>(null);
//   const soundRef = useRef<Audio.Sound | null>(null);

//   // ---------------- FETCH MESSAGES ----------------
//   const fetchMessages = async () => {
//     try {
//       const [sentRes, recvRes] = await Promise.all([
//         fetch(`${BASE_URL}/messenger/sent?recipientId=${id}`),
//         fetch(`${BASE_URL}/messenger/received?recipientId=${id}`)
//       ]);
//       const sentData = (await sentRes.json()) as any[];
//       const recvData = (await recvRes.json()) as any[];

//       const allMessages: Message[] = [
//         ...sentData.map(m => ({
//           id: String(m.id),
//           text: m.text,
//           sender: 'me' as 'me',
//           time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           timestamp: m.timestamp,
//           type: m.type,
//           media_url: m.media_url,
//           filename: m.filename
//         })),
//         ...recvData.map(m => ({
//           id: String(m.id),
//           text: m.text,
//           sender: 'other' as 'other',
//           time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           timestamp: m.timestamp,
//           type: m.type,
//           media_url: m.media_url,
//           filename: m.filename
//         }))
//       ];

//       allMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
//       setMessages(allMessages);
//     } catch (err) {
//       console.error('Fetch Messenger messages error:', err);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     pollRef.current = setInterval(fetchMessages, 3000);
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//       if (recording) recording.stopAndUnloadAsync();
//       if (soundRef.current) soundRef.current.unloadAsync();
//     };
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     }
//   }, [messages]);

//   // ---------------- SEND TEXT MESSAGE ----------------
//   const sendMessage = async () => {
//     const text = inputText.trim();
//     if (!text || isSending) return;

//     setIsSending(true);
//     setInputText('');

//     try {
//       await fetch(`${BASE_URL}/messenger/send`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ recipientId: id, text }),
//       });
//       fetchMessages();
//     } catch (err) {
//       console.error('Send Messenger message error:', err);
//       Alert.alert('Error', 'Failed to send message');
//       setInputText(text);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // ---------------- MEDIA PICKER ----------------
//   const showMediaPicker = () => {
//     Alert.alert(
//       'Select Media',
//       'Choose media type to send',
//       [
//         { text: 'Photo/Video', onPress: openImagePicker },
//         { text: 'Document', onPress: openDocumentPicker },
//         { text: 'Cancel', style: 'cancel' }
//       ]
//     );
//   };

//   const openImagePicker = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') return Alert.alert('Permission needed', 'Media library permission is required');

//     const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.7 });
//     if (!result.canceled && result.assets[0]) sendMedia(result.assets[0]);
//   };

//   const openDocumentPicker = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
//       if (result.type === 'success' && result.uri) sendMedia(result);
//     } catch (err) {
//       console.error('Document picker error:', err);
//     }
//   };

//   // ---------------- SEND MEDIA ----------------
//   const sendMedia = async (asset: any) => {
//     if (!asset.uri) return;
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       const filename = asset.name || asset.fileName || asset.uri.split('/').pop() || 'file';
//       let mimeType = asset.type || asset.mimeType || 'application/octet-stream';
//       let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';

//       if (mimeType.startsWith('image/')) mediaType = 'image';
//       else if (mimeType.startsWith('video/')) mediaType = 'video';
//       else if (mimeType.startsWith('audio/')) { mediaType = 'audio'; mimeType = 'audio/mpeg'; }

//       formData.append('file', { uri: asset.uri, type: mimeType, name: filename } as any);
//       formData.append('type', mediaType);
//       formData.append('recipientId', id);

//       const response = await fetch(`${BASE_URL}/messenger/send-media`, {
//         method: 'POST',
//         body: formData // ❌ remove headers
//       });

//       if (!response.ok) throw new Error('Media upload failed');

//       fetchMessages();
//     } catch (err) {
//       console.error('Send media error:', err);
//       Alert.alert('Error', 'Failed to send media');
//     } finally { setIsUploading(false); }
//   };

//   // ---------------- VOICE RECORDING ----------------
//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') return Alert.alert('Permission needed', 'Microphone permission is required');

//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//       setIsRecording(true);
//     } catch (err) { console.error('Recording start error:', err); }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
//     setIsRecording(false);
//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecording(null);
//       if (uri) await sendMedia({ uri, type: 'audio', name: 'voice.mp3' });
//     } catch (err) { console.error('Recording stop error:', err); }
//   };

//   // ---------------- PLAY VOICE ----------------
//   const togglePlay = async (item: Message) => {
//     try {
//       if (playingId === item.id) {
//         await soundRef.current?.stopAsync();
//         setPlayingId(null);
//       } else {
//         if (soundRef.current) await soundRef.current.unloadAsync();
//         const { sound } = await Audio.Sound.createAsync({ uri: item.media_url! });
//         soundRef.current = sound;
//         setPlayingId(item.id);
//         await sound.playAsync();
//         sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
//           if ('didJustFinish' in status && status.didJustFinish) setPlayingId(null);
//         });
//       }
//     } catch (err) {
//       console.error('Toggle play error:', err);
//       Alert.alert('Error', 'Cannot play audio');
//     }
//   };

//   // ---------------- RENDER MESSAGE ----------------
//   const renderMessageItem = ({ item }: { item: Message }) => {
//     const isMe = item.sender === 'me';
//     return (
//       <View style={[styles.messageRow, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
//         {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
//         <View style={[styles.bubble, isMe ? styles.messengerSent : styles.received]}>
//           {item.type === 'text' && <Text style={[styles.messageText, { color: isMe ? '#fff' : '#000' }]}>{item.text}</Text>}
//           {item.type === 'image' && <Image source={{ uri: item.media_url }} style={styles.mediaImage} />}
//           {item.type === 'document' && <Text style={[styles.messageText, { color: isMe ? '#fff' : '#000' }]}>{item.filename || 'Document'}</Text>}
//           {item.type === 'audio' && (
//             <TouchableOpacity onPress={() => togglePlay(item)}>
//               <Text style={{ color: '#0084FF', fontWeight: 'bold' }}>{playingId === item.id ? '⏹ Stop' : '▶ Play Voice'}</Text>
//             </TouchableOpacity>
//           )}
//           <Text style={[styles.timeText, { color: isMe ? '#fff' : '#666', fontSize: 10 }]}>{item.time}</Text>
//         </View>
//       </View>
//     );
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={renderMessageItem}
//         contentContainerStyle={{ padding: 12 }}
//         showsVerticalScrollIndicator={false}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message"
//           style={styles.input}
//           multiline={false}
//           onSubmitEditing={sendMessage}
//           editable={!isSending && !isRecording}
//         />
//         <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.voiceButton}>
//           <Ionicons name={isRecording ? "stop" : "mic"} size={20} color="#666" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//           <Ionicons name="send" size={24} color="#0084FF" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={showMediaPicker} style={styles.sendButton}>
//           <Ionicons name="attach" size={24} color="#666" />
//         </TouchableOpacity>
//       </View>
//       {isUploading && <ActivityIndicator size="large" color="#0084FF" style={{ position: 'absolute', top: 10, right: 10 }} />}
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   messageRow: { flexDirection: 'row', marginVertical: 4, alignItems: 'flex-end' },
//   bubble: { padding: 10, borderRadius: 12, maxWidth: '75%' },
//   messengerSent: { backgroundColor: '#0084FF', borderTopRightRadius: 0 },
//   received: { backgroundColor: '#e5e5ea', borderTopLeftRadius: 0 },
//   messageText: { fontSize: 14, lineHeight: 18 },
//   timeText: { fontSize: 10, marginTop: 2 },
//   inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
//   input: { flex: 1, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', paddingHorizontal: 12 },
//   voiceButton: { marginLeft: 8, padding: 10, borderRadius: 20 },
//   sendButton: { marginLeft: 8, padding: 10, borderRadius: 20 },
//   avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 6 },
//   mediaImage: { width: width * 0.5, height: width * 0.4, borderRadius: 8 },
// });



// import React, { useEffect, useRef, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   FlatList, 
//   StyleSheet, 
//   KeyboardAvoidingView, 
//   Platform, 
//   Image, 
//   Alert,
//   Dimensions,
//   ActivityIndicator
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute } from '@react-navigation/native';
// import * as DocumentPicker from 'expo-document-picker';
// import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';

// type ChatRouteParams = { 
//   id: string; 
//   name: string; 
//   avatar: string; 
//   platform: 'whatsapp' | 'messenger'; 
//   baseUrl?: string 
// };

// type Message = { 
//   id: string; 
//   text?: string; 
//   sender: 'me' | 'other'; 
//   time: string; 
//   platform?: string; 
//   timestamp?: number;
//   type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'contacts';
//   media_url?: string;
//   filename?: string;
//   contact_name?: string;
//   contact_phone?: string;
//   status?: 'sent' | 'delivered' | 'read';
// };

// const DEFAULT_BASE_URL = 'http://192.168.137.68:4000';
// const { width } = Dimensions.get('window');

// export default function ChatScreen() {
//   const route = useRoute<any>();
//   const { id, name, avatar, platform, baseUrl } = route.params as ChatRouteParams;
//   const BASE_URL = baseUrl || DEFAULT_BASE_URL;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputText, setInputText] = useState('');
//   const [isSending, setIsSending] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const pollRef = useRef<NodeJS.Timeout | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   // ---------------- FETCH MESSAGES ----------------
//   async function fetchMessages() {
//     try {
//       // Fetch both sent and received messages for WhatsApp
//       if (platform === 'whatsapp') {
//         const [sentRes, recvRes] = await Promise.all([
//           fetch(`${BASE_URL}/whatsapp/sent`),
//           fetch(`${BASE_URL}/whatsapp/received`)
//         ]);
        
//         const sent = await sentRes.json();
//         const received = await recvRes.json();

//         const allMessages: Message[] = [
//           ...sent.map((m: any) => ({
//             id: String(m.id),
//             text: m.text,
//             sender: 'me' as const,
//             time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             platform,
//             timestamp: m.timestamp,
//             type: m.type || 'text',
//             media_url: m.media_url,
//             filename: m.filename,
//             contact_name: m.contact_name,
//             contact_phone: m.contact_phone,
//             status: m.status
//           })),
//           ...received.map((m: any) => ({
//             id: String(m.id),
//             text: m.text,
//             sender: 'other' as const,
//             time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             platform,
//             timestamp: m.timestamp,
//             type: m.type || 'text',
//             media_url: m.media_url,
//             filename: m.filename,
//             contact_name: m.contact_name,
//             contact_phone: m.contact_phone,
//             status: m.status
//           }))
//         ];

//         // Sort by timestamp
//         allMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
//         setMessages(allMessages);
//       } else {
//         // Fallback for messenger
//         const queryParam = `?recipientId=${id}`;
//         const res = await fetch(`${BASE_URL}/messages${queryParam}`);
//         const data: any = await res.json();
//         const rawMessages: any[] = Array.isArray(data) ? data : data?.messages ?? [];

//         const processedMessages: Message[] = rawMessages.map(m => {
//           const ts = m.timestamp ? new Date(m.timestamp) : new Date();
//           return {
//             id: String(m.id ?? `${m.senderId || 'other'}-${m.timestamp || ts.getTime()}`),
//             text: String(m.text ?? ''),
//             sender: m.from === 'me' || m.senderId === 'me' ? 'me' : 'other',
//             time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             platform,
//             timestamp: m.timestamp || ts.getTime(),
//             type: 'text'
//           };
//         });

//         setMessages(processedMessages);
//       }
//     } catch (e) {
//       console.error('Fetch messages error:', e);
//     }
//   }

//   useEffect(() => {
//     fetchMessages();
//     pollRef.current = setInterval(fetchMessages, 3000);
//     return () => { 
//       if (pollRef.current) clearInterval(pollRef.current);
//       if (recording) {
//         recording.stopAndUnloadAsync();
//       }
//     };
//   }, []);

//   // Auto scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (messages.length > 0) {
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//     }
//   }, [messages]);

//   // ---------------- SEND TEXT MESSAGE ----------------
//   const sendMessage = async () => {
//     const text = inputText.trim();
//     if (!text || isSending) return;

//     setIsSending(true);
//     setInputText('');

//     try {
//       if (platform === 'whatsapp') {
//         await fetch(`${BASE_URL}/whatsapp/send`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ text }),
//         });
//       } else {
//         await fetch(`${BASE_URL}/send`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ recipientId: id, text, platform }),
//         });
//       }
      
//       // Refresh messages
//       fetchMessages();
//     } catch (err) {
//       console.error('Send message error:', err);
//       Alert.alert('Error', 'Failed to send message');
//       setInputText(text); // Restore text on error
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // ---------------- MEDIA PICKER ----------------
//   const showMediaPicker = () => {
//     Alert.alert(
//       'Select Media',
//       'Choose media type to send',
//       [
//         { text: 'Camera', onPress: openCamera },
//         { text: 'Photo Library', onPress: openImagePicker },
//         { text: 'Document', onPress: openDocumentPicker },
//         { text: 'Cancel', style: 'cancel' }
//       ]
//     );
//   };

//   const openCamera = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission needed', 'Camera permission is required');
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       quality: 0.7,
//     });

//     if (!result.canceled && result.assets[0]) {
//       sendMedia(result.assets[0]);
//     }
//   };

//   const openImagePicker = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission needed', 'Media library permission is required');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//       allowsEditing: true,
//       quality: 0.7,
//     });

//     if (!result.canceled && result.assets[0]) {
//       sendMedia(result.assets[0]);
//     }
//   };

//   const openDocumentPicker = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true
//       });

//       if (!result.canceled && result.assets[0]) {
//         sendMedia(result.assets[0]);
//       }
//     } catch (err) {
//       console.error('Document picker error:', err);
//     }
//   };

//   // ---------------- SEND MEDIA ----------------
//   const sendMedia = async (asset: any) => {
//     if (!asset.uri || platform !== 'whatsapp') {
//       Alert.alert('Error', 'Media sending only supported for WhatsApp');
//       return;
//     }

//     setIsUploading(true);

//     try {
//       const formData = new FormData();
//       const filename = asset.fileName || asset.uri.split('/').pop() || 'file';
//       const mimeType = asset.type || asset.mimeType || 'application/octet-stream';
      
//       let mediaType = 'document';
//       if (mimeType.startsWith('image/')) mediaType = 'image';
//       else if (mimeType.startsWith('video/')) mediaType = 'video';
//       else if (mimeType.startsWith('audio/')) mediaType = 'audio';

//       formData.append('file', {
//         uri: asset.uri,
//         type: mimeType,
//         name: filename,
//       } as any);
//       formData.append('type', mediaType);
//       formData.append('caption', filename);

//       const response = await fetch(`${BASE_URL}/whatsapp/send-media`, {
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const result = await response.json();
//       if (!result.success) {
//         throw new Error(result.error || 'Failed to send media');
//       }

//       // Refresh messages
//       fetchMessages();
//     } catch (err) {
//       console.error('Send media error:', err);
//       Alert.alert('Error', 'Failed to send media');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // ---------------- VOICE RECORDING ----------------
//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission needed', 'Microphone permission is required');
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//       setIsRecording(true);
//     } catch (err) {
//       console.error('Failed to start recording', err);
//       Alert.alert('Error', 'Failed to start recording');
//     }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;

//     setIsRecording(false);
//     setRecording(null);

//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
      
//       if (uri && platform === 'whatsapp') {
//         // Send voice message
//         const formData = new FormData();
//         formData.append('file', {
//           uri,
//           type: 'audio/mp3',
//           name: 'voice.mp3',
//         } as any);
//         formData.append('type', 'audio');
//         formData.append('caption', 'Voice Message');

//         setIsUploading(true);
//         const response = await fetch(`${BASE_URL}/whatsapp/send-media`, {
//           method: 'POST',
//           body: formData,
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });

//         const result = await response.json();
//         if (result.success) {
//           fetchMessages();
//         } else {
//           throw new Error('Failed to send voice message');
//         }
//       }
//     } catch (err) {
//       console.error('Recording error:', err);
//       Alert.alert('Error', 'Failed to send voice message');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // ---------------- RENDER MESSAGE ITEM ----------------
//   const renderMessageItem = ({ item }: { item: Message }) => {
//     const isMe = item.sender === 'me';
//     const bubbleStyle = [
//       styles.bubble,
//       isMe ? (item.platform === 'whatsapp' ? styles.whatsappSent : styles.messengerSent) : styles.received
//     ];
//     const textColor = isMe ? '#fff' : '#000';

//     const renderMessageContent = () => {
//       switch (item.type) {
//         case 'image':
//           return (
//             <View>
//               {item.media_url && (
//                 <Image 
//                   source={{ uri: `${BASE_URL}${item.media_url}` }} 
//                   style={styles.mediaImage}
//                   resizeMode="cover"
//                 />
//               )}
//               {item.text && (
//                 <Text style={[styles.messageText, { color: textColor, marginTop: 5 }]}>
//                   {item.text}
//                 </Text>
//               )}
//             </View>
//           );
        
//         case 'audio':
//           return (
//             <View style={styles.audioMessage}>
//               <Ionicons name="play" size={20} color={textColor} />
//               <Text style={[styles.messageText, { color: textColor, marginLeft: 8 }]}>
//                 Voice Message
//               </Text>
//             </View>
//           );
        
//         case 'video':
//           return (
//             <View style={styles.videoMessage}>
//               <Ionicons name="play-circle" size={24} color={textColor} />
//               <Text style={[styles.messageText, { color: textColor, marginLeft: 8 }]}>
//                 Video
//               </Text>
//             </View>
//           );
        
//         case 'document':
//           return (
//             <View style={styles.documentMessage}>
//               <Ionicons name="document" size={20} color={textColor} />
//               <Text style={[styles.messageText, { color: textColor, marginLeft: 8 }]}>
//                 {item.filename || 'Document'}
//               </Text>
//             </View>
//           );
        
//         case 'contacts':
//           return (
//             <View style={styles.contactMessage}>
//               <Ionicons name="person" size={20} color={textColor} />
//               <View style={{ marginLeft: 8 }}>
//                 <Text style={[styles.messageText, { color: textColor, fontWeight: 'bold' }]}>
//                   {item.contact_name || 'Unknown'}
//                 </Text>
//                 <Text style={[styles.messageText, { color: textColor, fontSize: 12 }]}>
//                   {item.contact_phone || 'No Number'}
//                 </Text>
//               </View>
//             </View>
//           );
        
//         default:
//           return (
//             <Text style={[styles.messageText, { color: textColor }]}>
//               {item.text}
//             </Text>
//           );
//       }
//     };

//     const renderMessageStatus = () => {
//       if (!isMe || !item.status) return null;
      
//       let statusIcon = '✓';
//       let statusColor = textColor;
      
//       if (item.status === 'delivered') {
//         statusIcon = '✓✓';
//       } else if (item.status === 'read') {
//         statusIcon = '✓✓';
//         statusColor = '#4FC3F7';
//       }
      
//       return (
//         <Text style={[styles.statusText, { color: statusColor }]}>
//           {statusIcon}
//         </Text>
//       );
//     };

//     return (
//       <View style={[styles.messageRow, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
//         {!isMe && <Image source={{ uri: avatar }} style={styles.avatar} />}
//         <View style={bubbleStyle}>
//           {renderMessageContent()}
//           <View style={styles.messageFooter}>
//             <Text style={[styles.timeText, { color: isMe ? '#fff' : '#666' }]}>
//               {item.time}
//             </Text>
//             {renderMessageStatus()}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <KeyboardAvoidingView 
//       style={styles.container} 
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
//       keyboardVerticalOffset={90}
//     >
//       <View style={styles.header}>
//         <Image source={{ uri: avatar }} style={styles.headerAvatar} />
//         <View style={{ marginLeft: 10, flex: 1 }}>
//           <Text style={styles.headerName}>{name}</Text>
//           <View style={styles.platformRow}>
//             {platform === 'whatsapp' ? (
//               <>
//                 <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
//                 <Text style={styles.platformText}>WhatsApp</Text>
//               </>
//             ) : (
//               <>
//                 <Ionicons name="logo-facebook" size={14} color="#0084FF" />
//                 <Text style={styles.platformText}>Messenger</Text>
//               </>
//             )}
//           </View>
//         </View>
        
//         {/* Media attachment button */}
//         <TouchableOpacity 
//           onPress={showMediaPicker} 
//           style={styles.headerButton}
//           disabled={isUploading}
//         >
//           {isUploading ? (
//             <ActivityIndicator size="small" color="#666" />
//           ) : (
//             <Ionicons name="attach" size={24} color="#666" />
//           )}
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={renderMessageItem}
//         contentContainerStyle={{ padding: 12 }}
//         showsVerticalScrollIndicator={false}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           value={inputText}
//           onChangeText={setInputText}
//           placeholder="Type a message"
//           style={styles.input}
//           multiline={false}
//           onSubmitEditing={sendMessage}
//           editable={!isSending && !isRecording}
//         />
        
//         {/* Voice recording button */}
//         <TouchableOpacity
//           onPress={isRecording ? stopRecording : startRecording}
//           style={[
//             styles.voiceButton,
//             { backgroundColor: isRecording ? '#FF5252' : '#f0f0f0' }
//           ]}
//           disabled={isSending || isUploading}
//         >
//           <Ionicons
//             name={isRecording ? "stop" : "mic"}
//             size={20}
//             color={isRecording ? '#fff' : '#666'}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={sendMessage}
//           style={[styles.sendButton, { opacity: (isSending || isRecording) ? 0.5 : 1 }]}
//           disabled={isSending || isRecording}
//         >
//           <Ionicons
//             name={isSending ? "hourglass" : "send"}
//             size={24}
//             color={platform === 'whatsapp' ? '#25D366' : '#0084FF'}
//           />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#f5f5f5' 
//   },
//   header: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     height: 100, 
//     paddingHorizontal: 25, 
//     backgroundColor: '#fff', 
//     borderBottomWidth: 1, 
//     borderBottomColor: '#ddd' 
//   },
//   headerAvatar: { 
//     width: 40, 
//     height: 40, 
//     borderRadius: 20 
//   },
//   headerName: { 
//     fontSize: 16, 
//     fontWeight: 'bold', 
//     color: '#000' 
//   },
//   platformRow: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     marginTop: 2 
//   },
//   platformText: { 
//     fontSize: 12, 
//     marginLeft: 4, 
//     color: '#555' 
//   },
//   headerButton: {
//     padding: 8,
//     borderRadius: 20,
//   },
//   messageRow: { 
//     flexDirection: 'row', 
//     marginVertical: 4, 
//     alignItems: 'flex-end' 
//   },
//   bubble: { 
//     padding: 10, 
//     borderRadius: 12, 
//     maxWidth: '75%' 
//   },
//   whatsappSent: { 
//     backgroundColor: '#25D366', 
//     borderTopRightRadius: 0 
//   },
//   messengerSent: { 
//     backgroundColor: '#0084FF', 
//     borderTopRightRadius: 0 
//   },
//   received: { 
//     backgroundColor: '#e5e5ea', 
//     borderTopLeftRadius: 0 
//   },
//   messageText: { 
//     fontSize: 14,
//     lineHeight: 18
//   },
//   messageFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 4,
//   },
//   timeText: { 
//     fontSize: 10, 
//     marginTop: 2 
//   },
//   statusText: {
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   inputContainer: { 
//     flexDirection: 'row', 
//     padding: 10, 
//     backgroundColor: '#fff', 
//     alignItems: 'center' 
//   },
//   input: { 
//     flex: 1, 
//     height: 40, 
//     borderRadius: 20, 
//     backgroundColor: '#f0f0f0', 
//     paddingHorizontal: 12 
//   },
//   voiceButton: {
//     marginLeft: 8,
//     padding: 10,
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButton: { 
//     marginLeft: 8, 
//     backgroundColor: '#fff', 
//     padding: 10, 
//     borderRadius: 20 
//   },
//   avatar: { 
//     width: 32, 
//     height: 32, 
//     borderRadius: 16, 
//     marginRight: 6 
//   },
  
//   // Media message styles
//   mediaImage: {
//     width: width * 0.5,
//     height: width * 0.4,
//     borderRadius: 8,
//   },
//   audioMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   videoMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   documentMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   contactMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
// });
