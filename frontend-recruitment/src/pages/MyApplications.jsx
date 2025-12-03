import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Card, message, Tooltip, Upload, Popconfirm } from 'antd';
import {
    VideoCameraOutlined,
    StopOutlined,
    UploadOutlined,
    DeleteOutlined,
    FilePdfOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/recruitment/applications/my');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
            message.error('Không thể tải danh sách ứng tuyển');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleUpdateCv = async (file, applicationId) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axiosClient.put(`/recruitment/applications/${applicationId}/update-cv`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            message.success('Cập nhật CV thành công!');
            fetchApplications();
        } catch (error) {
            message.error('Cập nhật thất bại!');
        }
    };

    const handleDelete = async (applicationId) => {
        try {
            await axiosClient.delete(`/recruitment/applications/${applicationId}/cancel`);
            message.success('Đã hủy đơn ứng tuyển.');
            fetchApplications();
        } catch (error) {
            message.error('Không thể hủy đơn này (có thể do trạng thái không hợp lệ).');
        }
    };

    const columns = [
        {
            title: 'Công việc',
            dataIndex: ['job', 'title'],
            key: 'job',
            render: (text, record) => (
                <div>
                    <strong style={{ fontSize: 16 }}>{text}</strong>
                    {record.job.status === 'CLOSED' && (
                        <Tag color="red" style={{ marginLeft: 8 }}>
                            ĐÃ ĐÓNG
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Mức lương',
            dataIndex: ['job', 'salaryRange'],
            key: 'salary',
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'appliedAt',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'INTERVIEWING') color = 'green';
                if (status === 'REJECTED') color = 'red';
                if (status === 'APPLIED') color = 'orange';
                if (status === 'OFFERED') color = 'blue';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 250,
            render: (_, record) => {
                if (record.job.status === 'CLOSED') {
                    return (
                        <Tooltip title="Tin tuyển dụng này đã đóng">
                            <Button disabled icon={<StopOutlined />}>
                                Ngưng tuyển
                            </Button>
                        </Tooltip>
                    );
                }

                const isInterviewing = record.status === 'INTERVIEWING';
                const interviewTime = record.interview ? dayjs(record.interview.scheduledTime) : null;
                const canJoin = isInterviewing && interviewTime && dayjs().isAfter(interviewTime.subtract(15, 'minute'));

                if (canJoin) {
                    return (
                        <Button
                            type="primary"
                            icon={<VideoCameraOutlined />}
                            onClick={() => navigate(`/room/interview-${record.interview.roomId}`)}
                        >
                            Vào phỏng vấn
                        </Button>
                    );
                }

                const isFinalState = record.status === 'OFFERED' || record.status === 'REJECTED';

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Upload
                            beforeUpload={(file) => {
                                handleUpdateCv(file, record.id);
                                return false;
                            }}
                            showUploadList={false}
                        >
                            <Tooltip title="Cập nhật lại CV">
                                <Button
                                    icon={<UploadOutlined />}
                                    size="small"
                                    disabled={isFinalState}
                                >
                                    Sửa CV
                                </Button>
                            </Tooltip>
                        </Upload>

                        <Popconfirm
                            title="Hủy ứng tuyển?"
                            description="Bạn có chắc chắn muốn rút hồ sơ này không?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Tooltip title="Rút hồ sơ">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    disabled={isFinalState}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </div>
                );
            }
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <Card title="Lịch sử ứng tuyển của tôi">
                <Table
                    loading={loading}
                    dataSource={applications}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default MyApplications;