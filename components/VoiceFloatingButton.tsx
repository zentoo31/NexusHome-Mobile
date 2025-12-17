import { useWebSocket } from '@/utils/webSocketProvider';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onResult: (text: string) => void;
  // kept for compatibility but not used in web-only flow
  uploadUrl?: string;
  language?: string;
};

const VoiceFloatingButton: React.FC<Props> = ({ onResult, uploadUrl, language = 'es' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastText, setLastText] = useState('');
  const recognitionRef = useRef<any>(null);
  const { socket } = useWebSocket();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = language === 'es' ? 'es-ES' : language;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (event: any) => {
      try {
        const transcript = event.results && event.results[0] && event.results[0][0]
          ? event.results[0][0].transcript
          : '';
        setLastText(transcript);
        setIsRecording(false);
        onResult(transcript);
        // enviar por websocket
        try {
          if (socket?.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'command_ia', text: transcript, oneShot: true }));
          }
        } catch (e) {
          console.warn('WebSocket send failed', e);
        }
      } catch (e) {
        console.error('onresult error', e);
      }
    };

    recog.onerror = (e: any) => {
      console.warn('Speech recognition error', e);
      setIsRecording(false);
      Alert.alert('Error de voz', e?.error || 'Error en reconocimiento de voz');
    };

    recog.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recog;
    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch {}
    };
  }, [onResult, socket, language]);

  const startRecording = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('No soportado', 'Esta funcionalidad solo está disponible en la versión web.');
      return;
    }
    const recog = recognitionRef.current;
    if (!recog) {
      Alert.alert('No soportado', 'Reconocimiento de voz no soportado en este navegador.');
      return;
    }
    try {
      setLastText('');
      setIsRecording(true);
      recog.start();
    } catch (err) {
      console.error('start recog error', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recog = recognitionRef.current;
    try {
      if (recog) recog.stop();
    } catch (e) {
      console.warn('stop recog', e);
    }
    setIsRecording(false);
  };

  const onPress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <View style={{ position: 'absolute', right: 24, bottom: 40 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className='w-16 h-16 bg-blue-600 rounded-full shadow-lg items-center justify-center'
      >
        {isRecording ? <ActivityIndicator color="#fff" /> : <Feather name="mic" color="#fff" size={24} />}
      </TouchableOpacity>
      {isProcessing ? (
        <View className='mt-2 p-2 bg-[#1f1f1f] rounded-md max-w-xs'>
          <Text className='text-sm color-slate-300'>Procesando...</Text>
        </View>
      ) : null}
      {lastText ? (
        <View className='mt-2 p-2 bg-[#1f1f1f] rounded-md max-w-xs'>
          <Text className='text-sm color-slate-300'>{`"${lastText}"`}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default VoiceFloatingButton;
