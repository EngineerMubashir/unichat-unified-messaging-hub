import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../Constant/Color';

type PlatformType = 'whatsapp' | 'messenger';

export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  platform: PlatformType;
  avatar: string;
}

interface ChatListItemProps {
  chat: ChatItem;
  onPress: () => void;
}

export default function ChatListItem({ chat, onPress }: ChatListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        <View
          style={[
            styles.platformBadge,
            chat.platform === 'messenger' && styles.messengerBadge,
          ]}
        >
          <Ionicons
            name={chat.platform === 'whatsapp' ? 'logo-whatsapp' : 'logo-facebook'}
            size={12}
            color="#fff"
          />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{chat.name}</Text>
          <Text style={styles.time}>{chat.time}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.message} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pressed: {
    backgroundColor: '#f8f8f8',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  platformBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.whatsappGreen,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messengerBadge: {
    backgroundColor: colors.messengerBlue,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
