const mongoose = require('mongoose');

describe('MongoDB connection (app.js)', () => {
  test('mongoose should be connected', () => {
    expect([1, 2]).toContain(mongoose.connection.readyState);
  });
});