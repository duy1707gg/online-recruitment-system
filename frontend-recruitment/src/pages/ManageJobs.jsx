import React, { useEffect, useState } from 'react';
import {
    Table, Button, Modal, message, Tag, Space, Popconfirm,
    Tooltip, Form, Input, Select, DatePicker
} from 'antd';
import {
    EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,
    VideoCameraOutlined, DeleteOutlined, EditOutlined,
    TrophyOutlined, CalendarOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;

const ManageJobs = () => {

    const [jobs, setJobs] = useState([]);

    const [applications, setApplications] = useState([]);
    const [isModalAppOpen, setIsModalAppOpen] = useState(false);

    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const [isModalScheduleOpen, setIsModalScheduleOpen] = useState(false);
    const [interviewers, setInterviewers] = useState([]);
    const [currentAppIdForSchedule, setCurrentAppIdForSchedule] = useState(null);
    const [isScheduling, setIsScheduling] = useState(false);

    const [formEdit] = Form.useForm();
    const [formSchedule] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
        fetchInterviewers();
    }, []);

    const fetchJobs = () => {
        axiosClient.get('/recruitment/jobs/all').then(res => setJobs(res.data));
    };


    const fetchInterviewers = async () => {
        try {
            const res = await axiosClient.get('/users');

            setInterviewers(res.data);
        } catch (error) {
            console.error("Không thể tải danh sách người dùng");
        }
    };

    const handleDeleteJob = async (jobId) => {
        try {
            await axiosClient.delete(`/recruitment/jobs/${jobId}`);
            message.success('Đã xóa tin tuyển dụng!');
            fetchJobs();
        } catch (error) {
            message.error('Không thể xóa tin này (Có thể đã có người ứng tuyển)');
        }
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        formEdit.setFieldsValue({
            title: job.title,
            description: job.description,
            salaryRange: job.salaryRange,
            location: job.location,
            status: job.status
        });
        setIsModalEditOpen(true);
    };

    const handleUpdateJob = async (values) => {
        try {
            await axiosClient.put(`/recruitment/jobs/${editingJob.id}`, values);
            message.success('Cập nhật thành công!');
            setIsModalEditOpen(false);
            fetchJobs();
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const viewApplications = async (jobId) => {
        try {
            const res = await axiosClient.get(`/recruitment/jobs/${jobId}/applications`);
            setApplications(res.data);
            setIsModalAppOpen(true);
        } catch (error) {
            message.error("Lỗi tải danh sách ứng viên");
        }
    };

    const updateStatus = async (appId, status) => {
        try {
            await axiosClient.put(`/recruitment/applications/${appId}/status?status=${status}`);
            message.success(`Đã chuyển trạng thái sang ${status}!`);
            refreshApplications(appId, status); // Cập nhật UI ngay lập tức
        } catch (error) {
            message.error('Lỗi cập nhật');
        }
    };

    const handleDeleteApp = async (applicationId) => {
        try {
            await axiosClient.delete(`/recruitment/applications/${applicationId}`);
            message.success('Đã xóa hồ sơ thành công!');
            setApplications(prev => prev.filter(item => item.id !== applicationId));
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    const refreshApplications = (appId, newStatus) => {
        setApplications(prev => prev.map(item => item.id === appId ? { ...item, status: newStatus } : item));
    };

    const openScheduleModal = (applicationId) => {
        setCurrentAppIdForSchedule(applicationId);
        formSchedule.resetFields();
        setIsModalScheduleOpen(true);
    };

    const handleScheduleSubmit = async (values) => {
        setIsScheduling(true);
        try {
            const timeFormatted = values.time.format('YYYY-MM-DDTHH:mm:ss');

            await axiosClient.post('/interviews/schedule', null, {
                params: {
                    applicationId: currentAppIdForSchedule,
                    interviewerId: values.interviewerId,
                    time: timeFormatted
                }
            });

            message.success('Lên lịch phỏng vấn thành công!');
            setIsModalScheduleOpen(false);

        } catch (error) {
            console.error(error);
            message.error('Lỗi khi lên lịch phỏng vấn!');
        } finally {
            setIsScheduling(false);
        }
    };

    const jobColumns = [
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: t => <Tag color="blue">{t}</Tag> },
        {
            title: 'Thao tác',
            key: 'action',
            width: 300,
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => viewApplications(record.id)}>
                        Xem UV
                    </Button>
                    <Tooltip title="Sửa tin">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa tin này?"
                        description="Hành động không thể hoàn tác"
                        onConfirm={() => handleDeleteJob(record.id)}
                        okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa tin">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const appColumns = [
        { title: 'Tên ứng viên', dataIndex: ['candidate', 'fullName'], key: 'name' },
        {
            title: 'CV Link',
            dataIndex: 'cvUrl',
            key: 'cv',
            render: (cvUrl) => cvUrl ? <a href={cvUrl} target="_blank" rel="noreferrer">Xem CV</a> : 'Chưa có'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'INTERVIEWING') color = 'purple';
                if (status === 'REJECTED') color = 'red';
                if (status === 'APPLIED') color = 'orange';
                if (status === 'OFFERED') color = 'blue';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const isInterviewing = record.status === 'INTERVIEWING';
                const interviewTime = record.interview ? dayjs(record.interview.scheduledTime) : null;
                const canJoin = isInterviewing && interviewTime && dayjs().isAfter(interviewTime.subtract(15, 'minute'));

                return (
                    <Space wrap>
                        <Button
                            type="dashed"
                            size="small"
                            icon={<CalendarOutlined />}
                            onClick={() => openScheduleModal(record.id)}
                            disabled={record.status === 'OFFERED' || record.status === 'REJECTED' || isInterviewing}
                        >
                            Lên lịch
                        </Button>

                        <Button
                            type="default" size="small" icon={<TrophyOutlined />}
                            style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: 'white' }}
                            onClick={() => updateStatus(record.id, 'OFFERED')}
                            disabled={record.status === 'OFFERED' || record.status === 'REJECTED'}
                        >
                            Đề nghị
                        </Button>

                        <Button
                            danger size="small" icon={<CloseCircleOutlined />}
                            onClick={() => updateStatus(record.id, 'REJECTED')}
                            disabled={record.status === 'OFFERED' || record.status === 'REJECTED'}
                        >
                            Loại
                        </Button>

                        <Popconfirm title="Xóa hồ sơ này?" onConfirm={() => handleDeleteApp(record.id)} okButtonProps={{ danger: true }}>
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>

                        {canJoin && (
                            <Button
                                size="small" type="primary" danger ghost
                                icon={<VideoCameraOutlined />}
                                onClick={() => navigate(`/room/interview-${record.interview.roomId}`)}
                            >
                                Vào họp
                            </Button>
                        )}
                    </Space>
                );
            }
        }
    ];

    return (
        <div style={{ padding: 20 }} >
            <h2>Quản lý tin tuyển dụng</h2>
            <Table dataSource={jobs} columns={jobColumns} rowKey="id" />

            <Modal
                title="Danh sách ứng tuyển"
                open={isModalAppOpen}
                onCancel={() => setIsModalAppOpen(false)}
                footer={null}
                width={1000}
            >
                <Table dataSource={applications} columns={appColumns} rowKey="id" pagination={{ pageSize: 5 }} />
            </Modal>

            <Modal
                title="Cập nhật tin tuyển dụng"
                open={isModalEditOpen}
                onCancel={() => setIsModalEditOpen(false)}
                footer={null}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleUpdateJob}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            <Option value="OPEN">Đang tuyển (OPEN)</Option>
                            <Option value="CLOSED">Đã đóng (CLOSED)</Option>
                            <Option value="DRAFT">Bản nháp (DRAFT)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="salaryRange" label="Mức lương"><Input /></Form.Item>
                    <Form.Item name="location" label="Địa điểm"><Input /></Form.Item>
                    <Form.Item name="description" label="Mô tả chi tiết"><Input.TextArea rows={4} /></Form.Item>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setIsModalEditOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Lên lịch phỏng vấn"
                open={isModalScheduleOpen}
                onCancel={() => setIsModalScheduleOpen(false)}
                footer={null}
            >
                <Form form={formSchedule} layout="vertical" onFinish={handleScheduleSubmit}>
                    <Form.Item
                        name="interviewerId"
                        label="Người phỏng vấn"
                        rules={[{ required: true, message: 'Vui lòng chọn người phỏng vấn!' }]}
                    >
                        <Select placeholder="Chọn người phỏng vấn">
                            {interviewers.map(user => (
                                <Option key={user.id} value={user.id}>
                                    {user.fullName} ({user.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="time"
                        label="Thời gian phỏng vấn"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 20 }}>
                        <Button onClick={() => setIsModalScheduleOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isScheduling}>Xác nhận lịch</Button>
                    </div>
                </Form>
            </Modal>
        </div >
    );
};

export default ManageJobs;