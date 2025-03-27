import axios from '../utils/axiosCustomize';

// Upload hình ảnh (một hoặc nhiều)
const uploadImages = async (files) => {
    try {
        let formData;
        
        // Nếu files đã là FormData, sử dụng trực tiếp
        if (files instanceof FormData) {
            formData = files;
        } else {
            formData = new FormData();
            
            // Nếu files là một file đơn lẻ
            if (files instanceof File) {
                formData.append('images', files);
            } 
            // Nếu files là một mảng file
            else if (Array.isArray(files)) {
                files.forEach((file) => {
                    formData.append('images', file);
                });
            }
        }

        console.log('FormData được gửi:', formData);
        
        // Kiểm tra xem FormData có chứa file không
        if (formData instanceof FormData) {
            // Log các mục trong formData để gỡ lỗi
            for (let pair of formData.entries()) {
                console.log('FormData entry:', pair[0], pair[1], 'Size:', pair[1].size, 'Type:', pair[1].type);
            }
        }

        // Thêm timeout để đảm bảo file được xử lý đầy đủ
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await axios.post(`/images/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            // Tăng timeout cho request
            timeout: 30000
        });

        return response.data;
    } catch (error) {
        console.error('Lỗi chi tiết uploadImages:', error);
        // Kiểm tra xem có response từ server không
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw new Error(error.response?.data?.message || 'Lỗi khi upload hình ảnh');
    }
}

// Xóa hình ảnh
const deleteImage = async (fileName) => {
    try {
        const response = await axios.delete(`/images/${fileName}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi xóa hình ảnh');
    }
}

// Lấy thông tin hình ảnh
const getImageInfo = async (publicId) => {
    try {
        const response = await axios.get(`/images/${publicId}/info`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin hình ảnh');
    }
}

export {
    uploadImages,
    deleteImage,
    getImageInfo
}