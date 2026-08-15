import { io } from 'socket.io-client';
import { getApiOrigin } from './apiConfig';

const SOCKET_URL = getApiOrigin() || 'https://schoolmangementbackend-deployment.up.railway.app';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = (userId, schoolId) => {
  if (!socket.connected) {
    socket.connect();
    
    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      if (userId) socket.emit('join', userId);
      if (schoolId) socket.emit('joinSchool', schoolId);
    });
  } else {
    if (userId) socket.emit('join', userId);
    if (schoolId) socket.emit('joinSchool', schoolId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
