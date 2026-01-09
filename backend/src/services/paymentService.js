const { VNPay, VnpLocale, VerifyReturnUrl } = require("vnpay");

class PaymentService {
    constructor() {
        // Kiểm tra các biến môi trường bắt buộc
        if (!process.env.VNP_TMN_CODE || !process.env.VNP_HASH_SECRET) {
            console.warn(
                "[PaymentService] ⚠️  Cảnh báo: Thiếu thông tin cấu hình VNPay. Vui lòng kiểm tra biến môi trường VNP_TMN_CODE và VNP_HASH_SECRET"
            );
        }

        if (!process.env.VNP_RETURN_URL) {
            console.warn(
                "[PaymentService] ⚠️  Cảnh báo: Thiếu VNP_RETURN_URL. VNPay sẽ không thể redirect về sau khi thanh toán."
            );
        }

        // Xác định testMode từ biến môi trường (mặc định true cho sandbox)
        const testMode = process.env.VNP_TEST_MODE !== "false";

        // Xác định URL VNPay
        const vnpayHost =
            process.env.VNP_URL ||
            (testMode
                ? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
                : "https://vnpayment.vn/paymentv2/vpcpay.html");

        this.vnpay = new VNPay({
            tmnCode: process.env.VNP_TMN_CODE,
            secureSecret: process.env.VNP_HASH_SECRET,
            vnpayHost: vnpayHost,
            vnp_OrderType: "other",
            testMode: testMode,
            hashAlgorithm: "SHA512",
            enableLog: true,
        });

        console.log(`[PaymentService] ✅ VNPay initialized - TestMode: ${testMode}, Host: ${vnpayHost}`);
        console.log(
            `[PaymentService] 📋 Config - TMN Code: ${
                process.env.VNP_TMN_CODE ? "✓ Đã cấu hình" : "✗ Thiếu"
            }, Return URL: ${process.env.VNP_RETURN_URL || "✗ Thiếu"}`
        );
    }

    createVNPayUrl(transactionData) {
        try {
            // Validation
            if (!transactionData.amount || transactionData.amount <= 0) {
                throw new Error("Số tiền thanh toán không hợp lệ");
            }

            if (!transactionData.transaction_code) {
                throw new Error("Thiếu mã giao dịch");
            }

            if (!process.env.VNP_RETURN_URL) {
                throw new Error("Thiếu cấu hình VNP_RETURN_URL trong biến môi trường");
            }

            // Thư viện vnpay tự động xử lý việc nhân 100 cho số tiền
            // Nên chúng ta chỉ cần truyền số tiền gốc (đơn vị VNĐ)
            // Ví dụ: 1,000,000 VNĐ → truyền 1000000, thư viện sẽ tự nhân 100 thành 100000000
            const amount = Math.round(Number(transactionData.amount));

            // Tạo mã đơn hàng với timestamp
            const now = new Date();
            const createDate =
                now.getFullYear().toString() +
                (now.getMonth() + 1 < 10 ? "0" : "") +
                (now.getMonth() + 1) +
                (now.getDate() < 10 ? "0" : "") +
                now.getDate() +
                (now.getHours() < 10 ? "0" : "") +
                now.getHours() +
                (now.getMinutes() < 10 ? "0" : "") +
                now.getMinutes() +
                (now.getSeconds() < 10 ? "0" : "") +
                now.getSeconds();

            const vnpParams = {
                vnp_Amount: amount,
                vnp_Command: "pay",
                vnp_CreateDate: createDate,
                vnp_CurrCode: "VND",
                vnp_IpAddr: transactionData.ipAddr || "127.0.0.1",
                vnp_TxnRef: `${transactionData.transaction_code}`,
                vnp_OrderInfo: `Thanh toan giao dich ${transactionData.transaction_code}`,
                vnp_ReturnUrl: `${process.env.VNP_RETURN_URL}`,
                vnp_Locale: VnpLocale.VN,
                vnp_OrderType: "other",
            };

            console.log("[PaymentService] 📤 Creating payment URL:", {
                transaction_code: transactionData.transaction_code,
                amount_original: transactionData.amount,
                amount_vnpay: amount,
                return_url: process.env.VNP_RETURN_URL,
            });

            const vnpUrl = this.vnpay.buildPaymentUrl(vnpParams);
            console.log("[PaymentService] ✅ Generated VNPAY URL:", vnpUrl);
            return vnpUrl;
        } catch (error) {
            console.error("[PaymentService] ❌ Error creating VNPAY URL:", error);
            throw new Error(`Không thể tạo được đường dẫn thanh toán: ${error.message}`);
        }
    }

    verifyReturnUrl(vnpParams) {
        try {
            // Sử dụng phương thức verifyReturnUrl từ thư viện
            const verify = this.vnpay.verifyReturnUrl(vnpParams);

            return {
                success: true,
                message: "Thanh toán thành công",
                data: {
                    responseCode: verify.vnpResponseCode,
                    transactionNo: verify.vnpTransactionNo,
                    amount: verify.vnpAmount,
                    orderInfo: verify.vnpOrderInfo,
                    bankCode: verify.vnpBankCode,
                    bankTranNo: verify.vnpBankTranNo,
                    cardType: verify.vnpCardType,
                    payDate: verify.vnpPayDate,
                },
            };
        } catch (error) {
            console.error("[PaymentService] Error verifying payment:", error);
            throw new Error("Dữ liệu không hợp lệ");
        }
    }
}

module.exports = new PaymentService();
