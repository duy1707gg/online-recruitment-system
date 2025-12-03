import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Select, Tag, Spin, message, Alert, Divider } from 'antd';
import { PlayCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import axiosClient from '../api/axiosClient';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ProblemDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const [avatarUrl, setAvatarUrl] = useState('');


    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('JAVA');

    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {

                const userRes = await axiosClient.get('/users/me');
                setCurrentUser(userRes.data);


                const problemRes = await axiosClient.get(`/problems/${slug}`);
                setProblem(problemRes.data);

                setCode(problemRes.data.templateCode || '// Viết code của bạn ở đây...');
            } catch (error) {
                message.error('Không thể tải dữ liệu bài tập!');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    const handleSubmit = async () => {
        if (!currentUser || !problem) return;
        setSubmitting(true);
        setResult(null);

        try {
            const payload = {
                userId: currentUser.id,
                problemId: problem.id,
                sourceCode: code,
                language: language
            };
            const response = await axiosClient.post('/submissions', payload);
            setResult(response.data);

            if (response.data.status === 'ACCEPTED') {
                message.success('Chúc mừng! Bạn đã vượt qua tất cả Test Case.');
            } else {
                message.error('Bài làm chưa chính xác hoặc lỗi biên dịch.');
            }

        } catch (error) {
            message.error('Có lỗi khi chấm bài!');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
            <div style={{ width: '40%', padding: 20, overflowY: 'auto', borderRight: '1px solid #f0f0f0', background: '#fff' }}>
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 10 }}>
                    Quay lại
                </Button>

                <Title level={3}>{problem.title}</Title>
                <Tag color={problem.difficulty === 'EASY' ? 'green' : problem.difficulty === 'MEDIUM' ? 'orange' : 'red'}>{problem.difficulty}</Tag>
                <Divider />

                <div
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                    style={{ fontSize: 16, lineHeight: 1.6 }}
                />

                <Divider />
                <Text strong>Giới hạn:</Text>
                <ul>
                    <li>Thời gian: {problem.cpuTimeLimit}s</li>
                    <li>Bộ nhớ: {problem.memoryLimitMb}MB</li>
                </ul>
            </div>

            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                {/* Toolbar */}
                <div style={{ padding: '10px 20px', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Select defaultValue="JAVA" style={{ width: 120 }} onChange={setLanguage}>
                        <Option value="JAVA">Java</Option>
                    </Select>

                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleSubmit}
                        loading={submitting}
                    >
                        Nộp bài (Run)
                    </Button>
                </div>

                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        defaultLanguage="java"
                        language={language.toLowerCase()}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{ fontSize: 14, minimap: { enabled: false } }}
                    />
                </div>

                <div style={{ height: '30%', background: '#1e1e1e', color: '#fff', padding: 20, overflowY: 'auto', borderTop: '1px solid #333' }}>
                    <Text strong style={{ color: '#fff' }}>KẾT QUẢ CHẤM:</Text>

                    {!result && !submitting && <p style={{ color: '#888' }}>Nhấn "Nộp bài" để chạy thử code của bạn.</p>}

                    {submitting && <p>Đang chạy Docker container...</p>}

                    {result && (
                        <div style={{ marginTop: 10 }}>
                            <Tag color={result.status === 'ACCEPTED' ? 'green' : 'red'} style={{ fontSize: 14, padding: '5px 10px' }}>
                                {result.status}
                            </Tag>

                            <p style={{ marginTop: 10 }}>
                                Test cases: <b>{result.passCount}/{result.totalTestCases}</b><br/>
                                Thời gian chạy: {result.runtimeMs ? `${result.runtimeMs} ms` : 'N/A'}
                            </p>

                            {result.status.includes('COMPILE_ERROR') && (
                                <Alert
                                    message="Lỗi biên dịch"
                                    description={<pre style={{ whiteSpace: 'pre-wrap' }}>{result.status}</pre>}
                                    type="error"
                                    showIcon
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;