import axios from 'axios';
import { message } from 'antd';

const axiosClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response) {
            const { status, data } = response;

            // Handle different HTTP status codes
            switch (status) {
                case 400:
                    // Validation errors
                    if (data.errors) {
                        const errorMessages = Object.values(data.errors).join(', ');
                        message.error(errorMessages || data.message || 'Dữ liệu không hợp lệ');
                    } else {
                        message.error(data.message || 'Yêu cầu không hợp lệ');
                    }
                    break;
                case 401:
                    message.error(data.message || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    // Optionally redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('userId');
                    // window.location.href = '/login';
                    break;
                case 403:
                    message.error(data.message || 'Bạn không có quyền thực hiện hành động này');
                    break;
                case 404:
                    message.error(data.message || 'Không tìm thấy tài nguyên');
                    break;
                case 409:
                    message.error(data.message || 'Dữ liệu đã tồn tại');
                    break;
                case 500:
                    message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
                    break;
                default:
                    message.error(data.message || 'Đã có lỗi xảy ra');
            }
        } else if (error.request) {
            // Network error
            message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
            message.error('Đã có lỗi xảy ra');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;