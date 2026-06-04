#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>

// ---------------- PINS ----------------
#define DHTPIN D2
#define DHTTYPE DHT11
#define BUZZER D5
#define IR_PIN D6

// ---------------- WIFI ----------------
const char* ssid = "iPhone";
const char* password = "12345678";

// ---------------- BACKEND CONNECTION (RAILWAY) ----------------
const char* backendUrl = "https://final-project-production-57c6.up.railway.app/api/v1/sensors";

// ---------------- OBJECTS ----------------
WiFiClientSecure client;
HTTPClient http;
DHT dht(DHTPIN, DHTTYPE);

// ---------------- STATE ----------------
float prevTemp = 0;
unsigned long lastSend = 0;
unsigned long lastReconnectAttempt = 0;
int lastSentIrState = -1; 

// --------------------------------------------------
// CONNECT WIFI
// --------------------------------------------------
void connectWiFi() {
  Serial.println();
  Serial.println("================================");
  Serial.println("Connecting to WiFi...");
  Serial.println("================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 40) {
    delay(500);
    Serial.print(".");
    Serial.print(" Status=");
    Serial.println(WiFi.status());
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi Connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println(" WiFi Connection Failed");
  }
}

// --------------------------------------------------
// SEND DATA TO BACKEND
// --------------------------------------------------
void sendData(float t, float h, float p, int ir) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Data skipped.");
    return;
  }

  client.setInsecure();  // Skip SSL certificate verification
  client.setTimeout(10000);

  if (!http.begin(client, backendUrl)) {
    Serial.println("HTTP begin failed");
    return;
  }

  http.setTimeout(10000);
  http.addHeader("Content-Type", "application/json");

  // Format JSON payload - match backend schema
  String json = "{"
    "\"temperature\":" + String(t, 2) + ","
    "\"humidity\":" + String(h, 2) + ","
    "\"predicted_temperature\":" + String(p, 2) + ","
    "\"ir_detected\":" + (ir == 1 ? "true" : "false") +
    "}";

  Serial.println();
  Serial.println("================================");
  Serial.println("[SENDING DATA]");
  Serial.println(json);

  int code = http.POST(json);

  Serial.print("[HTTP CODE] ");
  Serial.println(code);

  if (code > 0) {
    String response = http.getString();
    Serial.println("[RESPONSE]");
    Serial.println(response);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(code));
  }

  http.end();
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==========================");
  Serial.println("ESP8266 Starting...");
  Serial.println("==========================");

  pinMode(BUZZER, OUTPUT);
  pinMode(IR_PIN, INPUT);

  digitalWrite(BUZZER, LOW);

  dht.begin();
  connectWiFi();
}

// --------------------------------------------------
// LOOP
// --------------------------------------------------
void loop() {
  // ------------------------------------
  // WIFI AUTO RECONNECT
  // ------------------------------------
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastReconnectAttempt > 10000) {
      Serial.println();
      Serial.println("WiFi Lost");
      Serial.println("Attempting Reconnect...");

      WiFi.disconnect();
      delay(1000);
      connectWiFi();

      lastReconnectAttempt = millis();
    }
  } else {
    static unsigned long lastWifiPrint = 0;
    if (millis() - lastWifiPrint > 30000) {
      Serial.print("WiFi OK | RSSI=");
      Serial.println(WiFi.RSSI());
      lastWifiPrint = millis();
    }
  }

  // ------------------------------------
  // IR SENSOR (ACTIVE LOW FIX)
  // ------------------------------------
  int rawIr = digitalRead(IR_PIN);
  int irDetected = (rawIr == LOW) ? 1 : 0; 

  if (irDetected == 1) {
    digitalWrite(BUZZER, HIGH);
  } else {
    digitalWrite(BUZZER, LOW);
  }

  if (irDetected != lastSentIrState) {
    delay(200); 
    rawIr = digitalRead(IR_PIN);
    irDetected = (rawIr == LOW) ? 1 : 0;
  }

  // ------------------------------------
  // READ DATA EVERY 20 SEC OR IMMEDIATELY ON IR TRIGGER
  // ------------------------------------
  bool timeToSendTelemetry = (millis() - lastSend >= 20000);
  bool irStateChanged = (irDetected != lastSentIrState);

  if (timeToSendTelemetry || irStateChanged) {
    Serial.println();
    Serial.println("Processing System Update...");

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println(" [WARNING] DHT11 Read Failed! Using fallback values.");
      t = (prevTemp == 0) ? 25.0 : prevTemp;
      h = 50.0;
    }

    float predicted = (prevTemp == 0) ? t : t + (t - prevTemp);

    sendData(t, h, predicted, irDetected);

    if (!isnan(t)) {
      prevTemp = t;
    }
    lastSend = millis();
    lastSentIrState = irDetected; 
  }

  // ------------------------------------
  // AUTO RESTART IF STUCK OFFLINE
  // ------------------------------------
  static unsigned long wifiDownStart = 0;

  if (WiFi.status() != WL_CONNECTED) {
    if (wifiDownStart == 0) {
      wifiDownStart = millis();
    }
    if (millis() - wifiDownStart > 300000) { 
      Serial.println("WiFi unavailable for 5 minutes. Restarting ESP8266...");
      ESP.restart();
    }
  } else {
    wifiDownStart = 0;
  }

  delay(30); 
}
