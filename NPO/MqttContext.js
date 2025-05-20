import mqtt from "mqtt";
let client = null;

export const initMqttClient = () => {
  if (!client) {
    client = mqtt.connect('ws://194.163.176.154:9001', {
      username: 'app_guest',
      password: 'fentanyl',
    });

    client.on('connect', () => {
      console.log('Connected to MQTT');
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });
  }

  return client;
};

export const getMqttClient = () => {
  return client;
};

