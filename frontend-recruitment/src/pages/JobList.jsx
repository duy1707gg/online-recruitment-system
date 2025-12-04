import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Modal, message, Upload, Typography } from 'antd';
import { DollarOutlined, EnvironmentOutlined, InboxOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Dragger } = Upload;
const { Text } = Typography;

const JobList = () => {
    const [jobs, setJobs] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [applyError, setApplyError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axiosClient.get('/recruitment/jobs');
            setJobs(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách việc làm", error);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            setFileList([]);
            setApplyError('');
        },
        beforeUpload: (file) => {
            setApplyError('');
            const isValidType = file.type === 'application/pdf' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (!isValidType) {
                message.error('Chỉ chấp nhận file PDF hoặc Word!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false;
        },
        fileList,
    };

    const handleApply = async () => {
        setApplyError('');
        if (fileList.length === 0) {
            message.warning('Vui lòng tải lên CV của bạn!');
            return;
        }

        const formData = new FormData();
        formData.append('jobId', selectedJobId);
        formData.append('cvFile', fileList[0]);

        try {
            setUploading(true);

            await axiosClient.post('/recruitment/apply', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Ứng tuyển thành công!');
            setIsModalOpen(false);
            setFileList([]);
        } catch (error) {
            let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại!';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            }
            setApplyError(errorMsg);
            // message.error(errorMsg); // Optional: keep or remove toast
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Việc làm đang tuyển</h2>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                dataSource={jobs}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            title={item.title}
                            extra={<Tag color="blue">OPEN</Tag>}
                            hoverable
                        >
                            <p><DollarOutlined /> {item.salaryRange || 'Thỏa thuận'}</p>
                            <p><EnvironmentOutlined /> {item.location || 'Remote/Office'}</p>
                            <p style={{ color: '#666', height: 60, overflow: 'hidden' }}>
                                {item.description}
                            </p>

                            <Button type="primary" block onClick={() => {
                                setSelectedJobId(item.id);
                                setFileList([]);
                                setApplyError('');
                                setIsModalOpen(true);
                            }}>
                                Ứng tuyển ngay
                            </Button>
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
                title="Nộp hồ sơ ứng tuyển"
                open={isModalOpen}
                onOk={handleApply}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={uploading}
                okText="Nộp hồ sơ"
                cancelText="Hủy"
            >
                <p style={{ marginBottom: 10 }}>Vui lòng tải lên CV của bạn (Định dạng .pdf, .docx):</p>

                <Dragger {...uploadProps} maxCount={1}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây</p>
                    <p className="ant-upload-hint">
                        Hỗ trợ file PDF hoặc Word.
                    </p>
                </Dragger>
                {applyError && (
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                        <Text type="danger">{applyError}</Text>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default JobList;