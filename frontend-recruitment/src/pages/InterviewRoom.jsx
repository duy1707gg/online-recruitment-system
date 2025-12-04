import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Badge, Tabs, Select, Spin, message, Grid } from 'antd';
import {
    PhoneOutlined, PlayCircleOutlined, LogoutOutlined,
    AudioOutlined, AudioMutedOutlined,
    VideoCameraOutlined, StopOutlined
} from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Editor from '@monaco-editor/react';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Default config as fallback
const defaultPeerConnectionConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

const InterviewRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const screens = useBreakpoint();

    const [connected, setConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [problemsList, setProblemsList] = useState([]);

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('JAVA');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [localStream, setLocalStream] = useState(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerConnection = useRef(null);
    const stompClient = useRef(null);
    const isConnecting = useRef(false);


    const cleanupConnection = () => {
        if (stompClient.current) stompClient.current.disconnect();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
            peerConnection.current.close();
        }
        peerConnection.current = null;
        isConnecting.current = false;
        setConnected(false);
    };

    const initWebRTC = (stream, iceServers) => {
        const config = { iceServers: iceServers || defaultPeerConnectionConfig.iceServers };
        console.log("Initializing WebRTC with config:", config);

        const pc = new RTCPeerConnection(config);
        peerConnection.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
            if (partnerVideo.current) partnerVideo.current.srcObject = event.streams[0];
            addLog('Nhận luồng video/audio từ đối tác.');
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal('CANDIDATE', event.candidate);
            } else {
                addLog('Trao đổi mạng hoàn tất.');
            }
        };

        return pc;
    };

    const connectWebSocket = () => {
        const backendHost = window.location.hostname;

        let socketUrl = `https://${backendHost}/ws`;
        if (backendHost === 'localhost') {
            socketUrl = `http://${backendHost}:8081/ws`;
        }

        const socket = new SockJS(socketUrl);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            setConnected(true);
            stompClient.current = client;
            client.subscribe(`/topic/interview/${roomId}`, (msg) => {
                const signal = JSON.parse(msg.body);
                // Prevent processing own messages
                if (signal.sender === localStorage.getItem('token')) return;

                handleSignal(signal);
            });
            sendSignal('JOIN', null);
        }, (error) => {
            console.error("Lỗi kết nối WebSocket:", error);
            message.error("Lỗi kết nối đến máy chủ WebSocket.");
            setConnected(false);
        });
    };

    useEffect(() => {
        if (isConnecting.current) return;
        isConnecting.current = true;

        const setupConnection = async () => {
            try {
                // 1. Fetch ICE Servers
                let iceServers = [];
                try {
                    const response = await fetch("https://phongvan.metered.live/api/v1/turn/credentials?apiKey=782540d33239352ad8db1afce49c3ad20c9b");
                    iceServers = await response.json();
                    console.log("Fetched ICE Servers:", iceServers);
                } catch (error) {
                    console.error("Failed to fetch ICE servers, using default Google STUN:", error);
                    iceServers = defaultPeerConnectionConfig.iceServers;
                }

                // 2. Get Media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                if (userVideo.current) userVideo.current.srcObject = stream;

                // 3. Init WebRTC with fetched servers
                initWebRTC(stream, iceServers);

                // 4. Connect WebSocket
                connectWebSocket();

            } catch (err) {
                console.error("Setup failed:", err);
                message.error("Không thể truy cập Camera/Micro hoặc lỗi kết nối.");
                setIsMicOn(false);
                setIsCamOn(false);
                // Try to connect WebSocket anyway (audio/video might fail but chat/code might work)
                connectWebSocket();
            }
        };

        setupConnection();

        fetchProblems();

        return () => {
            cleanupConnection();
        };
    }, [roomId]);


    useEffect(() => {
        if (!stompClient.current || !code) return;
        const handler = setTimeout(() => {
            sendSignal('CODE_UPDATE', { sourceCode: code });
        }, 300);
        return () => clearTimeout(handler);
    }, [code]);


    const toggleMic = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const newStatus = !isMicOn;
                audioTracks.forEach(track => track.enabled = newStatus);
                setIsMicOn(newStatus);
                message.info(newStatus ? "Đã bật Micro" : "Đã tắt Micro");
            }
        }
    };


    const toggleCam = () => {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                const newStatus = !isCamOn;
                videoTracks.forEach(track => track.enabled = newStatus);
                setIsCamOn(newStatus);
                message.info(newStatus ? "Đã bật Camera" : "Đã tắt Camera");
            } else {
                message.warning("Không tìm thấy thiết bị Camera!");
            }
        }
    };

    const leaveRoom = () => {
        cleanupConnection();
        navigate('/');
        message.info("Đã rời phòng phỏng vấn");
    };

    const fetchProblems = async () => {
        try {
            const res = await axiosClient.get('/problems');
            if (res.data && res.data.length > 0) {
                setProblemsList(res.data);
                selectProblem(res.data[0]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách bài", error);
        }
    };

    const selectProblem = (selectedProblem) => {
        setProblem(selectedProblem);
        setCode(selectedProblem.templateCode || '// Code here');
        setResult(null);
    };

    const handleProblemChange = (problemId) => {
        const selected = problemsList.find(p => p.id === problemId);
        if (selected) {
            selectProblem(selected);
            message.info(`Đã chuyển sang bài: ${selected.title}`);
        }
    };

    const handleSubmit = async () => {
        if (!problem) return;
        setSubmitting(true);
        setResult(null);
        try {
            const userRes = await axiosClient.get('/users/me');
            const payload = {
                userId: userRes.data.id,
                problemId: problem.id,
                sourceCode: code,
                language: language
            };
            const response = await axiosClient.post('/submissions', payload);
            setResult(response.data);
            sendSignal('TERMINAL_UPDATE', { result: response.data });

            if (response.data.status === 'ACCEPTED') message.success('Chính xác!');
            else message.error('Sai rồi!');
        } catch (error) { message.error('Lỗi chấm bài'); } finally { setSubmitting(false); }
    };


    const sendSignal = (type, data) => {
        if (stompClient.current?.connected) {
            stompClient.current.send(`/app/interview/${roomId}`, {}, JSON.stringify({
                type: type,
                sender: localStorage.getItem('token'),
                data: data
            }));
        }
    };

    const handleSignal = async (signal) => {
        const pc = peerConnection.current;
        if (!pc) return;

        try {
            if (signal.type === 'OFFER') {
                if (pc.signalingState !== 'stable') {
                    console.warn("Ignored OFFER because signaling state is not stable:", pc.signalingState);
                    return;
                }
                addLog('Nhận Offer, gửi Answer...');
                await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal('ANSWER', answer);
            } else if (signal.type === 'ANSWER') {
                if (pc.signalingState !== 'have-local-offer') {
                    console.warn("Ignored ANSWER because signaling state is not have-local-offer:", pc.signalingState);
                    return;
                }
                addLog('Nhận Answer, kết nối thành công.');
                await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            } else if (signal.type === 'CANDIDATE' && signal.data) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.data));
                } catch (e) {
                    console.error("Error adding ICE candidate", e);
                }
            } else if (signal.type === 'CODE_UPDATE') {
                setCode(signal.data.sourceCode);
                addLog('Code synchronized.');
            } else if (signal.type === 'TERMINAL_UPDATE') {
                setResult(signal.data.result);
                addLog('Kết quả chấm bài đã được đồng bộ.');
            }
            else if (signal.type === 'JOIN') {
                addLog(`Người dùng ${signal.sender.substring(0, 8)} đã tham gia. Tự động gọi...`);
                // Only create offer if we are stable and not already connected
                if (pc.signalingState === 'stable' && (!pc.remoteDescription)) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sendSignal('OFFER', offer);
                } else {
                    console.log("Skipping OFFER creation on JOIN. State:", pc.signalingState);
                }
            }
        } catch (error) {
            console.error("Error handling signal:", error);
            addLog("Lỗi WebRTC: " + error.message);
        }
    };

    const startCall = async () => {
        const pc = peerConnection.current;
        if (!pc || !localStream) {
            message.warning("Không thể gọi: Media hoặc WebRTC chưa sẵn sàng.");
            return;
        }
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal('OFFER', offer);
        addLog("Đã gửi Offer gọi video thủ công.");
    };

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    return (
        <div style={{ padding: 10, height: screens.md ? '90vh' : 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                display: 'flex',
                flexDirection: screens.md ? 'row' : 'column',
                justifyContent: 'space-between',
                marginBottom: 10,
                alignItems: 'center',
                background: '#fff',
                padding: '10px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                gap: 10
            }}>
                <Title level={4} style={{ margin: 0 }}>
                    Phòng: {roomId} <Badge status={connected ? "success" : "error"} text={connected ? "Online" : "Mất kết nối"} />
                </Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    <Button
                        icon={isMicOn ? <AudioOutlined /> : <AudioMutedOutlined />}
                        onClick={toggleMic}
                        danger={!isMicOn}
                    >
                        {screens.md ? (isMicOn ? 'Tắt Mic' : 'Bật Mic') : ''}
                    </Button>

                    <Button
                        icon={isCamOn ? <VideoCameraOutlined /> : <StopOutlined />}
                        onClick={toggleCam}
                        danger={!isCamOn}
                    >
                        {screens.md ? (isCamOn ? 'Tắt Cam' : 'Bật Cam') : ''}
                    </Button>

                    <Button type="primary" icon={<PhoneOutlined />} onClick={startCall}>
                        {screens.md ? 'Gọi Video' : ''}
                    </Button>

                    <Button danger icon={<LogoutOutlined />} onClick={leaveRoom}>
                        {screens.md ? 'Thoát' : ''}
                    </Button>
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ flex: 1 }}>
                <Col xs={24} md={7} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: screens.md ? 'column' : 'row', gap: 10, height: screens.md ? 'auto' : '200px' }}>
                        <Card size="small" title="Ứng viên" bodyStyle={{ padding: 0 }} style={{ background: '#222', flex: 1 }}>
                            <video ref={partnerVideo} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Card>

                        <Card size="small" title="Bạn" bodyStyle={{ padding: 0 }} style={{ background: '#000', flex: 1 }}>
                            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                                <video
                                    ref={userVideo}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: 'scaleX(-1)',
                                        display: isCamOn ? 'block' : 'none'
                                    }}
                                />

                                {!isCamOn && (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', flexDirection: 'column',
                                        justifyContent: 'center', alignItems: 'center',
                                        background: '#1f1f1f', color: '#888'
                                    }}>
                                        <StopOutlined style={{ fontSize: 30, marginBottom: 8 }} />
                                        <span>Camera Off</span>
                                    </div>
                                )}

                                {!isMicOn && (
                                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                                        <AudioMutedOutlined /> Mic Off
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div style={{ height: 100, background: '#f0f0f0', overflow: 'auto', padding: 5, fontSize: 12, borderRadius: 4, display: screens.md ? 'block' : 'none' }}>
                        {logs.map((l, i) => <div key={i}>- {l}</div>)}
                    </div>
                </Col>

                <Col xs={24} md={17} style={{ height: screens.md ? '100%' : 'auto', minHeight: '500px' }}>
                    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                        {problem ? (
                            <Tabs defaultActiveKey="2" style={{ flex: 1 }} items={[
                                {
                                    key: '1', label: 'Đề bài',
                                    children: (
                                        <div style={{ padding: 20, overflowY: 'auto', height: screens.md ? '55vh' : 'auto' }}>
                                            <Title level={4}>{problem.title}</Title>
                                            <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                                            <div style={{ marginTop: 20, padding: 10, background: '#f9f9f9', borderRadius: 4 }}>
                                                <b>Giới hạn:</b> {problem.cpuTimeLimit}s | {problem.memoryLimitMb}MB
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: '2', label: 'Code Editor',
                                    children: (
                                        <div style={{ height: screens.md ? '55vh' : '500px', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                <Select
                                                    style={{ width: 250 }}
                                                    placeholder="Chọn bài tập"
                                                    value={problem.id}
                                                    onChange={handleProblemChange}
                                                >
                                                    {problemsList.map(p => (
                                                        <Option key={p.id} value={p.id}>
                                                            {p.title} ({p.difficulty || 'Medium'})
                                                        </Option>
                                                    ))}
                                                </Select>

                                                <Select defaultValue="JAVA" onChange={setLanguage} style={{ width: 100 }}>
                                                    <Option value="JAVA">Java</Option>
                                                </Select>

                                                <Button type="primary" icon={<PlayCircleOutlined />} loading={submitting} onClick={handleSubmit}>
                                                    Run
                                                </Button>
                                            </div>
                                            <Editor
                                                height="100%"
                                                defaultLanguage="java"
                                                theme="vs-dark"
                                                value={code}
                                                onChange={setCode}
                                                options={{ minimap: { enabled: false }, fontSize: 14 }}
                                            />
                                        </div>
                                    )
                                }
                            ]} />
                        ) : <div style={{ padding: 20 }}><Spin /> Đang tải dữ liệu...</div>}

                        <div style={{ height: '25%', background: '#1e1e1e', color: '#fff', padding: 15, overflowY: 'auto', borderTop: '2px solid #444' }}>
                            <Text strong style={{ color: '#fff' }}>TERMINAL:</Text>
                            {result && (
                                <div style={{ marginTop: 10 }}>
                                    <p style={{ color: result.status === 'ACCEPTED' ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                        {result.status}
                                    </p>
                                    <p>Pass: {result.passCount}/{result.totalTestCases}</p>
                                    <p>Time: {result.runtimeMs ? result.runtimeMs + 'ms' : 'N/A'}</p>
                                    {result.status.includes('COMPILE_ERROR') && <pre style={{ color: 'orange' }}>{result.status}</pre>}
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default InterviewRoom;