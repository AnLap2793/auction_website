const { redisClient } = require('../config/redis');
const auctionService = require('./auctionService');

class BidQueueService {
    constructor() {
        this.processing = new Set();
    }

    // Thêm bid vào hàng đợi
    async enqueueBid(bidData) {
        const { auction_id, user_id, bid_amount } = bidData;
        const bidKey = `auction:${auction_id}:bids`;
        
        // Thêm bid vào hàng đợi Redis với timestamp
        await redisClient.rPush(bidKey, JSON.stringify({
            userId: user_id,
            amount: parseFloat(bid_amount),
            timestamp: Date.now()
        }));

        // Bắt đầu xử lý hàng đợi nếu chưa có quá trình xử lý nào đang chạy
        if (!this.processing.has(auction_id)) {
            await this.processBidQueue(auction_id);
        }
    }

    // Xử lý hàng đợi bid cho một phiên đấu giá
    async processBidQueue(auctionId) {
        // Đánh dấu đang xử lý
        this.processing.add(auctionId);
        
        try {
            const bidKey = `auction:${auctionId}:bids`;
            
            while (true) {
                // Lấy bid đầu tiên từ hàng đợi
                const bid = await redisClient.lPop(bidKey);
                if (!bid) {
                    break; // Thoát nếu không còn bid trong hàng đợi
                }

                const bidData = JSON.parse(bid);
                
                try {
                    // Xử lý bid thông qua auctionService
                    await auctionService.placeBid({
                        auction_id: auctionId,
                        user_id: bidData.userId,
                        bid_amount: bidData.amount
                    });
                } catch (error) {
                    console.error(`Lỗi xử lý bid cho auction ${auctionId}:`, error.message);
                    // Có thể thêm logic để thông báo lỗi cho người dùng ở đây
                }
            }
        } catch (error) {
            console.error(`Lỗi xử lý hàng đợi bid cho auction ${auctionId}:`, error);
        } finally {
            // Xóa đánh dấu đang xử lý
            this.processing.delete(auctionId);
            
            // Kiểm tra xem có bid mới được thêm vào trong quá trình xử lý không
            const bidKey = `auction:${auctionId}:bids`;
            const remainingBids = await redisClient.lLen(bidKey);
            
            if (remainingBids > 0) {
                // Nếu có bid mới, tiếp tục xử lý
                await this.processBidQueue(auctionId);
            }
        }
    }

    // Xóa hàng đợi bid của một phiên đấu giá
    async clearBidQueue(auctionId) {
        const bidKey = `auction:${auctionId}:bids`;
        await redisClient.del(bidKey);
    }
}

// Tạo và xuất instance duy nhất của BidQueueService
const bidQueueService = new BidQueueService();
module.exports = bidQueueService; 