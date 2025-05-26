import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const registerImageToServer = async (imageUri,username) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const fileType = filename.split('.').pop();
    const mimeType = `register/${fileType}`;
    
    formData.append('username', username);
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });


    const response = await fetch('http://194.163.176.154:5000/register', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    const [success, error] =  responseData;
    console.log(responseData);
    return success;
  } catch (error) {
    console.log(responseData);
    return null;
  }
};