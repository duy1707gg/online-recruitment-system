import React, { useEffect, useState, useRef } from 'react';
import { Badge, Popover, List, Avatar, Typography, Empty, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axiosClient from '../api/axiosClient.js';
import dayjs from 'dayjs';

const { Text } = Typography;

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState(null);
    const [open, setOpen] = useState(false);

    const stompClient = useRef(null);
    const isConnected = useRef(false);

    useEffect(() => {
        const initData = async () => {
            try {
                const userRes = await axiosClient.get('/users/me');
                const uid = userRes.data.id;
                setUserId(uid);

                fetchHistory(uid);

                connectWebSocket(uid);
            } catch (error) {
                console.error("Lỗi khởi tạo NotificationBell:", error);
            }
        };

        initData();

        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect();
            }
            isConnected.current = false;
        };
    }, []);


    const fetchHistory = async (uid) => {
        try {
            const res = await axiosClient.get(`/notifications/${uid}`);
            if (res.data) {
                setNotifications(res.data);
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.warn("Không thể tải lịch sử thông báo.", error);
        }
    };

    const connectWebSocket = (uid) => {
        if (isConnected.current) {
            return;
        }
        isConnected.current = true; // Mark as connecting immediately

        const backendHost = window.location.hostname;

        let socketUrl = `https://${backendHost}/ws`;
        if (backendHost === 'localhost') {
            socketUrl = `http://${backendHost}:8081/ws`;
        }

        const socket = new SockJS(socketUrl);
        const client = Stomp.over(socket);

        client.debug = () => { };

        client.connect(
            {},
            () => {
                stompClient.current = client;
                // isConnected.current is already true
                client.subscribe(`/topic/notifications/${uid}`, (msg) => {
                    const newNotif = JSON.parse(msg.body);
                    handleNewNotification(newNotif);
                });
            },
            (error) => {
                console.error("Lỗi kết nối WebSocket:", error);
                isConnected.current = false; // Reset on error
            }
        );
    };

    const handleNewNotification = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        message.info({
            content: `🔔 ${newNotif.content}`,
            duration: 4,
            style: { marginTop: '5vh' },
        });
    };

    const markSingleNotificationAsRead = async (notificationId, isRead) => {
        if (!isRead) {
            try {
                await axiosClient.put(`/notifications/${notificationId}/read`);

                setNotifications(prev => prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                ));

                setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
            } catch (error) {
                console.error("Lỗi đánh dấu đã đọc riêng lẻ", error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (!userId) {
            message.error("Không tìm thấy ID người dùng.");
            return;
        }

        try {
            await axiosClient.delete(`/notifications/delete-all/${userId}`);

            setNotifications([]);
            setUnreadCount(0);
            message.success("Đã xóa tất cả thông báo.");
            setOpen(false);
        } catch (error) {
            message.error("Lỗi khi xóa tất cả thông báo.");
            console.error("Lỗi xóa tất cả:", error);
        }
    };


    const handleOpenChange = async (visible) => {
        setOpen(visible);
        if (visible && unreadCount > 0) {
            try {
                await axiosClient.put(`/notifications/read-all/${userId}`);

                setUnreadCount(0);

                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch (error) {
                console.error("Lỗi đánh dấu đã đọc", error);
            }
        }
    };

    const popoverContent = (
        <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{
                padding: '8px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fafafa'
            }}>
                <Text strong>Thông báo</Text>

                {notifications.length > 0 && (
                    <Text
                        type="secondary"
                        style={{ fontSize: 12, cursor: 'pointer', color: '#ff4d4f' }}
                        onClick={handleDeleteAll}
                    >
                        Xóa tất cả
                    </Text>
                )}
            </div>

            <List
                itemLayout="horizontal"
                dataSource={notifications}
                locale={{
                    emptyText: <Empty description="Không có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
                renderItem={(item) => (
                    <List.Item
                        className="notification-item"
                        style={{
                            padding: '12px 16px',
                            backgroundColor: item.read ? '#fff' : '#e6f7ff',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onClick={() => markSingleNotificationAsRead(item.id, item.read)}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    style={{ backgroundColor: item.read ? '#ccc' : '#1890ff' }}
                                    icon={<BellOutlined />}
                                />
                            }
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong={!item.read} style={{ fontSize: 13 }}>Hệ thống</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {item.createdAt ? dayjs(item.createdAt).format('HH:mm DD/MM') : 'Mới'}
                                    </Text>
                                </div>
                            }
                            description={
                                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                                    {item.content}
                                </div>
                            }
                        />
                        {!item.read && <Badge status="processing" />}
                    </List.Item>
                )}
            />
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={handleOpenChange}
            overlayClassName="notification-popover"
        >
            <div style={{ cursor: 'pointer', display: 'inline-block', marginRight: 24 }}>
                <Badge count={unreadCount} overflowCount={99} size="small" offset={[0, 0]}>
                    <Avatar
                        shape="circle"
                        size="large"
                        icon={<BellOutlined />}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#f8f6f6',
                            border: '1px solid #d9d9d9',
                            cursor: 'pointer'
                        }}
                        className="notification-trigger"
                    />
                </Badge>
            </div>
        </Popover>
    );
};

export default NotificationBell;