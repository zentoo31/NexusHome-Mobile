import { Light } from '@/components/index/LightsStatus'
import { LightHandler } from '@/components/lights/lightHandler'
import { AllLightsResponse } from '@/interfaces/allLightsResponse'
import { useWebSocket } from '@/utils/webSocketProvider'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Lights = () => {
  const [lightsStatus, setLightsStatus] = useState<Light[]>([]);
  const { sendAndWaitResponse } = useWebSocket();
  const roomNames: string[] = [
    'Sala',
    'Cocina',   
    'Dormitorio',
    'Baño',
    'Lavandería',
    'Garaje',
    'Puerta'
];

  const fetchLightsStatus = useCallback(async () => {
    try {
      const response: AllLightsResponse = await sendAndWaitResponse(
        { type: 'get_all_pins' },
        'all_pins'
      );
      const lightsData: Light[] = response.pins.map(pin => ({
        room: pin.name,
        status: pin.status as 'on' | 'off',
        pin: pin.pin
      }));
      setLightsStatus(lightsData);
    } catch (err) {
      console.error('❌ Error obteniendo estado de luces:', err);
    }
  }, [sendAndWaitResponse]);

  useEffect(() => {
    fetchLightsStatus();
  }, [fetchLightsStatus]);

  return (
    <SafeAreaView className='bg-[#111] flex flex-col h-full p-4'>
      <Text className='color-white text-3xl font-bold'>Habitaciones</Text>
      <Text className='color-slate-400'>Control de iluminación</Text>
      <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 items-center py-6' >
        {lightsStatus.map((light, index) => (
          <LightHandler key={index} room={roomNames[index]} status={light.status} pin={light.pin} />
        ))}
      </View>
    </SafeAreaView>
  )
}

export default Lights