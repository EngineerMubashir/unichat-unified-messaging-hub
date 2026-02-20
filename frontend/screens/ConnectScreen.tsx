import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../Constant/Color';

type RootStackParamList = {
  WhatsAppConnect: undefined;
  MessengerConnect: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function ConnectScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Accounts</Text>
      <Text style={styles.subtitle}>Choose a platform to connect</Text>

      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity
            style={styles.innerButton}
            onPress={() => navigation.navigate('WhatsAppConnect')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#fff" />
            <Text style={styles.buttonText}>Connect WhatsApp</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity
            style={styles.innerButton}
            onPress={() => navigation.navigate('MessengerConnect')}
          >
            <Ionicons name="logo-facebook" size={24} color="#fff" />
            <Text style={styles.buttonText}>Connect Messenger</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
