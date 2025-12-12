import React, { useEffect, useState, useCallback } from 'react';
import { List, Card, Button, Tag, Modal, message, Upload, Typography, Input, Select, Pagination, Row, Col, Space, Empty } from 'antd';
import { DollarOutlined, EnvironmentOutlined, InboxOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { Search } = Input;

// Danh sách ngành nghề
const CATEGORIES = [
    { value: '', label: 'Tất cả ngành nghề' },
    { value: 'IT', label: 'Công nghệ thông tin' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'Nhân sự' },
    { value: 'Finance', label: 'Tài chính - Kế toán' },
    { value: 'Sales', label: 'Kinh doanh' },
    { value: 'Design', label: 'Thiết kế' },
    { value: 'Other', label: 'Khác' },
];

// Danh sách địa điểm
const LOCATIONS = [
    { value: '', label: 'Tất cả địa điểm' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Remote', label: 'Remote' },
];

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search & Filter state
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [totalItems, setTotalItems] = useState(0);

    // Apply modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [applyError, setApplyError] = useState('');

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1, // Backend uses 0-indexed
                size: pageSize,
            };

            if (keyword) params.keyword = keyword;
            if (location) params.location = location;
            if (category) params.category = category;

            const res = await axiosClient.get('/recruitment/jobs/search', { params });

            setJobs(res.data.content || []);
            setTotalItems(res.data.totalElements || 0);
        } catch (error) {
            console.error("Lỗi tải danh sách việc làm", error);
            // Fallback to old API if search endpoint not available
            try {
                const fallbackRes = await axiosClient.get('/recruitment/jobs');
                setJobs(fallbackRes.data || []);
                setTotalItems(fallbackRes.data.length || 0);
            } catch (e) {
                setJobs([]);
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, keyword, location, category]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = (value) => {
        setKeyword(value);
        setCurrentPage(1); // Reset to first page
    };

    const handleLocationChange = (value) => {
        setLocation(value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleClearFilters = () => {
        setKeyword('');
        setLocation('');
        setCategory('');
        setCurrentPage(1);
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
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
            <Title level={2}>Việc làm đang tuyển</Title>

            {/* Search & Filter Section */}
            <Card style={{ marginBottom: 20 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <Search
                            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={12} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Địa điểm"
                            value={location}
                            onChange={handleLocationChange}
                            options={LOCATIONS}
                            suffixIcon={<EnvironmentOutlined />}
                        />
                    </Col>
                    <Col xs={12} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Ngành nghề"
                            value={category}
                            onChange={handleCategoryChange}
                            options={CATEGORIES}
                            suffixIcon={<FilterOutlined />}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Space>
                            <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
                            <Text type="secondary">
                                Tìm thấy {totalItems} việc làm
                            </Text>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Job List */}
            {jobs.length === 0 && !loading ? (
                <Empty
                    description="Không tìm thấy việc làm phù hợp"
                    style={{ padding: 50 }}
                />
            ) : (
                <List
                    loading={loading}
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                    dataSource={jobs}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                title={item.title}
                                extra={
                                    <Space>
                                        {item.category && <Tag color="purple">{item.category}</Tag>}
                                        <Tag color="blue">OPEN</Tag>
                                    </Space>
                                }
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
            )}

            {/* Pagination */}
            {totalItems > 0 && (
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={handlePageChange}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['9', '18', '27']}
                        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} việc làm`}
                    />
                </div>
            )}

            {/* Apply Modal */}
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