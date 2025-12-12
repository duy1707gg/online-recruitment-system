import React, { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input,
    Select, InputNumber, Space, Tag,
    Popconfirm, message, Card, Typography,
    Checkbox
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManageProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null);
    const [form] = Form.useForm();

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/problems');
            setProblems(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách bài tập');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleOpenModal = (record = null) => {
        setEditingProblem(record);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({
                difficulty: 'EASY',
                cpuTimeLimit: 1.0,
                memoryLimitMb: 256,
                templateCode: `public class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}`
            });
        }
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        try {
            console.log('Form Values:', values);

            if (editingProblem) {
                await axiosClient.put(`/problems/${editingProblem.id}`, values);
                message.success('Cập nhật thành công!');
            } else {
                await axiosClient.post('/problems', values);
                message.success('Thêm bài tập thành công!');
            }
            setIsModalVisible(false);
            fetchProblems();
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra khi lưu! (Kiểm tra Server Console)');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/problems/${id}`);
            message.success('Đã xóa bài tập');
            fetchProblems();
        } catch (error) {
            message.error('Không thể xóa bài tập này');
        }
    };


    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: 'Tên bài toán',
            dataIndex: 'title',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            width: 100,
            render: (diff) => {
                let color = diff === 'EASY' ? 'green' : diff === 'MEDIUM' ? 'orange' : 'red';
                return <Tag color={color}>{diff}</Tag>;
            }
        },
        {
            title: 'Time (s)',
            dataIndex: 'cpuTimeLimit',
            width: 100,
        },
        {
            title: 'Memory (MB)',
            dataIndex: 'memoryLimitMb',
            width: 120,
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: 'blue' }} />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="text" icon={<DeleteOutlined style={{ color: 'red' }} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: '10px' }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý ngân hàng đề</Title>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchProblems}>Làm mới</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                            Thêm bài mới
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={problems}
                    rowKey="id"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: true }}
                />
            </Card>

            <Modal
                title={editingProblem ? "Chỉnh sửa bài tập" : "Thêm bài tập mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                width={800}
                style={{ top: 20 }}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="title"
                        label="Tên bài toán"
                        rules={[{ required: true, message: 'Vui lòng nhập tên bài!' }]}
                    >
                        <Input placeholder="Ví dụ: Two Sum" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Form.Item name="difficulty" label="Độ khó" style={{ flex: 1, minWidth: '120px' }} initialValue="EASY">
                            <Select>
                                <Option value="EASY">EASY</Option>
                                <Option value="MEDIUM">MEDIUM</Option>
                                <Option value="HARD">HARD</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="cpuTimeLimit" label="Time Limit (giây)" style={{ flex: 1, minWidth: '120px' }} initialValue={1.0}>
                            <InputNumber step={0.1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item name="memoryLimitMb" label="Memory Limit (MB)" style={{ flex: 1, minWidth: '120px' }} initialValue={256}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Mô tả (Hỗ trợ HTML)"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả đề bài!' }]}
                    >
                        <TextArea
                            rows={10}
                            placeholder="Nhập mô tả bài toán chi tiết, bao gồm Đầu vào, Đầu ra, và Ràng buộc."
                        />
                    </Form.Item>

                    <Form.Item
                        name="templateCode"
                        label="Code Mẫu (Template)"
                        initialValue={`public class Main {
    
                                        public static void main(String[] args) {
 
                                               // Code here
                                    }
               }`}
                    >
                        <TextArea
                            rows={8}
                            style={{ fontFamily: 'monospace', background: '#f5f5f5' }}
                        />
                    </Form.Item>

                    <Card title="Danh sách Test Cases" size="small" style={{ marginTop: 20 }}>
                        <Form.List name="testCases">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8, flexWrap: 'wrap' }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'input']}
                                                rules={[{ required: true, message: 'Nhập Input' }]}
                                                style={{ flex: 1, minWidth: '150px' }}
                                            >
                                                <TextArea placeholder="Input" autoSize />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'output']}
                                                rules={[{ required: true, message: 'Nhập Output' }]}
                                                style={{ flex: 1, minWidth: '150px' }}
                                            >
                                                <TextArea placeholder="Expected Output" autoSize />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'hidden']}
                                                valuePropName="checked"
                                                style={{ width: 100, margin: 0 }}
                                            >
                                                <Checkbox>Hidden</Checkbox>
                                            </Form.Item>

                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Thêm Test Case
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Card>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageProblems;