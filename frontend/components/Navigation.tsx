import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  WhatsAppConnect: undefined;
  MessengerConnect: undefined;
  ConnectScreen: undefined;
  Login: undefined;
  MainTabs: undefined;
  Signup: undefined;
  Connect: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
