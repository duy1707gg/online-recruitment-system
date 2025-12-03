import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Avatar, Typography, Tabs, Row, Col, Tag, InputNumber, Upload } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined,
    NumberOutlined,
    HomeOutlined,
    CameraOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');

    const [formInfo] = Form.useForm();
    const [formPass] = Form.useForm();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/users/me');

            setUserData(response.data);

            if (response.data.avatarUrl) {
                setAvatarUrl(response.data.avatarUrl);
            }

            formInfo.setFieldsValue({
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role,
                phoneNumber: response.data.phoneNumber,
                address: response.data.address,
                age: response.data.age
            });
        } catch (error) {
            console.error(error);
            message.error('Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadAvatar = async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axiosClient.post('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            message.success('Tải ảnh đại diện thành công!');

            setAvatarUrl(res.data);
        } catch (error) {
            message.error('Lỗi tải ảnh!');
        }
    };

    const handleUpdateInfo = async (values) => {
        try {
            setLoading(true);
            await axiosClient.put('/users/update-profile', {
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                address: values.address,
                age: values.age
            });
            message.success('Cập nhật hồ sơ thành công!');
            fetchUserProfile();
        } catch (error) {
            console.error(error);
            message.error('Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        try {
            setLoading(true);
            await axiosClient.post('/users/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            message.success('Đổi mật khẩu thành công!');
            formPass.resetFields();
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ!';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const items = [
        {
            key: '1',
            label: 'Thông tin chung',
            children: (
                <Form
                    form={formInfo}
                    layout="vertical"
                    onFinish={handleUpdateInfo}
                    disabled={loading}
                >
                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Nhập họ tên' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Họ tên" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="Tuổi"
                                name="age"
                                rules={[{ type: 'number', min: 18, max: 100, message: 'Tuổi không hợp lệ' }]}
                            >
                                <InputNumber
                                    prefix={<NumberOutlined />}
                                    style={{ width: '100%' }}
                                    placeholder="Tuổi"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Email" name="email">
                                <Input prefix={<MailOutlined />} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                                rules={[{ pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Địa chỉ" name="address">
                                <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ nơi ở" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Vai trò" name="role">
                        <div style={{ padding: '4px 0' }}>
                            {userData?.role === 'RECRUITER'
                                ? <Tag color="blue">Nhà tuyển dụng</Tag>
                                : <Tag color="green">Ứng viên</Tag>
                            }
                        </div>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginTop: 10 }}>
                        Lưu thay đổi
                    </Button>
                </Form>
            ),
        },
        {
            key: '2',
            label: 'Đổi mật khẩu',
            children: (
                <Form
                    form={formPass}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    disabled={loading}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                    </Form.Item>

                    <Button type="primary" danger htmlType="submit" loading={loading} style={{ marginTop: 10 }}>
                        Đổi mật khẩu
                    </Button>
                </Form>
            ),
        },
    ];

    return (
        <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            <Card
                style={{ width: '100%', maxWidth: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #f0f0f0' }}>

                    {/* --- KHU VỰC AVATAR --- */}
                    <div style={{ marginRight: 24, textAlign: 'center' }}>
                        <Upload
                            showUploadList={false}
                            customRequest={handleUploadAvatar}
                            accept="image/*"
                        >
                            <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
                                <Avatar
                                    size={100}
                                    src={avatarUrl}
                                    style={{ backgroundColor: '#1890ff', fontSize: '32px' }}
                                    icon={<UserOutlined />}
                                >
                                    {!avatarUrl && userData?.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>

                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    border: '1px solid #d9d9d9',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <CameraOutlined style={{ color: '#555', fontSize: '16px' }} />
                                </div>
                            </div>
                        </Upload>
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>Nhấn để đổi ảnh</div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ marginBottom: 8, marginTop: 0 }}>
                            {userData?.fullName || 'Người dùng'}
                        </Title>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <Text type="secondary" style={{ fontSize: '15px' }}>
                                <MailOutlined style={{ marginRight: 8 }} />
                                {userData?.email || 'Đang tải...'}
                            </Text>

                            {userData?.phoneNumber && (
                                <Text type="secondary" style={{ fontSize: '15px' }}>
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    {userData.phoneNumber}
                                </Text>
                            )}

                            {userData?.address && (
                                <Text type="secondary" style={{ fontSize: '15px' }}>
                                    <HomeOutlined style={{ marginRight: 8 }} />
                                    {userData.address}
                                </Text>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs defaultActiveKey="1" items={items} type="card" size='large' />
            </Card>
        </div>
    );
};

export default ProfilePage;