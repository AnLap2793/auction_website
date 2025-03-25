// Thời gian token hết hạn (30 phút)
const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

// Lưu token và thời gian hết hạn
export const setAdminToken = (token) => {
    const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_token_expiry', expiryTime.toString());
};

// Lấy token
export const getAdminToken = () => {
    return localStorage.getItem('admin_token');
};

// Kiểm tra token có hết hạn chưa
export const isAdminTokenExpired = () => {
    const expiryTime = localStorage.getItem('admin_token_expiry');
    if (!expiryTime) return true;
    return Date.now() > parseInt(expiryTime);
};

// Xóa token
export const removeAdminToken = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
};

// Kiểm tra token có hợp lệ không
export const isValidAdminToken = () => {
    const token = getAdminToken();
    return token && !isAdminTokenExpired();
};

// Lưu token vào localStorage
export const setToken = (token) => {
    if (!token) {
        console.error('Attempt to save empty token');
        return;
    }
    console.log('Lưu access_token vào localStorage:', token.substring(0, 10) + '...');
    localStorage.setItem('access_token', token);
    
    // Kiểm tra xem access_token đã được lưu chưa
    const savedToken = localStorage.getItem('access_token');
    if (savedToken !== token) {
        console.error('Access_token was not saved correctly to localStorage');
    } else {
        console.log('Token saved successfully to localStorage');
    }
};

// Lấy token từ localStorage
export const getToken = () => {
    return localStorage.getItem('access_token');
};

// Xóa token
export const removeToken = () => {
    localStorage.removeItem('access_token');
};

// Kiểm tra token có hợp lệ không
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    try {
        // Parse JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Kiểm tra token đã hết hạn chưa
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch (error) {
        console.error('Lỗi khi phân tích token:', error);
        return false;
    }
}; 