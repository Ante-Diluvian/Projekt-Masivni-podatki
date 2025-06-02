import AsyncStorage from '@react-native-async-storage/async-storage';
import { flask } from './api/api';

export const loginImageToServer = async (imageUri) => {
  try {
    const tokenData = await AsyncStorage.getItem('token');
    if (!tokenData) {
      throw new Error('No authentication token found');
    }
    
    const parsedToken = JSON.parse(tokenData);
    const username = parsedToken.username;

    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const fileType = filename.split('.').pop();
    const mimeType = `image/${fileType}`;

    formData.append('username', username);
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });


    const response = await fetch('http://194.163.176.154:5000/login', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    console.log(responseData);
    const [success, error] =  responseData;

    return success;
  } catch (error) {
    console.log(responseData);
    return null;
  }
};

export const registerFileToServer = async (zipPath, username) => {
  try {
    const filename = zipPath.split('/').pop();

    console.log('Zajemam ZIP iz:', zipPath);
    console.log('Ime datoteke:', filename);

    const formData = new FormData();

    formData.append('username', username);

    formData.append('file', {
      uri: zipPath.startsWith('file://') ? zipPath : `file://${zipPath}`,
      name: filename || 'frames.zip',
      type: 'application/zip',
    });

    const response = await fetch('http://194.163.176.154:5000/register', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    console.log('Response: ', responseData);
    return response.ok && responseData.status === true;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
};
