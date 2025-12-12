import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const PostJob = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get('/users/me').then(res => setUser(res.data));
    }, []);

    const onFinish = async (values) => {
        if (!user) return;
        setLoading(true);
        try {
            await axiosClient.post(`/recruitment/jobs?recruiterId=${user.id}`, {
                ...values,
                status: 'OPEN'
            });
            message.success('Đăng tin tuyển dụng thành công!');
            navigate('/jobs');
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, width: '100%', maxWidth: 800, margin: '0 auto' }}>
            <Card title="Đăng tin tuyển dụng mới">
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Tiêu đề công việc" name="title" rules={[{ required: true }]}>
                        <Input placeholder="VD: Senior Java Developer" />
                    </Form.Item>

                    <Form.Item label="Mức lương" name="salaryRange" rules={[{ required: true }]}>
                        <Input placeholder="VD: 1000$ - 2000$" />
                    </Form.Item>

                    <Form.Item label="Địa điểm" name="location" rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}>
                        <Select placeholder="Chọn địa điểm">
                            <Select.Option value="Hà Nội">Hà Nội</Select.Option>
                            <Select.Option value="Hồ Chí Minh">Hồ Chí Minh</Select.Option>
                            <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
                            <Select.Option value="Remote">Remote</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ngành nghề" name="category" rules={[{ required: true, message: 'Vui lòng chọn ngành nghề' }]}>
                        <Select placeholder="Chọn ngành nghề">
                            <Select.Option value="IT">Công nghệ thông tin</Select.Option>
                            <Select.Option value="Marketing">Marketing</Select.Option>
                            <Select.Option value="HR">Nhân sự</Select.Option>
                            <Select.Option value="Finance">Tài chính - Kế toán</Select.Option>
                            <Select.Option value="Sales">Kinh doanh</Select.Option>
                            <Select.Option value="Design">Thiết kế</Select.Option>
                            <Select.Option value="Other">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Mô tả chi tiết" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                        <TextArea rows={6} placeholder="Mô tả yêu cầu công việc..." />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading}>
                        Đăng tin
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default PostJob;