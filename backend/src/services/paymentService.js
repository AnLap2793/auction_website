const { VNPay, VnpLocale, VerifyReturnUrl } = require('vnpay');

class PaymentService {
  constructor() {
    this.vnpay = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: process.env.VNP_URL,
      vnp_OrderType: 'other',
      testMode: true,
      hashAlgorithm: 'SHA512',
      enableLog: true
    });
  }

  createVNPayUrl(transactionData) {
    try {
      // Lấy số tiền trực tiếp vì đã là VNĐ
      const amount = Math.round(transactionData.amount);
      
      // Tạo mã đơn hàng với timestamp
      const now = new Date();
      const createDate = 
        now.getFullYear().toString() +
        ((now.getMonth() + 1) < 10 ? '0' : '') + (now.getMonth() + 1) +
        (now.getDate() < 10 ? '0' : '') + now.getDate() +
        (now.getHours() < 10 ? '0' : '') + now.getHours() +
        (now.getMinutes() < 10 ? '0' : '') + now.getMinutes() +
        (now.getSeconds() < 10 ? '0' : '') + now.getSeconds();
 
      const vnpParams = {
        vnp_Amount: amount,
        vnp_Command: 'pay',
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: transactionData.ipAddr || '127.0.0.1',
        vnp_TxnRef: `${transactionData.transaction_code}`,
        vnp_OrderInfo: `Thanh toan giao dich ${transactionData.transaction_code}`,
        vnp_ReturnUrl: `${process.env.VNP_RETURN_URL}`,
        vnp_Locale: VnpLocale.VN,
        vnp_OrderType: 'other'
      };

      const vnpUrl = this.vnpay.buildPaymentUrl(vnpParams);
      console.log('[PaymentService] Generated VNPAY URL:', vnpUrl);
      return vnpUrl;
    } catch (error) {
      console.error('[PaymentService] Error creating VNPAY URL:', error);
      throw new Error('Không thể tạo được đường dẫn thanh toán');
    }
  }

  verifyReturnUrl(vnpParams) {
    try {
      // Sử dụng phương thức verifyReturnUrl từ thư viện
      const verify = this.vnpay.verifyReturnUrl(vnpParams);

      return {
        success: true,
        message: 'Thanh toán thành công',
        data: {
          responseCode: verify.vnpResponseCode,
          transactionNo: verify.vnpTransactionNo,
          amount: verify.vnpAmount,
          orderInfo: verify.vnpOrderInfo,
          bankCode: verify.vnpBankCode,
          bankTranNo: verify.vnpBankTranNo,
          cardType: verify.vnpCardType,
          payDate: verify.vnpPayDate
        }
      };
    } catch (error) {
      console.error('[PaymentService] Error verifying payment:', error);
      throw new Error('Dữ liệu không hợp lệ');
    }
  }
}

module.exports = new PaymentService();