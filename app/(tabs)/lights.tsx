import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Lights = () => {
  return (
    <SafeAreaView className='bg-[#0f0f0f] flex flex-row h-full p-4'>
      <Text className='color-white'>lights</Text>
    </SafeAreaView>
  )
}

export default Lights