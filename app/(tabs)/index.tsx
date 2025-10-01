import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {

  const [systemStatus, setSystemStatus] = useState<boolean>(true);
  const [esp32Connected, setEsp32Connected] = useState<boolean>(true);
  const [lightsOn, setLightsOn] = useState<number>(5);
  const [temperature, setTemperature] = useState<number>(22); 
  const [electricityUsage, setElectricityUsage] = useState<number>(351); 

  return (
    <SafeAreaView className='bg-[#0f0f0f] flex flex-row h-full p-4'>
      <ScrollView className='flex-1'>
        <Text className='color-white text-3xl font-bold'>Estado General</Text>
        <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a]' >
          <View className='flex flex-row gap-2 items-center'>
            <Feather name="home" color="#3b82f6" size={24} />
            <Text className='font-semibold color-white text-2xl'> Resumen del sistema</Text>
          </View> 

          <View className='mt-4 flex flex-row gap-2 items-center'>
            {systemStatus ? (
              <Feather name="check-circle" color="#10b981" size={20} />
            ): (
              <Feather name="x-circle" color="#ef4444" size={20} />
            )}
            <Text className='color-slate-400 text-lg'>Sistema activo</Text>
          </View>

          <View className='mt-2 flex flex-row gap-2 items-center'>
            {esp32Connected ? (
              <Feather name="check-circle" color="#10b981" size={20} />
            ): (
              <Feather name="x-circle" color="#ef4444" size={20} />
            )}
            <Text className='color-slate-400 text-lg'>ESP32 conectado</Text>
          </View>
        </View>
        <View className='flex flex-row gap-4'>
          <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 w-1/2 items-center' >
            <Feather name="award" color="#3b82f6" size={24} />
            <Text className='color-white text-2xl font-semibold mt-2'>{lightsOn}/12</Text>
            <Text className='color-slate-400 text-sm'>Luces encendidas</Text>
          </View>
          <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 w-1/2 items-center' >
            <Feather name="thermometer" color="#f59e0b" size={24} />
            <Text className='color-white text-2xl font-semibold mt-2'>{temperature}°C</Text>
            <Text className='color-slate-400 text-sm'>Temperatura</Text>
          </View>
        </View>
         <View className='flex flex-row gap-4'>
          <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 w-1/2 items-center' >
            <Feather name="zap" color="#10b981" size={24} />
            <Text className='color-white text-2xl font-semibold mt-2'>{electricityUsage} kW</Text>
            <Text className='color-slate-400 text-sm'>Consumo actual</Text>
          </View>
          <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 w-1/2 items-center' >
            <Feather name="cpu" color="#3b82f6" size={24} />
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home