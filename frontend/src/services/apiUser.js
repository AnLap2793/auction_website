import axios from '../utils/axiosCustomize';

//Lấy danh sách user
const getUsers = () => axios.get('/users')

// Xác thực email
const verifyEmail = (token) => axios.get(`/auth/verify-email/${token}`);

// Gửi lại email xác thực
const resendVerificationEmail = (email) => axios.post('/auth/resend-verification', { email });

export {
    getUsers,
    verifyEmail,
    resendVerificationEmail
}