import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Tạo context
const SocketContext = createContext(null);

// Hook để sử dụng context
export const useSocket = () => useContext(SocketContext);

// Provider component
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Khởi tạo kết nối socket (sử dụng URL không có đường dẫn /api)
        const socketUrl =
            import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
        console.log('Đang kết nối Socket.IO đến:', socketUrl);

        const newSocket = io(socketUrl, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        // Xử lý các sự kiện kết nối
        newSocket.on('connect', () => {
            console.log('Socket.IO kết nối thành công!');
            setConnected(true);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket.IO lỗi kết nối:', error);
            console.error('Chi tiết lỗi:', error.message);
            setConnected(false);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket.IO ngắt kết nối:', reason);
            setConnected(false);
        });

        // Lưu trữ tham chiếu socket
        setSocket(newSocket);

        // Hàm cleanup khi component unmount
        return () => {
            if (newSocket) {
                newSocket.off('connect');
                newSocket.off('connect_error');
                newSocket.off('disconnect');
                newSocket.close();
            }
        };
    }, []);

    // Tham gia vào phòng đấu giá
    const joinAuctionRoom = (auctionId) => {
        if (socket && connected) {
            socket.emit('joinAuction', auctionId);
        }
    };

    // Rời khỏi phòng đấu giá
    const leaveAuctionRoom = (auctionId) => {
        if (socket && connected) {
            socket.emit('leaveAuction', auctionId);
        }
    };

    // Đặt giá mới
    const placeBid = (auctionId, bidAmount) => {
        if (socket && connected) {
            socket.emit('placeBid', { auctionId, bidAmount, userId: user?.id });
        }
    };

    return (
        <SocketContext.Provider
            value={{
                socket,
                connected,
                joinAuctionRoom,
                leaveAuctionRoom,
                placeBid
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
