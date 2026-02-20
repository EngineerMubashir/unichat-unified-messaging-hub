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

export default function InstagramPostScreen() {
  const navigation = useNavigation();
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [hashtags, setHashtags] = useState('');

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
      aspect: [1, 1], // Instagram prefers square images
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map(asset => asset.uri);
      setSelectedMedia(prev => [...prev, ...newMedia]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (selectedMedia.length === 0) {
      Alert.alert('Error', 'Please add at least one photo or video to your Instagram post');
      return;
    }

    setIsPosting(true);
    
    try {
      // Here you would implement the actual Instagram API call
      // For now, we'll simulate the post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!', 
        'Your post has been shared on Instagram',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post on Instagram. Please try again.');
    } finally {
      setIsPosting(false);
    }
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
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map(asset => asset.uri);
      setSelectedMedia(prev => [...prev, ...newMedia]);
    }
  };

  const suggestedHashtags = [
    '#photooftheday', '#instagood', '#instagram', '#love', '#picoftheday',
    '#follow', '#instadaily', '#followme', '#happy', '#beautiful'
  ];

  const addHashtag = (hashtag: string) => {
    if (!hashtags.includes(hashtag)) {
      setHashtags(prev => prev ? `${prev} ${hashtag}` : hashtag);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post on Instagram</Text>
        <TouchableOpacity 
          style={[styles.postButton, selectedMedia.length === 0 && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting || selectedMedia.length === 0}
        >
          <Text style={[styles.postButtonText, selectedMedia.length === 0 && styles.postButtonTextDisabled]}>
            {isPosting ? 'Posting...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Media Selection - Required for Instagram */}
        <View style={styles.mediaSelectionContainer}>
          <Text style={styles.sectionTitle}>Add Photos/Videos *</Text>
          
          {selectedMedia.length === 0 ? (
            <View style={styles.emptyMediaContainer}>
              <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyMediaText}>Instagram posts require media</Text>
              <Text style={styles.emptyMediaSubtext}>Add photos or videos to share</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreview}>
              {selectedMedia.map((uri, index) => (
                <View key={index} style={styles.mediaPreviewItem}>
                  <Image source={{ uri }} style={styles.mediaImage} />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => handleRemoveMedia(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.mainImageIndicator}>
                      <Text style={styles.mainImageText}>1</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.mediaOptions}>
            <TouchableOpacity style={styles.mediaOption} onPress={() => handleMediaPicker('image')}>
              <Ionicons name="image-outline" size={24} color="#E4405F" />
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

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            </View>
            <Text style={styles.userName}>Posting to Instagram</Text>
          </View>
          
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor={colors.textSecondary}
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={2200}
            textAlignVertical="top"
          />
          
          <Text style={styles.characterCount}>
            {caption.length}/2200
          </Text>
        </View>

        {/* Hashtags */}
        <View style={styles.hashtagContainer}>
          <Text style={styles.sectionTitle}>Hashtags</Text>
          
          <TextInput
            style={styles.hashtagInput}
            placeholder="Add hashtags... #photooftheday #instagood"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={hashtags}
            onChangeText={setHashtags}
            maxLength={500}
          />
          
          <Text style={styles.sectionSubtitle}>Suggested hashtags:</Text>
          <View style={styles.suggestedHashtags}>
            {suggestedHashtags.map((hashtag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.hashtagChip}
                onPress={() => addHashtag(hashtag)}
              >
                <Text style={styles.hashtagChipText}>{hashtag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Post Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Post Settings</Text>
          
          <TouchableOpacity style={styles.settingOption}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Add Location</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingOption}>
            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Tag People</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingOption}>
            <Ionicons name="musical-notes-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Add Music</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    backgroundColor: '#E4405F',
    paddingHorizontal: 16,
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
  mediaSelectionContainer: {
    backgroundColor: '#1f1f1f',
    margin: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  emptyMediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyMediaText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyMediaSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  mediaPreview: {
    marginBottom: 16,
  },
  mediaPreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  mainImageIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E4405F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mediaOption: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c2c2c',
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
  captionContainer: {
    backgroundColor: '#1f1f1f',
    margin: 12,
    marginTop: 0,
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
    backgroundColor: '#E4405F' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  captionInput: {
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  hashtagContainer: {
    backgroundColor: '#1f1f1f',
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  hashtagInput: {
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
    paddingBottom: 8,
  },
  suggestedHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtagChip: {
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagChipText: {
    fontSize: 12,
    color: '#E4405F',
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: '#1f1f1f',
    margin: 12,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
});