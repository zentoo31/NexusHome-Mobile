export interface AllPinsResponse {
    type: string;
    pins: pins[];
}

interface pins{
    pin: number;
    status: string;
    mode: string;
    name: string;
}