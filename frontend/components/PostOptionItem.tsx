import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../Constant/Color';

export interface PostOption {
  id: string;
  name: string;
  description: string;
  platform: 'facebook' | 'instagram';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface PostOptionItemProps {
  option: PostOption;
  onPress: () => void;
}

export default function PostOptionItem({ option, onPress }: PostOptionItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
        <Ionicons 
          name={option.icon} 
          size={24} 
          color={option.color} 
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{option.name}</Text>
        <Text style={styles.description}>{option.description}</Text>
      </View>
      
      <Ionicons 
        name="chevron-forward-outline" 
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});