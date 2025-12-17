#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ESP32Servo.h>

WebSocketsClient webSocket;
Servo s1;
const char* ssid = "Y36";
const char* password = "denishuevon";

const char* websocket_server = "10.90.138.91";  // IP de pc
const int websocket_port = 3000;






[
  

  [
    
  ]
] int pins[] = { 15, 2, 4, 16, 17, 5 };
const int numPins = sizeof(pins) / sizeof(pins[0]);
const int tempPin = 32;

unsigned long lastTempSend = 0;
const unsigned long tempInterval = 10000;  // 10 segundos

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println(" Desconectado!");
      break;
    case WStype_CONNECTED:
      Serial.println(" Conectado al servidor!");
      webSocket.sendTXT("ESP32");
      break;
    case WStype_TEXT:
      {
        String message = (char*)payload;
        Serial.printf("[WSc] Mensaje: %s\n", message);

        // Procesar mensajes en formato "pin:status"
        int separatorIndex = message.indexOf(':');
        if (separatorIndex != -1) {
          String pinStr = message.substring(0, separatorIndex);
          String statusStr = message.substring(separatorIndex + 1);

          int pinNumber = pinStr.toInt();
          Serial.printf("Pin: %d, Estado: %s\n", pinNumber, statusStr.c_str());

          // Para el servo
          if (pinNumber == 18) {
            if (statusStr == "on") {
              // Mover servo de 0 a 90 grados en 4 segundos
              for (int angle = 0; angle <= 110; angle++) {
                s1.write(angle);
                delay(4000 / 90);  // ~44 ms por paso
              }
            } else if (statusStr == "off") {
              // Mover servo de 90 a 0 grados en 4 segundos
              for (int angle = 110; angle >= 0; angle--) {
                s1.write(angle);
                delay(4000 / 90);  // ~44 ms por paso
              }
            }
          }



          // Buscar si el pin está en nuestra lista de pines controlables
          bool pinFound = false;
          for (int i = 0; i < numPins; i++) {
            if (pins[i] == pinNumber) {
              pinFound = true;
              if (statusStr == "on") {
                digitalWrite(pinNumber, HIGH);
                Serial.printf("Encendiendo pin %d\n", pinNumber);
              } else if (statusStr == "off") {
                digitalWrite(pinNumber, LOW);
                Serial.printf("Apagando pin %d\n", pinNumber);
              }
              break;
            }
          }

          if (!pinFound) {
            Serial.printf("Pin %d no está configurado para control\n", pinNumber);
          }
        }
      }
      break;
  }
}

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < numPins; i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], LOW);
    Serial.printf("Pin %d configurado como OUTPUT\n", pins[i]);
  }
  //inicializando servo
  s1.attach(18);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado a WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(websocket_server, websocket_port, "/");
  webSocket.onEvent(webSocketEvent);
  analogSetPinAttenuation(tempPin, ADC_11db); // Rango 0-1.1V (ajusta si quieres)
  analogReadResolution(12);    

}

void loop() {
  webSocket.loop();


  unsigned long currentMillis = millis();
  if (currentMillis - lastTempSend >= tempInterval) {
    lastTempSend = currentMillis;
    int rawValue = analogRead(tempPin);         // 0..4095
    float voltage = (rawValue / 4095.0) * 3.3;  // Voltaje real considerando alimentación
    float temperatureC = voltage * 10.0;       // 10mV/°C
    // Crear el mensaje JSON
    String message = "{\"type\": \"set_temperature\", \"value\": " + String(temperatureC, 1) + "}";
    Serial.println("Enviando temperatura: " + message);
    webSocket.sendTXT(message);
  }
}