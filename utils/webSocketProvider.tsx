import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
} from 'react';

type MessageHandler = (data: any) => void;

interface WebSocketContextType {
    socket: React.RefObject<WebSocket | null>;
    sendAndWaitResponse: (request: any, expectedType: string, timeoutMs?: number) => Promise<any>;
    isSocketReady: boolean;
    subscribeToMessage: (type: string, callback: (data: any) => void) => void; // 👈 nuevo
    unsubscribeFromMessage: (type: string, callback: (data: any) => void) => void; // 👈 opcional
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const socket = useRef<WebSocket | null>(null);
    const listeners = useRef<Record<string, MessageHandler[]>>({});
    const [isSocketReady, setIsSocketReady] = React.useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://192.168.18.219:3000');

        ws.onopen = () => {
            console.log('🔌 WebSocket conectado');
            setIsSocketReady(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data?.type && listeners.current[data.type]) {
                listeners.current[data.type].forEach((handler) => handler(data));

                if (data._responseOnce) {
                    listeners.current[data.type] = [];
                }
            }
        };

        ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('🔌 WebSocket cerrado');
            setIsSocketReady(false);
        };

        socket.current = ws;

        return () => {
            ws.close();
        };
    }, []);

    const subscribeToMessage = (type: string, callback: (data: any) => void) => {
        if (!listeners.current[type]) {
            listeners.current[type] = [];
        }
        listeners.current[type].push(callback);
    };

    const unsubscribeFromMessage = (type: string, callback: (data: any) => void) => {
        listeners.current[type] = listeners.current[type]?.filter((cb) => cb !== callback);
    };

    const sendAndWaitResponse = (
        request: any,
        expectedType: string,
        timeoutMs: number = 5000
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
                return reject(new Error('WebSocket no conectado'));
            }

            const handler: MessageHandler = (data) => resolve(data);

            if (!listeners.current[expectedType]) {
                listeners.current[expectedType] = [];
            }
            listeners.current[expectedType].push(handler);

            socket.current.send(JSON.stringify(request));

            setTimeout(() => {
                listeners.current[expectedType] = listeners.current[expectedType].filter(
                    (h) => h !== handler
                );
                reject(new Error('Timeout esperando respuesta'));
            }, timeoutMs);
        });
    };

    return (
        <WebSocketContext.Provider value={{ socket, sendAndWaitResponse, isSocketReady, subscribeToMessage, unsubscribeFromMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket debe usarse dentro de WebSocketProvider');
    }
    return context;
};
