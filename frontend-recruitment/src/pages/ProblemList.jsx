import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await axiosClient.get('/problems');
                setProblems(response.data);
            } catch (error) {
                console.error("Lỗi lấy danh sách bài tập:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const columns = [
        {
            title: 'Tên bài toán',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (difficulty) => {
                let color = difficulty === 'EASY' ? 'green' : difficulty === 'MEDIUM' ? 'orange' : 'red';
                return <Tag color={color}>{difficulty}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => navigate(`/problems/${record.slug}`)} // Chuyển sang trang làm bài
                    >
                        Làm bài
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Danh sách bài tập Coding</Title>
            <Table
                columns={columns}
                dataSource={problems}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default ProblemList;