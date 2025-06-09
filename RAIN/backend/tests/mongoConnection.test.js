require('dotenv').config();
jest.setTimeout(30000);

const mongoose = require('mongoose');

describe('MongoDB connection (app.js)', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to:', process.env.MONGO_URI);
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await new Promise(r => setTimeout(r, 500));
  });

  test('mongoose should be connected', () => {
    expect([1, 2]).toContain(mongoose.connection.readyState);
  });
});