// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Theme } from '../../constants/types';
import { AudioProvider } from '../../constants/_audioContext';

export default function TabLayout() {
  return (
    <AudioProvider>
      <Tabs 
        screenOptions={{
          // This line removes the header name from the top of all screens
          headerShown: false, 
          
          tabBarStyle: { 
            backgroundColor: '#000', 
            borderTopColor: '#282828', 
            height: 60 
          },
          tabBarActiveTintColor: Theme.accent,
          tabBarInactiveTintColor: Theme.subText,
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'Home', 
            tabBarIcon: ({color}) => <Ionicons name="library" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="search" 
          options={{ 
            title: 'Search', 
            tabBarIcon: ({color}) => <Ionicons name="search" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="library" // Note: Changed name from 'y' to 'library' to match your library.tsx file
          options={{ 
            title: 'Library',
            tabBarIcon: ({color}) => <Ionicons name="heart" size={24} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="settings" 
          options={{ 
            title: 'Settings', 
            tabBarIcon: ({color}) => <Ionicons name="settings-outline" size={24} color={color} /> 
          }} 
        />
      </Tabs>
    </AudioProvider>
  );
}