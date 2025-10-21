import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export interface Light {
    room: string
    status: 'on' | 'off'
    pin?:number
}

const roomNames: string[] = [
    'Sala',
    'Cocina',   
    'Dormitorio',
    'Baño',
    'Lavandería',
    'Garaje',
    'Puerta'
];

const Light = ({ room, status }: Light) => {
    return (
        <View className="flex flex-row gap-2 items-center">
            {
                status === 'on' ? (
                    <Feather name="sun" color="#3b82f6" size={20} />
                ) : (
                    <Feather name="sun" color="#6b7280" size={20} />
                )
            }
            <Text className="color-white ml-2">{room}</Text>
            <View className="flex-1" />
            {status === 'on' ? (
                <Text className="color-green-500 font-semibold text-sm bg-[#1d332c] p-1 rounded-lg">Encendida</Text>) : (
                <Text className="color-gray-600 font-semibold text-sm bg-[#252628] p-1 rounded-lg">Apagado</Text>)
            }
        </View>
    )
}

interface LightsStatusProps {   
    lights: Light[]
}

export const LightsStatus = ({lights}: LightsStatusProps) => {
    return (
        <View className='p-4 bg-[#1f1f1f] rounded-lg mt-4 border-[#2a2a2a] py-6' >
            <Text className="color-white font-semibold text-lg">Estado por Habitación</Text>
            <View className="flex flex-col gap-6 p-5">
                {lights.map((light, index) => (
                    <Light key={index} room={roomNames[index]} status={light.status} />
                ))}
            </View>
        </View>
    )
}