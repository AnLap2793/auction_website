import axios from '../utils/axiosCustomize';

//Lấy danh sách user
const getUsers = async () => {
    try {
        const response = await axios.get(`/users`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Xác thực email
const verifyEmail = (token) => axios.get(`/auth/verify-email/${token}`);

// Gửi lại email xác thực
const resendVerificationEmail = (email) => axios.post('/auth/resend-verification', { email });

// Cập nhật thông tin người dùng
const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Xóa người dùng
const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Toggle trạng thái người dùng
const toggleUserStatus = async (userId) => {
    try {
        const response = await axios.patch(`/users/${userId}/toggle-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export {
    verifyEmail,
    resendVerificationEmail,
    getUsers,
    deleteUser,
    updateUser,
    toggleUserStatus
}