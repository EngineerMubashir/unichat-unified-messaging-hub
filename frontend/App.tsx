import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import InboxScreen from './screens/InboxScreen';
// import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LandingScreen from './screens/LandingScreen';
import ConnectScreen from './screens/ConnectScreen';
import WhatsAppConnectScreen from './screens/WhatsAppConnectScreen';
import MessengerConnectScreen from './screens/MessengerConnectScreen';
import WhatsAppChatScreen from './screens/WhatsAppChatScreen';
import MessengerChatScreen from './screens/MessengerChatScreen';
import FacebookPostScreen from './screens/FacebookPostScreen';
import InstagramPostScreen from './screens/InstagramPostScreen';
import colors from './Constant/Color';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          if (route.name === 'Inbox') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.cardPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2c2c2c',
          paddingTop: 6,
          paddingBottom: 10,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: 18,
          fontWeight: 'bold',
        },
        headerTintColor: colors.textPrimary,
      })}
    >
      <Tab.Screen name="Inbox" component={InboxScreen} />
      {/* <Tab.Screen name="Contacts" component={ContactsScreen} /> */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          {/* Authentication and Setup Screens */}
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Connect" 
            component={ConnectScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="WhatsAppConnect" 
            component={WhatsAppConnectScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="MessengerConnect" 
            component={MessengerConnectScreen} 
            options={{ headerShown: false }} 
          />
          
          {/* Main App */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
          
          {/* Chat Screens */}
          <Stack.Screen 
            name="WhatsAppChat" 
            component={WhatsAppChatScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="MessengerChat" 
            component={MessengerChatScreen} 
            options={{ headerShown: false }} 
          />
          
          {/* Post Screens */}
          <Stack.Screen 
            name="FacebookPost" 
            component={FacebookPostScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="InstagramPost" 
            component={InstagramPostScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: 'none',
  },
});







// import React from 'react';
// import { StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// import LoginScreen from './screens/LoginScreen';
// import InboxScreen from './screens/InboxScreen';
// import ContactsScreen from './screens/ContactsScreen';
// import SettingsScreen from './screens/SettingsScreen';
// import LandingScreen from './screens/LandingScreen';
// import ConnectScreen from './screens/ConnectScreen';
// import WhatsAppConnectScreen from './screens/WhatsAppConnectScreen';
// import MessengerConnectScreen from './screens/MessengerConnectScreen';
// import WhatsAppChatScreen from './screens/WhatsAppChatScreen';
// import MessengerChatScreen from './screens/MessengerChatScreen';
// import colors from './Constant/Color';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }: any) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

//           if (route.name === 'Inbox') {
//             iconName = focused ? 'mail' : 'mail-outline';
//           } else if (route.name === 'Contacts') {
//             iconName = focused ? 'people' : 'people-outline';
//           } else if (route.name === 'Settings') {
//             iconName = focused ? 'settings' : 'settings-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: colors.cardPrimary,
//         tabBarInactiveTintColor: colors.textSecondary,
//         tabBarStyle: {
//           backgroundColor: '#1a1a1a',
//           borderTopColor: '#2c2c2c',
//           paddingTop: 6,
//           paddingBottom: 10,
//           height: 65,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '600',
//         },
//         headerStyle: {
//           backgroundColor: '#1a1a1a',
//         },
//         headerTitleStyle: {
//           color: colors.textPrimary,
//           fontSize: 18,
//           fontWeight: 'bold',
//         },
//         headerTintColor: colors.textPrimary,
//       })}
//     >
//       <Tab.Screen name="Inbox" component={InboxScreen} />
//       <Tab.Screen name="Contacts" component={ContactsScreen} />
//       <Tab.Screen name="Settings" component={SettingsScreen} />
//     </Tab.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <SafeAreaProvider style={styles.container}>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Landing">
//           {/* <Stack.Screen 
//             name="Landing" 
//             component={LandingScreen} 
//             options={{ headerShown: false }} 
//           />
//           <Stack.Screen 
//             name="Login" 
//             component={LoginScreen} 
//             options={{ headerShown: false }} 
//           />
//           <Stack.Screen 
//             name="Connect" 
//             component={ConnectScreen} 
//             options={{ headerShown: false }} 
//           />
//           <Stack.Screen 
//             name="WhatsAppConnect" 
//             component={WhatsAppConnectScreen} 
//             options={{ headerShown: false }} 
//           />
//           <Stack.Screen 
//             name="MessengerConnect" 
//             component={MessengerConnectScreen} 
//             options={{ headerShown: false }} 
//           /> */}
//           <Stack.Screen 
//             name="MainTabs" 
//             component={MainTabs} 
//             options={{ headerShown: false }} 
//           />
          
//           {/* Separate Chat Screens for WhatsApp and Messenger */}
//           <Stack.Screen 
//             name="WhatsAppChat" 
//             component={WhatsAppChatScreen} 
//             options={{ headerShown: false }} 
//           />
//           <Stack.Screen 
//             name="MessengerChat" 
//             component={MessengerChatScreen} 
//             options={{ headerShown: false }} 
//           />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     userSelect: 'none',
//   },
// });






// import React from 'react';
// import { StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// import LoginScreen from './screens/LoginScreen';
// import InboxScreen from './screens/InboxScreen';
// import ContactsScreen from './screens/ContactsScreen';
// import SettingsScreen from './screens/SettingsScreen';
// import LandingScreen from './screens/LandingScreen';
// import ConnectScreen from './screens/ConnectScreen';
// import WhatsAppConnectScreen from './screens/WhatsAppConnectScreen';
// import MessengerConnectScreen from './screens/MessengerConnectScreen';
// import colors from './Constant/Color';
// import ChatScreen from './screens/ChatScreen';
// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }: any) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

//           if (route.name === 'Inbox') {
//             iconName = focused ? 'mail' : 'mail-outline';
//           } else if (route.name === 'Contacts') {
//             iconName = focused ? 'people' : 'people-outline';
//           } else if (route.name === 'Settings') {
//             iconName = focused ? 'settings' : 'settings-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: colors.cardPrimary,
//         tabBarInactiveTintColor: colors.textSecondary,
//         tabBarStyle: {
//           backgroundColor: '#1a1a1a',
//           borderTopColor: '#2c2c2c',
//           paddingTop: 6,
//           paddingBottom: 10,
//           height: 65,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '600',
//         },
//         headerStyle: {
//           backgroundColor: '#1a1a1a',
//         },
//         headerTitleStyle: {
//           color: colors.textPrimary,
//           fontSize: 18,
//           fontWeight: 'bold',
//         },
//         headerTintColor: colors.textPrimary,
//       })}
//     >
//       <Tab.Screen name="Inbox" component={InboxScreen} />
//       <Tab.Screen name="Contacts" component={ContactsScreen} />
//       <Tab.Screen name="Settings" component={SettingsScreen} />
//     </Tab.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <SafeAreaProvider style={styles.container}>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Landing">
        
//           <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
//           <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
          
//         </Stack.Navigator>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     userSelect: 'none',
//   },
// });
