import { TemperatureResponse } from '@/interfaces/temperatureResponse'
import { useWebSocket } from '@/utils/webSocketProvider'
import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  const [systemStatus, setSystemStatus] = useState<boolean>(true);
  const [esp32Connected, setEsp32Connected] = useState<boolean>(true);
  const [lightsOn, setLightsOn] = useState<number>(5);
  const [temperature, setTemperature] = useState<number>(0);
  const [electricityUsage, setElectricityUsage] = useState<number>(351);

  const { sendAndWaitResponse, isSocketReady, subscribeToMessage, unsubscribeFromMessage } = useWebSocket();

  const fetchTemperature = useCallback(async () => {
    try {
      const response: TemperatureResponse = await sendAndWaitResponse(
        { type: 'get_current_temperature' },
        'current_temperature'
      );
      setTemperature(response.temperature.value);
    } catch (err) {
      console.error('❌ Error obteniendo temperatura:', err);
    }
  }, [sendAndWaitResponse]);

  useEffect(() => {
    if (!isSocketReady) return;

    // Fetch inicial
    fetchTemperature();

    // Suscripción a cambios en tiempo real
    const handleTemperatureUpdate = (data: TemperatureResponse) => {
      console.log('🌡️ Temperatura actualizada desde backend:', data.temperature.value);
      setTemperature(data.temperature.value);
    };

    subscribeToMessage('current_temperature', handleTemperatureUpdate);

    return () => {
      // Limpieza: eliminar el listener cuando se desmonta el componente
      unsubscribeFromMessage('current_temperature', handleTemperatureUpdate);
    };
  }, [isSocketReady, fetchTemperature, subscribeToMessage, unsubscribeFromMessage]);


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
            ) : (
              <Feather name="x-circle" color="#ef4444" size={20} />
            )}
            <Text className='color-slate-400 text-lg'>Sistema activo</Text>
          </View>

          <View className='mt-2 flex flex-row gap-2 items-center'>
            {esp32Connected ? (
              <Feather name="check-circle" color="#10b981" size={20} />
            ) : (
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
            {
              temperature <= 18 ? (
                <Feather name="thermometer" color="#3b82f6" size={24} />) :
                temperature > 18 && temperature <= 25 ? (
                  <Feather name="thermometer" color="#10b981" size={24} />) :
                  (<Feather name="thermometer" color="#ef4444" size={24} />)
            }
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

        </View>


      </ScrollView>
    </SafeAreaView>
  )
}

export default Home;