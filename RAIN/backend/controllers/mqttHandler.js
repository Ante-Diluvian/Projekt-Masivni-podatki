const mqtt = require('mqtt');
const userController = require('./userController');
const workoutController = require('./workoutController');
const Gps = require('../models/gpsModel.js')
const Accelerometer = require('../models/accelerometerModel')
const path = require('path');
const fs = require('fs');

const logFile = parh.join(__dirname, '../logs/mqtt_status.log');
const activeUsers = new Set();

const client = mqtt.connect('ws://194.163.176.154:9001', {
  username: 'app_guest',
  password: 'fentanyl'
});

function logEvent(type, userId){
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${type.toUpperCase()} - ${userId}\n`;
  fs.appendFile(logFile, line, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  console.log(line.trim());
}

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  client.subscribe(['status/online', 'status/offline']);
  client.subscribe("app/workout", (err, granted) => {
    if (err) {
      console.error("Subscribe error:", err);
    } else {
      console.log("Subscribed to:", granted.map(g => g.topic).join(', '));
    }
  });
});
client.on('message', (topic, messageBuffer) => {
  if (topic === "app/workout") {
    try {
      const message = JSON.parse(messageBuffer.toString());
      const { exercise, user1, avgSpeed, maxSpeed, latitude, longitude, altitude, distance, startTime, endTime, duration, calorie } = message;
      console.log('Received exercise data:', message);

      const gps = new Gps({latitude: [latitude], longitude: [longitude], altitude: [altitude]});
      const savedGps = gps.save();

      const accelerometer = new Accelerometer({ avgSpeed, maxSpeed });
      const savedAccelerometer = accelerometer.save();


      const workoutData = {
        name: exercise || "Workout", 
        user_id: user1,
        startTimestamp: new Date(startTime),
        endTimestamp: new Date(endTime),
        duration: duration,
        caloriesBurned: calorie,
        distance: distance,
        gps: gps._id,
        accelerometer: accelerometer._id,
      }

      workoutController.saveWorkout(workoutData);
      console.log("✅ Workout saved to MongoDB");
    } catch (err) {
      console.error('Failed to parse MQTT message:', err);
    }
  } else if (topic === 'status/online') {
    const userId = messageBuffer.toString();
    activeUsers.add(userId);
    logEvent('online', userId);
    console.log(`Active users: ${activeUsers.size}`);
  }
   else if (topic === 'status/offline') {
    const userId = messageBuffer.toString();
    activeUsers.delete(userId);
    logEvent('offline', userId);
    console.log(`Active users: ${activeUsers.size}`);
  }
});

  client.on('error', (err) => {
    console.error('MQTT error:', err);
  });
  
  client.on('offline', () => {
    console.log('MQTT client offline');
  });
  
  client.on('close', () => {
    console.log('MQTT client closed connection');
  }); 

  client.on('reconnect', () => {
    console.log('MQTT client reconnecting...');
  });
