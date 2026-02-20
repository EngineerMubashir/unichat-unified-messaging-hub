import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import colors from '../Constant/Color';
import type { NavigationProp } from '../components/Navigation';

type Props = {
  navigation: NavigationProp;
};

export default function LandingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo1.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <LinearGradient
        colors={colors.cardGradient} // ['#9B4DFF', '#5520C9']
        style={styles.continueButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.continueButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </LinearGradient>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  continueButtonGradient: {
    borderRadius: 30,
    width: '80%',
    marginTop: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  continueButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
