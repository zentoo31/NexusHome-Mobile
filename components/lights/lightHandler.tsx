import { useWebSocket } from "@/utils/webSocketProvider";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface LightHandlerProps {
    room: string;
    status?: 'on' | 'off';
    pin?: number;
}

export const LightHandler = ({ room, status = "off", pin }: LightHandlerProps) => {
    const [isOn, setIsOn] = useState<boolean>();
    const { sendAndWaitResponse } = useWebSocket();

    const handleLight = async (pin: number) => {
        try {
            const request = {
                type: 'gpio',
                pin: pin,
                value: isOn ? 'off' : 'on'
            }

            console.log('Enviando comando GPIO:', request);

            await sendAndWaitResponse(
                request,
                'all_pins'
            );
            setIsOn(!isOn);
        } catch (err) {
            console.error('❌ Error enviando comando GPIO:', err);
        }
    }

    useEffect(() => {
        if (status === 'on') {
            setIsOn(true);
        } else {
            setIsOn(false);
        }
    }, []);
    return (
        <Pressable onPress={() => handleLight(pin!)}>
            <View
                className={`flex flex-row justify-between items-center w-full mb-4 p-4 rounded-lg ${isOn ? "bg-[#232c3b]" : "bg-[#2a2a2a]"
                    }`}
            >
                <Feather name="sun" size={24} color={isOn ? "#fff" : "#6b7280"} />
                <Text className="text-white text-lg">{room}</Text>
                <Text className="text-gray-400 text-lg">{isOn ? "Encendido" : "Apagado"}</Text>
            </View>
        </Pressable>
    );
};