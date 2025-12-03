import React, { useEffect, useState } from 'react';
import { Table, Button, message, Tag, Popconfirm, Avatar, Tooltip, Input, Modal, Form, Select } from 'antd';
import { DeleteOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Option } = Select;

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
    const [formCreate] = Form.useForm();

    useEffect(() => {
        fetchUsers();
        axiosClient.get('/users/me').then(res => setCurrentUser(res.data));
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axiosClient.delete(`/admin/users/${userId}`);
            message.success('Đã xóa người dùng!');
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    const handleCreateUser = async (values) => {
        try {
            await axiosClient.post('/admin/users', values);
            message.success('Tạo người dùng thành công!');
            setIsModalCreateOpen(false);
            formCreate.resetFields();
            fetchUsers();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Tạo thất bại!');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        src={record.avatarUrl ? record.avatarUrl : null}
                        icon={<UserOutlined />}
                        style={{ marginRight: 10 }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'default';
                if (role === 'ADMIN') color = 'gold';
                if (role === 'RECRUITER') color = 'blue';
                if (role === 'CANDIDATE') color = 'green';
                return <Tag color={color}>{role}</Tag>;
            },
            filters: [
                { text: 'Ứng viên', value: 'CANDIDATE' },
                { text: 'Nhà tuyển dụng', value: 'RECRUITER' },
                { text: 'Admin', value: 'ADMIN' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'SĐT',
            dataIndex: 'phoneNumber',
            key: 'phone',
            render: (phone) => phone || '---'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const isSelf = currentUser && currentUser.id === record.id;

                return (
                    <Popconfirm
                        title="Xóa người dùng này?"
                        description="Hành động này sẽ xóa toàn bộ dữ liệu của họ."
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        disabled={isSelf}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={isSelf}
                        >
                            {isSelf ? 'Tôi' : 'Xóa'}
                        </Button>
                    </Popconfirm>
                );
            }
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Quản lý người dùng hệ thống</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalCreateOpen(true)}>
                    Tạo người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title="Tạo người dùng mới"
                open={isModalCreateOpen}
                onCancel={() => setIsModalCreateOpen(false)}
                footer={null}
            >
                <Form form={formCreate} layout="vertical" onFinish={handleCreateUser}>
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        initialValue="CANDIDATE"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select>
                            <Option value="CANDIDATE">Ứng viên (CANDIDATE)</Option>
                            <Option value="RECRUITER">Nhà tuyển dụng (RECRUITER)</Option>
                            <Option value="ADMIN">Quản trị viên (ADMIN)</Option>
                        </Select>
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 20 }}>
                        <Button onClick={() => setIsModalCreateOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Tạo mới</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageUsers;