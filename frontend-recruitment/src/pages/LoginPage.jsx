import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link } from 'react-router-dom';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const { Title, Text } = Typography;


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


const LoginPage = () => {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    // 1. Xử lý Đăng nhập thường
    const onFinish = async (values) => {
        setLoginError(''); // Clear previous error
        try {
            const response = await axiosClient.post('/auth/login', {
                email: values.email,
                passwordHash: values.password,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('userId', response.data.userId);
            message.success('Đăng nhập thành công!');
            navigate('/');

        } catch (error) {
            let errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại!';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMsg = 'Tài khoản không tồn tại. Vui lòng đăng ký!';
                } else if (error.response.status === 401) {
                    errorMsg = 'Sai email hoặc mật khẩu!';
                } else if (error.response.data && error.response.data.message) {
                    // Fallback for 400 or other errors with specific message
                    errorMsg = error.response.data.message;
                }
            }
            setLoginError(errorMsg);
            // message.error(errorMsg); // Optional: keep or remove toast
            console.error(error);
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const idToken = response.credential;

            const backendResponse = await axiosClient.post('/auth/google-login', {
                idToken: idToken,
            });

            localStorage.setItem('token', backendResponse.data.token);
            localStorage.setItem('role', backendResponse.data.role);
            localStorage.setItem('userId', backendResponse.data.userId);
            message.success('Đăng nhập bằng Google thành công!');
            navigate('/');
        } catch (error) {
            message.error('Đăng nhập bằng Google thất bại hoặc lỗi kết nối Server!');
            console.error('Lỗi Google Login:', error);
        }
    };

    const handleGoogleError = () => {
        message.error('Đăng nhập bằng Google thất bại: Lỗi xác thực hoặc bị hủy.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
                <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Title level={3}>Hệ thống Tuyển dụng</Title>
                        <p>Đăng nhập để tiếp tục</p>
                    </div>

                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        onValuesChange={() => setLoginError('')}
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                            style={{ marginBottom: 5 }}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginBottom: 15 }}>
                            <Link to="/forgot-password" style={{ color: '#1890ff' }}>Quên mật khẩu?</Link>
                        </div>

                        {loginError && (
                            <div style={{ marginBottom: 15 }}>
                                <Text type="danger">{loginError}</Text>
                            </div>
                        )}

                        <Form.Item style={{ marginBottom: 10 }}>
                            <Button type="primary" htmlType="submit" block size="large">
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <Divider>Hoặc</Divider>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                            />
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </div>
                    </Form>
                </Card>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;