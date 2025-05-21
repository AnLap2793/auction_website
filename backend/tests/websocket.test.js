const io = require('socket.io-client');
const assert = require('assert');

describe('WebSocket Auction Tests', () => {
    let socket1;
    let socket2;
    const SOCKET_URL = 'http://localhost:5000';

    before((done) => {
        // Khởi tạo kết nối cho 2 client
        socket1 = io(SOCKET_URL);
        socket2 = io(SOCKET_URL);

        Promise.all([
            new Promise((resolve) => socket1.on('connect', resolve)),
            new Promise((resolve) => socket2.on('connect', resolve))
        ]).then(() => done());
    });

    after(() => {
        // Đóng kết nối sau khi test xong
        socket1.close();
        socket2.close();
    });

    it('should join auction room', (done) => {
        const auctionId = '123'; // Thay bằng ID phiên đấu giá thật
        
        socket1.emit('joinAuction', auctionId);
        
        // Đợi một chút để đảm bảo đã join room
        setTimeout(() => {
            done();
        }, 100);
    });

    it('should receive bid updates', (done) => {
        const auctionId = '123'; // Thay bằng ID phiên đấu giá thật
        const bidData = {
            auctionId: auctionId,
            bidAmount: 1000000,
            userId: 'test-user-1'
        };

        // Socket2 lắng nghe sự kiện newBid
        socket2.on('newBid', (data) => {
            assert.strictEqual(data.bidAmount, bidData.bidAmount);
            assert.strictEqual(data.auctionId, bidData.auctionId);
            done();
        });

        // Socket1 tham gia phòng và đặt giá
        socket1.emit('joinAuction', auctionId);
        setTimeout(() => {
            socket1.emit('placeBid', bidData);
        }, 100);
    });

    it('should handle auction end', (done) => {
        const auctionId = '123'; // Thay bằng ID phiên đấu giá thật

        socket1.on('auctionEnded', (data) => {
            assert.strictEqual(data.auction_id, auctionId);
            assert.ok(data.message.includes('kết thúc'));
            done();
        });

        // Giả lập kết thúc phiên đấu giá (cần implement phía server)
        socket1.emit('joinAuction', auctionId);
    });
}); 