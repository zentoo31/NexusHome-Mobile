import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onResult: (text: string) => void;
};

const VoiceFloatingButton: React.FC<Props> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const Voice = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') return; // don't load on web
      try {
        const mod = await import('react-native-voice');
        Voice.current = mod.default || mod;
        if (Voice.current && !initialized.current) {
          Voice.current.onSpeechResults = (e: any) => {
            const results = e.value || [];
            const text = results.join(' ');
            setVoiceText(text);
            setIsListening(false);
            onResult(text);
          };
          Voice.current.onSpeechError = (e: any) => {
            console.warn('Voice error', e);
            setIsListening(false);
            Alert.alert('Error de voz', JSON.stringify(e));
          };
          initialized.current = true;
        }
      } catch {
        Voice.current = null;
      }
    })();

    return () => {
      try {
        if (Voice.current && Voice.current.destroy) Voice.current.destroy();
      } catch {}
    };
  }, [onResult]);

  const startListening = async () => {
    if (!Voice.current) {
      Alert.alert('No soportado', 'Reconocimiento de voz no disponible en esta plataforma.');
      return;
    }
    try {
      // On Android request RECORD_AUDIO permission
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: 'Permiso de micrófono',
          message: 'La aplicación necesita acceso al micrófono para reconocimiento de voz.',
          buttonNeutral: 'Preguntar luego',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        });
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'No se puede iniciar el reconocimiento sin permiso al micrófono.');
          setIsListening(false);
          return;
        }
      }
      setVoiceText('');
      setIsListening(true);
      await Voice.current.start('es-ES');
    } catch (err) {
      console.error('startListening error', err);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!Voice.current) return;
    try {
      await Voice.current.stop();
      setIsListening(false);
    } catch (err) {
      console.error('stopListening error', err);
      setIsListening(false);
    }
  };

  return (
    <View style={{ position: 'absolute', right: 24, bottom: 40 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => (isListening ? stopListening() : startListening())}
        className='w-16 h-16 bg-blue-600 rounded-full shadow-lg items-center justify-center'
      >
        {isListening ? <ActivityIndicator color="#fff" /> : <Feather name="mic" color="#fff" size={24} />}
      </TouchableOpacity>
      {voiceText ? (
        <View className='mt-2 p-2 bg-[#1f1f1f] rounded-md max-w-xs'>
          <Text className='text-sm color-slate-300'>{`"${voiceText}"`}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default VoiceFloatingButton;
