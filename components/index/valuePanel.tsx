import { Feather } from "@expo/vector-icons";
import { IconProps } from "@expo/vector-icons/build/createIconSet";
import { Text, View } from "react-native";

interface ValuePanelProps{
    icon: IconProps<any>['name'];
    color: string;
    mainText: string;
    subText: string;
}

export const ValuePanel = ({icon, color, mainText, subText}:ValuePanelProps) => {
    return (
        <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] flex-1 w-1/2 items-center py-6' >
            <Feather name= {icon} color={color} size={24} />
            <Text className='color-white text-2xl font-semibold mt-2'>{mainText}</Text>
            <Text className='color-slate-400 text-sm'>{subText}</Text>
          </View>
    )
}