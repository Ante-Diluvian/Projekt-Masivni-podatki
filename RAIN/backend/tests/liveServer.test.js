const axios = require('axios');

jest.setTimeout(10000);

describe('Live server test (existing app.js)', () => {
  test('GET / should return 200', async () => {
    const res = await axios.get('http://localhost:3001/');
    expect(res.status).toBe(200);
    expect(res.data).toContain('RAIN');
  });
});