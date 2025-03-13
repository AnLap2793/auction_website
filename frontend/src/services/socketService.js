import { io } from 'socket.io-client';
import { API_URL } from '../utils/constants';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAuctionRoom = (auctionId) => {
  if (socket) {
    socket.emit('join-auction', auctionId);
  }
};

export const leaveAuctionRoom = (auctionId) => {
  if (socket) {
    socket.emit('leave-auction', auctionId);
  }
};

export const placeBid = (auctionId, amount) => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error('Socket not connected'));
      return;
    }

    socket.emit('place-bid', { auctionId, amount }, (response) => {
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.message));
      }
    });
  });
};