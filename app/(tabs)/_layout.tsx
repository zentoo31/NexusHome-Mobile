import { WebSocketProvider } from '@/utils/webSocketProvider'
import { Feather } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export default function TabLayout() {
  return (
    <WebSocketProvider>
      <Tabs

      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
        },
        tabBarInactiveTintColor: '#6b7280',
        tabBarActiveTintColor: '#3b82f6'
      }}
    >
      <Tabs.Screen 
        name = "index"
        options = {{
          title: 'Inicio',
          tabBarIcon: ({color, size}) => (
            <Feather name="home" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen 
        name = "lights"
        options= {{
          title: 'Luces',
          tabBarIcon: ({color, size}) => (
            <Feather name="sun" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name = "config"
        options= {{
          title: 'Configuración',
          tabBarIcon: ({color, size}) => (
            <Feather name="settings" color={color} size={size} />
          )
        }}
      />
    </Tabs>
    </WebSocketProvider>
  )
}