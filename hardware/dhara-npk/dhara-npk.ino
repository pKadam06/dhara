// DHARA soil sensor sketch.
// Upload this to the Arduino, then plug the board into the computer running DHARA.
// Every line must look like: DATA,nitrogen,phosphorus,potassium,ph
// Example: DATA,90,42,110,6.5

// Set this to true after readNitrogen, readPhosphorus, and readPotassium
// return values from the real sensor. Until then the board stays quiet.
const bool SENSOR_READY = false;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (!SENSOR_READY) {
    delay(2000);
    return;
  }

  int nitrogen = readNitrogen();
  int phosphorus = readPhosphorus();
  int potassium = readPotassium();
  float ph = readPh();

  Serial.print("DATA,");
  Serial.print(nitrogen);
  Serial.print(",");
  Serial.print(phosphorus);
  Serial.print(",");
  Serial.print(potassium);
  Serial.print(",");
  Serial.println(ph);

  delay(2000);
}

// Replace these with the readings from your NPK and pH sensor.
int readNitrogen() { return 0; }
int readPhosphorus() { return 0; }
int readPotassium() { return 0; }
float readPh() { return 0; }
