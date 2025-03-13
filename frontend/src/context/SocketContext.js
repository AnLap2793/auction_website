import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && token) {
      // Initialize socket connection
      socketInstance = io(process.env.REACT_APP_SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(socketInstance);
    }

    // Cleanup function
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  const joinAuctionRoom = (auctionId) => {
    if (socket) {
      socket.emit('join-auction', auctionId);
    }
  };

  const leaveAuctionRoom = (auctionId) => {
    if (socket) {
      socket.emit('leave-auction', auctionId);
    }
  };

  const placeBid = (auctionId, amount) => {
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

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: !!socket && socket.connected,
        joinAuctionRoom,
        leaveAuctionRoom,
        placeBid
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};