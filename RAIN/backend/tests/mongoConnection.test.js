const mongoose = require('mongoose');

describe('MongoDB connection (app.js)', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('mongoose should be connected', () => {
    expect([1, 2]).toContain(mongoose.connection.readyState);
  });
});
