const mqtt = require('mqtt');
const userController = require('./userController');

const client = mqtt.connect('mqtt://localhost:1883', {
  username: 'app_guest',
  password: 'fentanyl'
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');

  client.subscribe('app/register');
  client.subscribe('app/login');

  console.log('Subscribed to: app/register, app/login');
});

client.on('message', async (topic, message) => {
  let data;

  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    console.error('Invalid JSON received');
    return;
  }

  console.log(`Incoming message on topic "${topic}":`, data);


  const resSimulator = {
    statusCode: 200,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(responseData) {
      const payload = {
        status: this.statusCode,
        data: responseData
      };
      client.publish(`app/response/${data.username}`, JSON.stringify(payload));
      console.log(`Responded via MQTT:`, payload);
    }
  };


  const reqSimulator = {
    body: data,
    session: {}
  };

  try {
    switch (topic) {
      case 'app/register':
        await userController.create(reqSimulator, resSimulator);
        break;

      case 'app/login':
        await userController.login(reqSimulator, resSimulator, (err) => {
          resSimulator.status(401).json({ error: err.message || 'Login failed' });
        });
        break;

      default:
        console.warn('Unknown topic:', topic);
    }
  } catch (err) {
    console.error('Error handling MQTT message:', err);
    resSimulator.status(500).json({ error: 'Internal server error' });
  }
});
