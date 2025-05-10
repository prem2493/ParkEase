#include <Arduino.h>
#include <SoftwareSerial.h>
// put function declarations here:
int myFunction(int, int);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600); // Initialize serial communication at 9600 bps
}

void loop() {
  int result = myFunction(2, 3);
  // put your main code here, to run repeatedly:
  Serial.println(result);
  delay(1000); // wait for a second
}

// put function definitions here:
int myFunction(int x, int y) {
  return x + y;
}