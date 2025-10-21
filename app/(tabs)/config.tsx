import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Config = () => {
  return (
    <SafeAreaView className='bg-[#111] flex flex-row h-full p-4'>
      <Text className='color-white'>Config</Text>
    </SafeAreaView>
  )
}

export default Config