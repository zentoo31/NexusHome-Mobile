import { Feather } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
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
    </Tabs>
  )
}