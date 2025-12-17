import { useWebSocket } from '@/utils/webSocketProvider';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  // callback that receives the recognized text (or any string result)
  onResult: (text: string) => void;
  // optional: if provided the component will upload the recorded audio to this URL (POST multipart/form-data)
  // and expect a JSON response with a `text` field: { text: 'transcribed text' }
  uploadUrl?: string;
  // optional: language hint for server-side STT (not used locally)
  language?: string;
};

const VoiceFloatingButton: React.FC<Props> = ({ onResult, uploadUrl, language = 'es' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastText, setLastText] = useState('');

  const { socket } = useWebSocket();

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('No soportado', 'Grabación de audio no está disponible en web en este componente.');
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso denegado', 'No se concedió permiso para usar el micrófono.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      // Explicit recording options to avoid relying on a non-existing exported preset
      // Minimal recording options (avoid relying on missing constants in some expo-av builds)
      const recordingOptions = {
        android: {
          extension: '.m4a',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
      } as any;

      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      // store recording instance on the component via closure
      (startRecording as any)._currentRecording = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('startRecording error', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
    }
  };

  const stopRecording = async () => {
    const recording: Audio.Recording | undefined = (startRecording as any)._currentRecording;
    if (!recording) return;
    setIsRecording(false);
    setIsProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No URI for recording');

      // If uploadUrl provided, upload and expect { text }
      if (uploadUrl) {
        const fileName = uri.split('/').pop() || `recording.m4a`;
        const form = new FormData();
        // @ts-ignore - React Native FormData accepts file objects like this
        form.append('file', {
          uri,
          name: fileName,
          type: 'audio/m4a',
        });
        form.append('language', language);

        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            // NOTE: do not set Content-Type; let fetch set the correct boundary for multipart
          },
          body: form as any,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const json = await res.json();
        const text = typeof json?.text === 'string' ? json.text : '';
        setLastText(text);
        onResult(text);
        // enviar por websocket el comando IA
        try {
          if (socket?.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'command_ia', text, oneShot: true }));
          }
        } catch (e) {
          console.warn('WebSocket send failed', e);
        }
      } else {
        // No upload URL: convert file to base64 and return it so the caller can handle STT
  const b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
        // Send a prefixed string so caller knows it's base64 audio
        const payload = `AUDIO_BASE64:${b64}`;
        setLastText('Audio grabado (sin transcribir)');
        onResult(payload);
        // also notify backend via websocket that audio was captured (payload is base64)
        try {
          if (socket?.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'command_ia', text: payload, oneShot: true }));
          }
        } catch (e) {
          console.warn('WebSocket send failed', e);
        }
      }
    } catch (err) {
      console.error('stopRecording error', err);
      Alert.alert('Error', 'Error al procesar la grabación.');
    } finally {
      setIsProcessing(false);
      try {
        delete (startRecording as any)._currentRecording;
      } catch {}
    }
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
