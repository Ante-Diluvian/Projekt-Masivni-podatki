const axios = require('axios');

describe('Live server test', () => {
  test('GET / should return status 200', async () => {
    const response = await axios.get('http://localhost:3001/');
    expect(response.status).toBe(200);
    expect(response.data).toContain('RAIN');
  });
});