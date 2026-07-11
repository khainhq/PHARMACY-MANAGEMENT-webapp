import axios from 'axios';

const API_URL = '/chatbot/';

export const sendMessageToChatbot = async (message) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(
      API_URL,
      { message },
      {
        headers: token ? { Authorization: `Token ${token}` } : {},
      }
    );
    return response.data.reply;
  } catch (error) {
    throw new Error('Không thể kết nối với chatbot');
  }
};
