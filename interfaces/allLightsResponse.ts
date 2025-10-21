export interface AllLightsResponse {
    type: string;
    pins: pins[];
}

interface pins{
    pin: number;
    status: string;
    mode: string;
    name: string;
}