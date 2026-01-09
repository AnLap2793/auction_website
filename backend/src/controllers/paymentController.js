const PaymentService = require("../services/paymentService");
const { Transaction, Auction, AuctionRegistration } = require("../models");
const { v4: uuidv4 } = require("uuid");

class PaymentController {
    async createPaymentUrl(req, res) {
        try {
            const { transaction_id } = req.body;

            // Tìm transaction hiện có
            const transaction = await Transaction.findByPk(transaction_id);
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy giao dịch",
                });
            }

            // Kiểm tra trạng thái transaction
            if (transaction.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Giao dịch này không thể thanh toán",
                });
            }

            // Tạo URL thanh toán VNPay
            const paymentUrl = await PaymentService.createVNPayUrl({
                amount: transaction.amount,
                transaction_code: transaction.transaction_code,
                ipAddr: req.ip || "127.0.0.1",
            });

            res.json({
                success: true,
                data: {
                    paymentUrl,
                    transactionId: transaction.id,
                },
            });
        } catch (error) {
            console.error("[PaymentController] Create payment error:", error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi tạo thanh toán",
                error: error.message,
            });
        }
    }

    async handleVnPayReturn(req, res) {
        try {
            const vnpParams = req.query;

            // Kiểm tra response code từ VNPay
            const responseCode = vnpParams.vnp_ResponseCode;
            const transactionStatus = vnpParams.vnp_TransactionStatus;

            // Tách transaction_code từ vnp_TxnRef
            const transaction_code = vnpParams.vnp_TxnRef;

            // Cập nhật trạng thái giao dịch
            const transaction = await Transaction.findOne({
                where: { transaction_code },
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy giao dịch",
                });
            }

            // Kiểm tra số tiền - So sánh trực tiếp với số tiền đã nhân 100
            if (Number(vnpParams.vnp_Amount) !== transaction.amount * 100) {
                return res.status(400).json({
                    success: false,
                    message: "Số tiền thanh toán không khớp",
                    debug: {
                        vnpay_amount: Number(vnpParams.vnp_Amount),
                        transaction_amount: transaction.amount,
                        transaction_amount_x100: transaction.amount * 100,
                    },
                });
            }

            // Cập nhật trạng thái dựa vào response code
            const isSuccess = responseCode === "00" && transactionStatus === "00";
            transaction.status = isSuccess ? "completed" : "failed";
            transaction.payment_info = {
                bankCode: vnpParams.vnp_BankCode,
                bankTranNo: vnpParams.vnp_BankTranNo,
                cardType: vnpParams.vnp_CardType,
                payDate: vnpParams.vnp_PayDate,
                transactionNo: vnpParams.vnp_TransactionNo,
                responseCode: responseCode,
                amount: Number(vnpParams.vnp_Amount),
                amount_actual: transaction.amount,
            };
            await transaction.save();

            // Nếu là transaction đặt cọc và thanh toán thành công, cập nhật deposit_status
            if (
                isSuccess &&
                transaction.transaction_type === "deposit" &&
                transaction.auction_id &&
                transaction.user_id
            ) {
                const registration = await AuctionRegistration.findOne({
                    where: {
                        auction_id: transaction.auction_id,
                        user_id: transaction.user_id,
                    },
                });

                if (registration) {
                    registration.deposit_status = "paid";
                    registration.status = "approved"; // Tự động approve khi đã thanh toán đặt cọc
                    await registration.save();
                }
            }

            // Nếu là transaction thắng đấu giá và thanh toán thành công, cập nhật deposit_status
            if (
                isSuccess &&
                transaction.transaction_type === "auction_win" &&
                transaction.auction_id &&
                transaction.user_id
            ) {
                // Tìm deposit transaction đã thanh toán của user cho auction này
                const depositTransaction = await Transaction.findOne({
                    where: {
                        auction_id: transaction.auction_id,
                        user_id: transaction.user_id,
                        transaction_type: "deposit",
                        status: "completed",
                    },
                });

                // Nếu có deposit đã thanh toán, cập nhật deposit_status thành "refunded"
                if (depositTransaction) {
                    const registration = await AuctionRegistration.findOne({
                        where: {
                            auction_id: transaction.auction_id,
                            user_id: transaction.user_id,
                        },
                    });

                    if (registration) {
                        registration.deposit_status = "refunded";
                        await registration.save();
                    }

                    // Cập nhật payment_info để ghi lại thông tin đã trừ tiền đặt cọc
                    const updatedPaymentInfo = {
                        ...transaction.payment_info,
                        deposit_deducted: {
                            deposit_transaction_id: depositTransaction.id,
                            deposit_amount: depositTransaction.amount,
                            deducted_at: new Date().toISOString(),
                        },
                    };
                    transaction.payment_info = updatedPaymentInfo;
                    await transaction.save();

                    console.log(
                        `[PaymentController] Đã trừ tiền đặt cọc ${depositTransaction.amount} VNĐ từ số tiền thanh toán cho transaction ${transaction.transaction_code}`
                    );
                }
            }

            // Redirect về trang kết quả thanh toán với thêm thông tin
            const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-result`);
            redirectUrl.searchParams.append("status", transaction.status);
            redirectUrl.searchParams.append("transactionId", transaction.id);
            redirectUrl.searchParams.append("message", isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại");

            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error("[PaymentController] VNPay return error:", error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
                error: error.message,
            });
        }
    }

    async getTransactionStatus(req, res) {
        try {
            const { transactionId } = req.params;

            const transaction = await Transaction.findByPk(transactionId, {
                include: [
                    {
                        model: Auction,
                        attributes: ["id", "product_id"],
                    },
                ],
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy giao dịch",
                });
            }

            res.json({
                success: true,
                data: {
                    id: transaction.id,
                    status: transaction.status,
                    amount: transaction.amount,
                    paymentMethod: transaction.payment_method,
                    createdAt: transaction.created_at,
                    transactionCode: transaction.transaction_code,
                    auction_id: transaction.auction_id,
                },
            });
        } catch (error) {
            console.error("[PaymentController] Get transaction status error:", error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi kiểm tra trạng thái giao dịch",
                error: error.message,
            });
        }
    }
}

module.exports = new PaymentController();
