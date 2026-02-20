import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import colors from '../Constant/Color';

// Add these types for better type safety
type MediaItem = {
  uri: string;
  type: 'image' | 'video';
  filename?: string;
  mimeType?: string;
};

export default function FacebookPostScreen() {
  const navigation = useNavigation();
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  // Base URL - adjust this to match your backend
  const BASE_URL = 'http://192.168.137.16:4001'; // Change this to your backend URL

  const handleMediaPicker = async (mediaType: 'image' | 'video') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your media library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets) {
      const newMedia: MediaItem[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        filename: asset.fileName || asset.uri.split('/').pop(),
        mimeType: asset.mimeType
      }));
      setSelectedMedia(prev => [...prev, ...newMedia]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets) {
      const newMedia: MediaItem[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        filename: asset.fileName || `camera_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        mimeType: asset.mimeType
      }));
      setSelectedMedia(prev => [...prev, ...newMedia]);
    }
  };

  // Post text only
  const postTextOnly = async () => {
    try {
      const response = await fetch(`${BASE_URL}/fb/webhook/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: postContent.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to post: ${errorText}`);
      }

      const result = await response.json();
      console.log('Text post successful:', result);
      return true;
    } catch (error) {
      console.error('Text post error:', error);
      throw error;
    }
  };

  // Post media (photo or video)
  const postMedia = async (mediaItem: MediaItem, caption?: string) => {
    try {
      const formData = new FormData();
      
      // Determine endpoint and form field based on media type
      const endpoint = mediaItem.type === 'image' ? '/fb/webhook/photo' : '/fb/webhook/video';
      const fieldName = mediaItem.type === 'image' ? 'photo' : 'video';
      const captionField = mediaItem.type === 'image' ? 'caption' : 'description';
      
      // Prepare file for upload
      let fileName = mediaItem.filename || `media_${Date.now()}.${mediaItem.type === 'video' ? 'mp4' : 'jpg'}`;
      let mimeType = mediaItem.mimeType || (mediaItem.type === 'video' ? 'video/mp4' : 'image/jpeg');

      if (Platform.OS === 'web') {
        // For web platform
        if (mediaItem.uri.startsWith('data:') || mediaItem.uri.startsWith('blob:')) {
          const response = await fetch(mediaItem.uri);
          const blob = await response.blob();
          formData.append(fieldName, blob, fileName);
        } else {
          formData.append(fieldName, mediaItem.uri as any, fileName);
        }
      } else {
        // For mobile platforms
        const file = {
          uri: mediaItem.uri,
          name: fileName,
          type: mimeType
        } as any;
        formData.append(fieldName, file);
      }

      // Add caption/description if provided
      if (caption) {
        formData.append(captionField, caption);
      }

      console.log(`Posting ${mediaItem.type} to Facebook:`, { fileName, mimeType, caption });

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to post ${mediaItem.type}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`${mediaItem.type} post successful:`, result);
      return true;
    } catch (error) {
      console.error(`${mediaItem.type} post error:`, error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && selectedMedia.length === 0) {
      Alert.alert('Error', 'Please add some content or media to your post');
      return;
    }

    setIsPosting(true);
    
    try {
      let successCount = 0;
      let totalPosts = 0;

      // If there's text content and no media, post as text
      if (postContent.trim() && selectedMedia.length === 0) {
        totalPosts = 1;
        await postTextOnly();
        successCount = 1;
      }
      // If there's media, post each media item
      else if (selectedMedia.length > 0) {
        totalPosts = selectedMedia.length;
        
        for (const mediaItem of selectedMedia) {
          try {
            await postMedia(mediaItem, postContent.trim() || undefined);
            successCount++;
          } catch (error) {
            console.error(`Failed to post ${mediaItem.type}:`, error);
            // Continue with other media items
          }
        }
      }

      // Show success/failure message
      if (successCount === totalPosts) {
        Alert.alert(
          'Success!', 
          `Your ${totalPosts === 1 ? 'post has' : `${totalPosts} posts have`} been shared on Facebook`,
          [
            {
              text: 'OK',
              onPress: () => {
                setPostContent('');
                setSelectedMedia([]);
                navigation.goBack();
              },
            },
          ]
        );
      } else if (successCount > 0) {
        Alert.alert(
          'Partial Success', 
          `${successCount} out of ${totalPosts} posts were shared successfully. Some posts failed to upload.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Keep the failed content for retry
              },
            },
          ]
        );
      } else {
        throw new Error('All posts failed to upload');
      }

    } catch (error: any) {
      console.error('Facebook post error:', error);
      Alert.alert(
        'Error', 
        `Failed to post on Facebook: ${error.message || 'Unknown error'}. Please check your internet connection and try again.`
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post on Facebook</Text>
        <TouchableOpacity 
          style={[styles.postButton, (!postContent.trim() && selectedMedia.length === 0) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting || (!postContent.trim() && selectedMedia.length === 0)}
        >
          <Text style={[styles.postButtonText, (!postContent.trim() && selectedMedia.length === 0) && styles.postButtonTextDisabled]}>
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Post Content Input */}
        <View style={styles.postInputContainer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </View>
            <Text style={styles.userName}>Posting to Facebook</Text>
          </View>
          
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={postContent}
            onChangeText={setPostContent}
            maxLength={2000}
            textAlignVertical="top"
          />
          
          <Text style={styles.characterCount}>
            {postContent.length}/2000
          </Text>
        </View>

        {/* Media Preview */}
        {selectedMedia.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            <Text style={styles.sectionTitle}>Attached Media ({selectedMedia.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedMedia.map((mediaItem, index) => (
                <View key={index} style={styles.mediaPreview}>
                  <Image source={{ uri: mediaItem.uri }} style={styles.mediaImage} />
                  {mediaItem.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play-circle" size={24} color="white" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => handleRemoveMedia(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Media Options */}
        <View style={styles.mediaOptionsContainer}>
          <Text style={styles.sectionTitle}>Add to your post</Text>
          
          <View style={styles.mediaOptions}>
            <TouchableOpacity style={styles.mediaOption} onPress={() => handleMediaPicker('image')}>
              <Ionicons name="image-outline" size={24} color="#4CAF50" />
              <Text style={styles.mediaOptionText}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaOption} onPress={() => handleMediaPicker('video')}>
              <Ionicons name="videocam-outline" size={24} color="#FF9800" />
              <Text style={styles.mediaOptionText}>Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaOption} onPress={handleCamera}>
              <Ionicons name="camera-outline" size={24} color="#2196F3" />
              <Text style={styles.mediaOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Privacy/Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Post Settings</Text>
          
          <TouchableOpacity style={styles.settingOption}>
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Audience: Public</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingOption}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Add Location</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    height :100,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  postButton: {
    backgroundColor: '#1877F2',
    marginHorizontal : 10,
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: '#2c2c2c',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  postButtonTextDisabled: {
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  postInputContainer: {
    backgroundColor: '#1f1f1f',
    margin: 12,
    borderRadius: 12,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1877F2' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  postInput: {
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  mediaPreviewContainer: {
    margin: 12,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  mediaPreview: {
    position: 'relative',
    marginRight: 8,
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaOptionsContainer: {
    margin: 12,
    marginTop: 0,
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mediaOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  mediaOptionText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 4,
    fontWeight: '500',
  },
  settingsContainer: {
    margin: 12,
    marginTop: 0,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  debugContainer: {
    margin: 12,
    padding: 12,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
});