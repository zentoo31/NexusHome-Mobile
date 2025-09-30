import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100 items-center justify-center">
      <Text className="text-2xl font-bold text-blue-600">
        🚀 Expo + xd + NativeWind + SafeArea
      </Text>
      <Pressable className="mt-4 px-4 py-2 bg-blue-500 rounded-lg">
        <Text className="text-white font-medium">¡Presióname!</Text>
      </Pressable>
    </SafeAreaView>
  );
}
