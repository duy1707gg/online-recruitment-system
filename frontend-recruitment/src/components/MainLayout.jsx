import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, message, Spin, FloatButton, Modal } from 'antd';
import { UserOutlined, CodeOutlined, LogoutOutlined, DollarOutlined, FormOutlined, RobotOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

import ChatbotWidget from '../pages/ChatbotWidget';
import NotificationBell from "./NotificationBell.jsx";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [isChatModalVisible, setIsChatModalVisible] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get('/users/me');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const userMenu = (
        <Menu items={[
            {
                key: 'profile',
                label: <Link to="/profile">Hồ sơ cá nhân</Link>,
                icon: <UserOutlined />
            },
            { key: '2', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
        ]} />
    );

    let navItems = [
        { key: 'home', label: <Link to="/">Trang chủ</Link>, icon: <CodeOutlined /> },
    ];

    if (user?.role === 'CANDIDATE') {
        navItems.push(
            { key: 'jobs', label: <Link to="/jobs">Tìm việc</Link>, icon: <DollarOutlined /> },
            { key: 'my-apps', label: <Link to="/my-applications">Hồ sơ của tôi</Link>, icon: <UserOutlined /> },
        );
    } else {
        if (user?.role === 'RECRUITER' || user?.role === 'ADMIN') {
            navItems.push(
                { key: 'post', label: <Link to="/post-job">Đăng tuyển</Link>, icon: <FormOutlined /> },
                { key: 'manage', label: <Link to="/manage-jobs">Quản lý tuyển dụng</Link>, icon: <UserOutlined /> },
                { key: 'dashboard', label: <Link to="/dashboard/analytics">Thống kê</Link>, icon: <BarChartOutlined /> }
            );
        }
        if (user?.role === 'ADMIN') {
            navItems.push(
                { key: 'problems', label: <Link to="/manage-problems">Problems</Link>, icon: <CodeOutlined /> },
                { key: 'users', label: <Link to="/manage-users">Người dùng</Link>, icon: <UserOutlined /> }
            );
        }
    }

    const getActiveKey = () => {
        const path = location.pathname;

        if (path === '/') return ['home'];
        if (path === '/jobs') return ['jobs'];
        if (path === '/my-applications') return ['my-apps'];
        if (path === '/post-job') return ['post'];
        if (path === '/manage-jobs') return ['manage'];
        if (path === '/manage-problems') return ['problems'];
        if (path === '/dashboard/analytics') return ['dashboard'];

        return [];
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 30 }}>
                    CMC Code Assessment
                </div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={getActiveKey()}
                    items={navItems}
                    style={{ flex: 1 }}
                />

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {user && <NotificationBell />}

                    {user ? (
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <div style={{ cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', marginLeft: 16 }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    src={user.avatarUrl}
                                    style={{ marginRight: 8, backgroundColor: '#1890ff' }}
                                >
                                    {!user.avatarUrl && user.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <span>{user.fullName}</span>
                            </div>
                        </Dropdown>
                    ) : <Spin />}
                </div>

            </Header>

            <Content style={{ padding: '20px 50px' }}>
                <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: 8, marginTop: 20 }}>
                    <Outlet />
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Online Recruitment System ©2025 Created by CMC Student
            </Footer>

            <FloatButton
                icon={<RobotOutlined />}
                type="primary"
                onClick={() => setIsChatModalVisible(true)}
                tooltip={<div>Trợ lý AI</div>}
                style={{ right: 24, bottom: 24 }}
            />

            <Modal
                title="Trợ lý AI Tuyển dụng"
                open={isChatModalVisible}
                onCancel={() => setIsChatModalVisible(false)}
                footer={null} // Ẩn footer
                width={450}
                destroyOnClose={true}
                styles={{ content: { padding: 0 } }}
            >
                <ChatbotWidget isModal={true} />
            </Modal>
        </Layout>
    );
};

export default MainLayout;