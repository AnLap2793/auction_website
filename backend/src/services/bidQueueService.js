const { redisClient } = require("../config/redis");
const auctionService = require("./auctionService");
const { v4: uuidv4 } = require("uuid");
const socketService = require("./socketService");

class BidQueueService {
    constructor() {
        this.processing = new Set();
        // Lưu trữ kết quả xử lý bid: Map<bidId, {status: 'success'|'failed', data: any, error?: string}>
        this.bidResults = new Map();
    }

    // Thêm bid vào hàng đợi
    async enqueueBid(bidData) {
        const { auction_id, user_id, bid_amount, user_info } = bidData;
        const bidKey = `auction:${auction_id}:bids`;

        // Tạo unique bid ID để track
        const bidId = uuidv4();

        // Thêm bid vào hàng đợi Redis với timestamp và bidId
        const bidQueueItem = {
            bidId: bidId,
            userId: user_id,
            amount: parseFloat(bid_amount),
            timestamp: Date.now(),
            user_info: user_info || null,
        };

        await redisClient.rPush(bidKey, JSON.stringify(bidQueueItem));

        // Bắt đầu xử lý hàng đợi nếu chưa có quá trình xử lý nào đang chạy
        if (!this.processing.has(auction_id)) {
            // Xử lý không đồng bộ để không block response
            this.processBidQueue(auction_id).catch((error) => {
                console.error(`Lỗi khi xử lý queue cho auction ${auction_id}:`, error);
            });
        }

        return bidId;
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
                const { bidId, userId, amount, user_info } = bidData;

                try {
                    // Xử lý bid thông qua auctionService
                    const result = await auctionService.placeBid({
                        auction_id: auctionId,
                        user_id: userId,
                        bid_amount: amount,
                    });

                    // Lưu kết quả thành công
                    this.bidResults.set(bidId, {
                        status: "success",
                        data: result.data,
                        timestamp: Date.now(),
                    });

                    // Emit socket event khi đặt giá thành công
                    socketService.notifyNewBid(auctionId, {
                        ...result.data,
                        user: user_info || {
                            id: userId,
                            first_name: "Người dùng",
                            last_name: "",
                        },
                    });

                    // Emit event cho user cụ thể để biết bid đã được xử lý thành công
                    socketService.emitToRoom(`auction-${auctionId}`, "bidProcessed", {
                        bidId: bidId,
                        status: "success",
                        message: "Đặt giá thành công",
                        data: result.data,
                    });
                } catch (error) {
                    console.error(`Lỗi xử lý bid cho auction ${auctionId}:`, error.message);

                    // Lưu kết quả thất bại
                    this.bidResults.set(bidId, {
                        status: "failed",
                        error: error.message,
                        timestamp: Date.now(),
                    });

                    // Emit socket event khi bid xử lý thất bại
                    socketService.emitToRoom(`auction-${auctionId}`, "bidFailed", {
                        bidId: bidId,
                        userId: userId,
                        status: "failed",
                        message: error.message,
                        bid_amount: amount,
                    });
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

    // Lấy trạng thái của một bid
    getBidStatus(bidId) {
        return this.bidResults.get(bidId) || null;
    }

    // Xóa kết quả cũ để tránh memory leak (có thể gọi định kỳ)
    cleanupOldResults(maxAge = 3600000) {
        // Mặc định 1 giờ
        const now = Date.now();
        for (const [bidId, result] of this.bidResults.entries()) {
            if (now - result.timestamp > maxAge) {
                this.bidResults.delete(bidId);
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
