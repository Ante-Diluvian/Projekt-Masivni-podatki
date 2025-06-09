const fs = require('fs');
const path = require('path');

describe('Checking if paths exist', () => {
  const expectedPaths = [
    'app.js',
    'routes',
    'controllers',
    'models',
    'images',
    'public/exerciseImages'
  ];

  expectedPaths.forEach(filePath => {
    test(`Exists: ${filePath}`, () => {
      const fullPath = path.join(__dirname, '..', filePath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });
});
