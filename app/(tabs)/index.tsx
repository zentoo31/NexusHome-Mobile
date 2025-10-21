import { Light, LightsStatus } from '@/components/index/LightsStatus'
import { ValuePanel } from '@/components/index/valuePanel'
import { AllLightsResponse } from '@/interfaces/allLightsResponse'
import { TemperatureResponse } from '@/interfaces/temperatureResponse'
import { useWebSocket } from '@/utils/webSocketProvider'
import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  const [systemStatus, setSystemStatus] = useState<boolean>(true);
  const [esp32Connected, setEsp32Connected] = useState<boolean>(true);
  const [lightsOn, setLightsOn] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [electricityUsage, setElectricityUsage] = useState<number>(351);
  const [lightsStatus, setLightsStatus] = useState<Light[]>([]);
  const { sendAndWaitResponse, isSocketReady, subscribeToMessage, unsubscribeFromMessage } = useWebSocket();

  const fetchLightsStatus = useCallback(async () => {
    try{
      const response: AllLightsResponse = await sendAndWaitResponse(
        {type: 'get_all_pins'},
        'all_pins'
      );
      const lightsData: Light[] = response.pins.map(pin => ({
        room: pin.name,
        status: pin.status as 'on' | 'off'
      }));
      setLightsStatus(lightsData);
    }catch(err){
      console.error('❌ Error obteniendo estado de luces:', err);
    }
  }, [sendAndWaitResponse]);

  useEffect(() => {
    if (!isSocketReady) return;
    fetchLightsStatus();

    const handleLightsUpdate = (data: AllLightsResponse) => {
      const lightsData: Light[] = data.pins.map(pin => ({
        room: pin.name,
        status: pin.status as 'on' | 'off'
      }));
      setLightsStatus(lightsData);
    };
    subscribeToMessage('all_pins', handleLightsUpdate);
    return () => {
      unsubscribeFromMessage('all_pins', handleLightsUpdate);
    };

  }, [isSocketReady, fetchLightsStatus, subscribeToMessage, unsubscribeFromMessage]);
  
  const fetchTemperature = useCallback(async () => {
    try {
      const response: TemperatureResponse = await sendAndWaitResponse(
        { type: 'get_current_temperature' },
        'current_temperature'
      );
      setTemperature(response.temperature.value);
    } catch (err) {
      setSystemStatus(false);
      setEsp32Connected(false);
      console.error('❌ Error obteniendo temperatura:', err);
    }
  }, [sendAndWaitResponse]);

  useEffect(() => {
    if (!isSocketReady) return;
    // Fetch inicial
    fetchTemperature();
    // Suscripción a cambios en tiempo real
    const handleTemperatureUpdate = (data: TemperatureResponse) => {
      setTemperature(data.temperature.value);
    };
    subscribeToMessage('current_temperature', handleTemperatureUpdate);
    return () => {
      // Limpieza: eliminar el listener cuando se desmonta el componente
      unsubscribeFromMessage('current_temperature', handleTemperatureUpdate);
    };
  }, [isSocketReady, fetchTemperature, subscribeToMessage, unsubscribeFromMessage]);

  useEffect(() => {
    setLightsOn(lightsStatus.filter(light => light.status === 'on').length);
  }, [lightsStatus])

  return (
    <SafeAreaView className='bg-[#111] flex flex-row h-full p-4'>
      <ScrollView className='flex-1'>
        <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] py-6' >
          <View className='flex flex-row gap-2 items-center'>
            <Feather name="home" color="#3b82f6" size={24} />
            <Text className='font-semibold color-white text-2xl'> Resumen del sistema</Text>
          </View>

          <View className='mt-4 flex flex-row gap-2 items-center'>
            {systemStatus ? (
              <View className='w-4 h-4 bg-green-500 rounded-xl'></View>
            ) : (
              <View className='w-4 h-4 bg-red-500 rounded-xl'></View>
            )}
            <Text className='color-slate-400 text-lg'>Sistema activo</Text>
          </View>

          <View className='mt-2 flex flex-row gap-2 items-center'>
            {esp32Connected ? (
              <View className='w-4 h-4 bg-green-500 rounded-xl'></View>
            ) : (
              <View className='w-4 h-4 bg-red-500 rounded-xl'></View>
            )}
            <Text className='color-slate-400 text-lg'>ESP32 conectado</Text>
          </View>
        </View>
        <View className='flex flex-row gap-4'>
          <ValuePanel color="#3b82f6" icon={"award"} subText='Luces encendidas' mainText={lightsOn.toString() + `/6`} />
          <ValuePanel color="#3b82f6" icon={"thermometer"} subText='Temperatura' mainText={temperature.toString() + `°C`} />
        </View>
        <View className='flex flex-row gap-4'>
          <ValuePanel color='#10b981' icon={"zap"} subText='Consumo actual' mainText={electricityUsage.toString() + ` kW`} />
          <ValuePanel color="#f59e0b" icon={"clock"} subText='Hora' mainText={new Date().getHours().toString()} />
        </View>

        <LightsStatus lights={lightsStatus} />

      </ScrollView>
    </SafeAreaView>
  )
}

export default Home;