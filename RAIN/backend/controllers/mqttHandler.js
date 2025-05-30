const mqtt = require('mqtt');
const userController = require('./userController');
const workoutController = require('./workoutController');
const Gps = require('../models/gpsModel.js')
const Accelerometer = require('../models/accelerometerModel')
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'mqtt_status.log');
const activeUsers = new Set();

const client = mqtt.connect('ws://194.163.176.154:9001', {
  username: 'app_guest',
  password: 'fentanyl'
});

function initializeLogFile() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Created logs directory at ${logDir}`);
  }

  if (!fs.existsSync(logFile)) {
    const initialText = `MQTT Status Log - started at ${new Date().toISOString()}\n\n`;
    fs.writeFileSync(logFile, initialText);
    console.log(`Created log file at ${logFile}`);
  }
}

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

function calculateCalories({ weight, durationMins, avgSpeed, metValue }) {
  let met;

  if (typeof metValue === 'number' && metValue > 0) {
    //If metValue is valid
    met = metValue;

    //Fast speed = burn more calories
    if (avgSpeed >= 10)
      met *= 1.2;
    else if (avgSpeed >= 8) 
      met *= 1.1;
  } else {
    //If theres no metValue
    if (avgSpeed >= 10)
      met = 10;
    else if (avgSpeed >= 8)
      met = 8;
    else
      met = 6; //Default (Like walking)
  }

  const durationHours = durationMins / 60;
  const calories = met * weight * durationHours;

  return Math.round(calories);
}

initializeLogFile();

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
      const { exerciseName, user1, avgSpeed, maxSpeed, latitude, longitude, altitude, distance, startTime, endTime, duration, metValue } = message;
      console.log('Received exercise data:', message);

      const gps = new Gps({latitude: [latitude].flat(), longitude: [longitude].flat(), altitude: [altitude].flat()});
      const savedGps = gps.save();

      const accelerometer = new Accelerometer({ avgSpeed, maxSpeed });
      const savedAccelerometer = accelerometer.save();

      //Check if user exists or weight is missing
      if (!user1 || !user1.weight) {
        console.error('User not found or weight missing');
        return;
      }

      const caloriesBurned = calculateCalories({
        weight: user1.weight,
        durationMins: duration,
        avgSpeed: avgSpeed,
        metValue: metValue
      });

      const workoutData = {
        name: exerciseName || "Workout", 
        user_id: user1._id,
        startTimestamp: new Date(startTime),
        endTimestamp: new Date(endTime),
        duration: duration,
        caloriesBurned: caloriesBurned,
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

  
function sendMsg(userId) {
  const verifyTopic = `app/twofactor/verify/${userId}`;
  const sendTopic = `app/twofactor/send/${userId}`;
  client.unsubscribe(verifyTopic);
  client.subscribe(verifyTopic, (err) => {
    if (err) {
      console.error("Subscribe error:", err);
      return;
    }
    console.log(`Subscribed to ${verifyTopic}`);
    client.publish(sendTopic, JSON.stringify({ message: "KURAC JE SKOCA" }));
    console.log('Published 2FA message to:', sendTopic);

  });

  const messageHandler = (topic, message) => {
    if (topic === verifyTopic) {
      try {
        const data = JSON.parse(message.toString());
        console.log("Verification data:", data);
      } catch (e) {
        console.error("Invalid JSON message:", message.toString());
      }
    }
  };
  
  // Register the handler

  client.once('message', messageHandler);
  
  // Return a way to unsubscribe later if needed
  return {
    unsubscribe: () => {
      client.unsubscribe(verifyTopic);
      client.removeListener('message', messageHandler);
    }
  };
}module.exports = {sendMsg}