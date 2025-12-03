import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Spin, Typography } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title } = Typography;

const ChatbotWidget = ({ isModal }) => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Chào bạn! Tôi là trợ lý AI tuyển dụng. Tôi có thể giúp gì cho bạn?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (value) => {
        const text = (value || inputValue).trim();
        if (!text) return;

        setInputValue('');
        const newUserMessage = { sender: 'user', text: text };

        setMessages((prev) => [...prev, newUserMessage]);
        setLoading(true);

        try {
            const response = await axiosClient.post('/chat/ask', {
                prompt: text,
            });

            const botResponse = { sender: 'bot', text: response.data };

            setMessages((prev) => [...prev, botResponse]);

        } catch (error) {
            let errorMessage = 'Xin lỗi, có lỗi xảy ra khi kết nối với AI.';

            if (error.response && error.response.data) {
                errorMessage = `Lỗi hệ thống: ${error.response.data}`;
            }

            const errorMsg = { sender: 'bot', text: errorMessage };
            setMessages((prev) => [...prev, errorMsg]);
            console.error('Chatbot API Error:', error);

        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSend();
        }
    };

    const chatContainerStyle = isModal ? { width: '100%', height: 500 } : { width: 450, height: 600, background: 'white', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
    const messageAreaHeight = isModal ? 400 : 500;

    return (
        <div style={isModal ? { display: 'flex', flexDirection: 'column', height: '100%' } : { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>

            <div style={{ ...chatContainerStyle, display: 'flex', flexDirection: 'column' }}>

                {!isModal && (
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', textAlign: 'center', background: '#1890ff', color: 'white', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                        <Title level={4} style={{ color: 'white', margin: 0 }}><RobotOutlined /> Trợ lý AI Tuyển dụng</Title>
                    </div>
                )}

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: 15, height: messageAreaHeight }}>
                    <List
                        dataSource={messages}
                        renderItem={(item) => (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: 12
                                }}
                            >
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '10px 15px',
                                    lineHeight: '1.4',
                                    backgroundColor: item.sender === 'user' ? '#1890ff' : '#ffffff',
                                    color: item.sender === 'user' ? 'white' : '#333333',
                                    borderRadius: item.sender === 'user'
                                        ? '15px 15px 0 15px'
                                        : '15px 15px 15px 0',
                                    boxShadow: item.sender === 'bot' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                }}>
                                    {item.text}
                                </div>
                            </div>
                        )}
                    />
                    <div ref={messagesEndRef} />
                    {loading && (
                        <div style={{ textAlign: 'left', marginTop: 10 }}>
                            <Spin />
                        </div>
                    )}
                </div>

                <div style={{ padding: 15, borderTop: '1px solid #eee' }}>
                    <Input
                        placeholder="Nhập câu hỏi của bạn..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="large"
                        disabled={loading}
                        addonAfter={
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => handleSend()}
                                loading={loading}
                                disabled={loading}
                                style={{ border: 'none' }}
                            />
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatbotWidget;