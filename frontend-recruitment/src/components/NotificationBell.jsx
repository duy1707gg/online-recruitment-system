import React, { useEffect, useState, useRef } from 'react';
import { Badge, Popover, List, Avatar, Typography, Empty, message } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axiosClient from '../api/axiosClient.js'; // Đảm bảo đường dẫn đúng tới file cấu hình axios của bạn
import dayjs from 'dayjs';

const { Text } = Typography;

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState(null);
    const [open, setOpen] = useState(false);

    // Ref giữ kết nối socket để tránh re-render
    const stompClient = useRef(null);

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Lấy thông tin user hiện tại
                const userRes = await axiosClient.get('/users/me');
                const uid = userRes.data.id;
                setUserId(uid);

                // 2. Lấy lịch sử thông báo cũ từ Database
                fetchHistory(uid);

                // 3. Kết nối WebSocket
                connectWebSocket(uid);
            } catch (error) {
                console.error("Lỗi khởi tạo NotificationBell:", error);
            }
        };

        initData();

        // Cleanup khi component unmount
        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect();
            }
        };
    }, []);

    // Hàm lấy lịch sử thông báo
    const fetchHistory = async (uid) => {
        try {
            // Giả sử API backend là GET /notifications/{userId}
            const res = await axiosClient.get(`/notifications/${uid}`);
            if (res.data) {
                setNotifications(res.data);
                // Đếm số thông báo có read = false
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.warn("Không thể tải lịch sử thông báo (Có thể API chưa sẵn sàng).");
        }
    };

    // Hàm kết nối WebSocket
    const connectWebSocket = (uid) => {
        // URL này phải khớp với config bên Spring Boot (registry.addEndpoint("/ws"))
        const socket = new SockJS('http://localhost:8081/ws');
        const client = Stomp.over(socket);

        // Tắt log debug của STOMP để console gọn gàng hơn
        client.debug = () => {};

        client.connect(
            {},
            () => {
                stompClient.current = client;
                // Subscribe kênh riêng của user
                client.subscribe(`/topic/notifications/${uid}`, (msg) => {
                    const newNotif = JSON.parse(msg.body);
                    handleNewNotification(newNotif);
                });
            },
            (error) => {
                console.error("Lỗi kết nối WebSocket:", error);
            }
        );
    };

    // Xử lý khi có thông báo mới đến
    const handleNewNotification = (newNotif) => {
        // 1. Thêm vào đầu danh sách
        setNotifications(prev => [newNotif, ...prev]);

        // 2. Tăng số lượng chưa đọc
        setUnreadCount(prev => prev + 1);

        // 3. Hiển thị Toast thông báo góc màn hình
        message.info({
            content: `🔔 ${newNotif.content}`,
            duration: 4,
            style: { marginTop: '5vh' },
        });
    };

    // Xử lý khi bấm mở Popover (Đánh dấu đã đọc)
    const handleOpenChange = async (visible) => {
        setOpen(visible);
        if (visible && unreadCount > 0) {
            try {
                // Nếu backend có API "Đánh dấu tất cả đã đọc", gọi ở đây
                // await axiosClient.put(`/notifications/read-all/${userId}`);

                // Cập nhật UI: Reset số lượng chưa đọc về 0
                setUnreadCount(0);

                // Cập nhật trạng thái visual của danh sách
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } catch (error) {
                console.error("Lỗi đánh dấu đã đọc", error);
            }
        }
    };

    // Nội dung danh sách thông báo bên trong Popover
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
                    <Text type="secondary" style={{ fontSize: 12 }}>{notifications.length} tin</Text>
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
                            // Màu nền xanh nhạt nếu chưa đọc, trắng nếu đã đọc
                            backgroundColor: item.read ? '#fff' : '#e6f7ff',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        // Hover effect có thể thêm bằng CSS global
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
                        {/* Dấu chấm xanh nếu chưa đọc */}
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
                            color: '#000', // Màu icon chuông
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