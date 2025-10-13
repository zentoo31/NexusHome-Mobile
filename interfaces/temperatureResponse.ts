export interface TemperatureResponse {
    type: string;
    temperature: temperature;
}


interface temperature{
    value: number;
    updatedAt: string;
}