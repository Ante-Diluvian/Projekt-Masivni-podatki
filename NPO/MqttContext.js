import mqtt from "mqtt";
let client = null;

export const initMqttClient = (userId) => {
  if (client) {
    client.end();
    client = null;
  }
  
  if (!client) {
    console.log('User ID bruh:', userId);

    client = mqtt.connect('ws://194.163.176.154:9001', {
      username: 'app_guest',
      password: 'fentanyl',

      will: {
        topic: "status/offline",
        payload: userId,
        qos: 0,
        retain: false,
      },
    });

    client.removeAllListeners('message');
    client.on('connect', () => {
      console.log('Connected to MQTT');
      client.publish("status/online", userId, {
        qos: 0,
        retain: false,
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });
  }

  return client;
};

export const getMqttClient = () => client;


export const logoutMqttClient = async (userId) => {
  if (client) {
    try {
      if (client.connected) {
        client.removeAllListeners(); 
        client.unsubscribe(`app/twofactor/send/${userId}`);
        console.log(`unsubscribeing from app/twofactor/send/${userId}`);
        client.unsubscribe(`app/twofactor/verify/${userId}`);
        console.log(`unsubscribeing from app/twofactor/verify/${userId}`);

        client.publish("status/offline", userId, {
          qos: 0,
          retain: false,
        });
      }

      await new Promise(resolve => client.end(true, resolve));
      console.log('MQTT client fully disconnected');
    } catch (err) {
      console.error('Error disconnecting MQTT client:', err);
    } finally {
      client = null;
    }
  }
};
