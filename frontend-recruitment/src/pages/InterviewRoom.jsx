import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Typography, Badge, Tabs, Select, Spin, message, Grid, Tooltip } from 'antd';
import {
    PhoneOutlined, PlayCircleOutlined, LogoutOutlined,
    AudioOutlined, AudioMutedOutlined,
    VideoCameraOutlined, StopOutlined,
    CodeOutlined, FileTextOutlined,
    TeamOutlined, ClockCircleOutlined, SoundOutlined
} from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Editor from '@monaco-editor/react';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Premium styles object - Clean & Professional Design
const styles = {
    container: {
        minHeight: '100vh',
        background: '#1a1a2e',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#252542',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        border: '1px solid #3a3a5c',
    },
    roomTitle: {
        color: '#fff',
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    roomBadge: {
        background: '#22c55e',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
    },
    controlsContainer: {
        display: 'flex',
        gap: '10px',
    },
    controlBtn: {
        border: 'none',
        borderRadius: '10px',
        height: '40px',
        minWidth: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
    },
    controlBtnActive: {
        background: '#3a3a5c',
        color: '#fff',
    },
    controlBtnDanger: {
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    controlBtnPrimary: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: 600,
    },
    controlBtnExit: {
        background: '#ef4444',
        color: '#fff',
    },
    videoSection: {
        height: '100%',
    },
    videoCard: {
        background: '#252542',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #3a3a5c',
        position: 'relative',
    },
    videoCardTitle: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.6)',
        padding: '5px 12px',
        borderRadius: '16px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 500,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    videoElement: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '12px',
    },
    cameraOffOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '12px',
    },
    micOffBadge: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(239, 68, 68, 0.9)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '10px',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    logsPanel: {
        background: '#252542',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid #3a3a5c',
        marginTop: '16px',
    },
    logsTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '11px',
        fontWeight: 600,
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    logItem: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '11px',
        padding: '3px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    mainContent: {
        background: '#252542',
        borderRadius: '12px',
        border: '1px solid #3a3a5c',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    tabsContainer: {
        height: '100%',
    },
    problemPanel: {
        padding: '20px',
        color: '#fff',
        overflowY: 'auto',
    },
    problemTitle: {
        color: '#fff',
        marginBottom: '16px',
        fontSize: '20px',
        fontWeight: 600,
    },
    problemDescription: {
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.7,
        fontSize: '14px',
    },
    limitsCard: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginTop: '16px',
    },
    editorToolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: '#1a1a2e',
        borderBottom: '1px solid #3a3a5c',
    },
    selectStyled: {
        borderRadius: '8px',
    },
    runButton: {
        background: '#3b82f6',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        height: '34px',
        borderRadius: '8px',
    },
    terminal: {
        background: '#0d1117',
        padding: '16px',
        borderTop: '1px solid #3a3a5c',
        minHeight: '140px',
        flexShrink: 0,
    },
    terminalHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
    },
    terminalDots: {
        display: 'flex',
        gap: '5px',
    },
    terminalDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
    },
    terminalTitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        marginLeft: '8px',
    },
    resultSuccess: {
        color: '#22c55e',
        fontWeight: 600,
        fontSize: '15px',
    },
    resultError: {
        color: '#ef4444',
        fontWeight: 600,
        fontSize: '15px',
    },
    resultInfo: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '13px',
        marginTop: '8px',
    },
};

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
    const [isTestingMic, setIsTestingMic] = useState(false);

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

    const testMic = async () => {
        if (isTestingMic) return;

        setIsTestingMic(true);
        message.info('Đang thu âm 3 giây... Hãy nói gì đó!');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);

                message.success('Phát lại âm thanh...');
                audio.play();

                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    stream.getTracks().forEach(track => track.stop());
                    setIsTestingMic(false);
                };
            };

            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);

        } catch (error) {
            console.error('Lỗi test mic:', error);
            message.error('Không thể truy cập microphone!');
            setIsTestingMic(false);
        }
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
        <div style={styles.container}>
            {/* Header with Room Info and Controls */}
            <div style={{
                ...styles.header,
                flexDirection: screens.md ? 'row' : 'column',
                gap: screens.md ? 0 : '16px'
            }}>
                <div style={styles.roomTitle}>
                    <TeamOutlined style={{ fontSize: '20px', color: '#3b82f6' }} />
                    <span>Phòng phỏng vấn</span>
                    <span style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontWeight: 400,
                        fontSize: '14px'
                    }}>#{roomId}</span>
                    <span style={connected ? styles.roomBadge : {
                        ...styles.roomBadge,
                        background: '#ef4444'
                    }}>
                        {connected ? '● LIVE' : '○ OFFLINE'}
                    </span>
                </div>

                <div style={styles.controlsContainer}>
                    <Tooltip title={isMicOn ? 'Tắt Micro' : 'Bật Micro'}>
                        <Button
                            icon={isMicOn ? <AudioOutlined /> : <AudioMutedOutlined />}
                            onClick={toggleMic}
                            style={{
                                ...styles.controlBtn,
                                ...(isMicOn ? styles.controlBtnActive : styles.controlBtnDanger)
                            }}
                        >
                            {screens.md && (isMicOn ? 'Mic On' : 'Mic Off')}
                        </Button>
                    </Tooltip>

                    <Tooltip title={isCamOn ? 'Tắt Camera' : 'Bật Camera'}>
                        <Button
                            icon={isCamOn ? <VideoCameraOutlined /> : <StopOutlined />}
                            onClick={toggleCam}
                            style={{
                                ...styles.controlBtn,
                                ...(isCamOn ? styles.controlBtnActive : styles.controlBtnDanger)
                            }}
                        >
                            {screens.md && (isCamOn ? 'Cam On' : 'Cam Off')}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Test Microphone (thu âm 3 giây và phát lại)">
                        <Button
                            icon={<SoundOutlined />}
                            onClick={testMic}
                            loading={isTestingMic}
                            style={{
                                ...styles.controlBtn,
                                background: isTestingMic ? '#f59e0b' : '#6366f1',
                                color: '#fff'
                            }}
                        >
                            {screens.md && (isTestingMic ? 'Đang test...' : 'Test Mic')}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Bắt đầu cuộc gọi video">
                        <Button
                            icon={<PhoneOutlined />}
                            onClick={startCall}
                            style={{ ...styles.controlBtn, ...styles.controlBtnPrimary }}
                        >
                            {screens.md && 'Gọi Video'}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Rời khỏi phòng">
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={leaveRoom}
                            style={{ ...styles.controlBtn, ...styles.controlBtnExit }}
                        >
                            {screens.md && 'Thoát'}
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Main Content Area */}
            <Row gutter={[20, 20]} style={{ flex: 1 }}>
                {/* Left Panel - Video Section */}
                <Col xs={24} md={7} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: screens.md ? 'column' : 'row',
                        gap: '16px',
                        height: screens.md ? 'auto' : '200px'
                    }}>
                        {/* Partner Video */}
                        <div style={{ ...styles.videoCard, flex: 1, minHeight: screens.md ? '200px' : '100%' }}>
                            <div style={styles.videoCardTitle}>
                                <TeamOutlined />
                                Ứng viên
                            </div>
                            <video
                                ref={partnerVideo}
                                autoPlay
                                playsInline
                                style={styles.videoElement}
                            />
                        </div>

                        {/* User Video */}
                        <div style={{ ...styles.videoCard, flex: 1, minHeight: screens.md ? '200px' : '100%' }}>
                            <div style={styles.videoCardTitle}>
                                <TeamOutlined />
                                Bạn
                            </div>

                            <video
                                ref={userVideo}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    ...styles.videoElement,
                                    transform: 'scaleX(-1)',
                                    display: isCamOn ? 'block' : 'none'
                                }}
                            />

                            {!isCamOn && (
                                <div style={styles.cameraOffOverlay}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <StopOutlined style={{ fontSize: 28 }} />
                                    </div>
                                    <span style={{ fontWeight: 500 }}>Camera đã tắt</span>
                                </div>
                            )}

                            {!isMicOn && (
                                <div style={styles.micOffBadge}>
                                    <AudioMutedOutlined /> Mic Off
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs Panel */}
                    {screens.md && (
                        <div style={styles.logsPanel}>
                            <div style={styles.logsTitle}>
                                <ClockCircleOutlined style={{ marginRight: '6px' }} />
                                Activity Log
                            </div>
                            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                {logs.length === 0 ? (
                                    <div style={styles.logItem}>Chưa có hoạt động...</div>
                                ) : (
                                    logs.slice(-10).reverse().map((l, i) => (
                                        <div key={i} style={styles.logItem}>• {l}</div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </Col>

                {/* Right Panel - Code Editor */}
                <Col xs={24} md={17} style={{ height: screens.md ? 'calc(100vh - 160px)' : 'auto', minHeight: '500px' }}>
                    <div style={styles.mainContent}>
                        {problem ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <Tabs
                                    defaultActiveKey="2"
                                    style={{ flex: 1, overflow: 'hidden' }}
                                    tabBarStyle={{
                                        margin: 0,
                                        padding: '0 20px',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                    items={[
                                        {
                                            key: '1',
                                            label: (
                                                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FileTextOutlined /> Đề bài
                                                </span>
                                            ),
                                            children: (
                                                <div style={{
                                                    ...styles.problemPanel,
                                                    height: screens.md ? 'calc(100vh - 340px)' : '400px',
                                                    overflowY: 'auto'
                                                }}>
                                                    <h2 style={styles.problemTitle}>{problem.title}</h2>
                                                    <div
                                                        style={styles.problemDescription}
                                                        dangerouslySetInnerHTML={{ __html: problem.description }}
                                                    />
                                                    <div style={styles.limitsCard}>
                                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                            <div>
                                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Thời gian</span>
                                                                <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '15px' }}>
                                                                    {problem.cpuTimeLimit}s
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Bộ nhớ</span>
                                                                <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '15px' }}>
                                                                    {problem.memoryLimitMb}MB
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: '2',
                                            label: (
                                                <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CodeOutlined /> Code Editor
                                                </span>
                                            ),
                                            children: (
                                                <div style={{
                                                    height: screens.md ? 'calc(100vh - 340px)' : '400px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={styles.editorToolbar}>
                                                        <Select
                                                            style={{ width: 280 }}
                                                            placeholder="Chọn bài tập"
                                                            value={problem.id}
                                                            onChange={handleProblemChange}
                                                            dropdownStyle={{ background: '#1e1e1e' }}
                                                        >
                                                            {problemsList.map(p => (
                                                                <Option key={p.id} value={p.id}>
                                                                    {p.title} ({p.difficulty || 'Medium'})
                                                                </Option>
                                                            ))}
                                                        </Select>

                                                        <Select
                                                            defaultValue="JAVA"
                                                            onChange={setLanguage}
                                                            style={{ width: 120 }}
                                                        >
                                                            <Option value="JAVA">☕ Java</Option>
                                                        </Select>

                                                        <Button
                                                            icon={<PlayCircleOutlined />}
                                                            loading={submitting}
                                                            onClick={handleSubmit}
                                                            style={styles.runButton}
                                                        >
                                                            {submitting ? 'Đang chạy...' : 'Run Code'}
                                                        </Button>
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <Editor
                                                            height="100%"
                                                            defaultLanguage="java"
                                                            theme="vs-dark"
                                                            value={code}
                                                            onChange={setCode}
                                                            options={{
                                                                minimap: { enabled: false },
                                                                fontSize: 14,
                                                                fontFamily: "'Fira Code', 'Consolas', monospace",
                                                                padding: { top: 16 },
                                                                scrollBeyondLastLine: false,
                                                                smoothScrolling: true,
                                                                cursorBlinking: 'smooth',
                                                                cursorSmoothCaretAnimation: 'on',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        }
                                    ]}
                                />
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '300px',
                                color: 'rgba(255,255,255,0.6)'
                            }}>
                                <Spin size="large" />
                                <div style={{ marginTop: '16px', fontSize: '15px' }}>Đang tải dữ liệu...</div>
                            </div>
                        )}

                        {/* Terminal Output */}
                        <div style={styles.terminal}>
                            <div style={styles.terminalHeader}>
                                <div style={styles.terminalDots}>
                                    <div style={{ ...styles.terminalDot, background: '#ff5f56' }} />
                                    <div style={{ ...styles.terminalDot, background: '#ffbd2e' }} />
                                    <div style={{ ...styles.terminalDot, background: '#27ca40' }} />
                                </div>
                                <span style={styles.terminalTitle}>TERMINAL OUTPUT</span>
                            </div>

                            {result ? (
                                <div>
                                    <div style={result.status === 'ACCEPTED' ? styles.resultSuccess : styles.resultError}>
                                        {result.status === 'ACCEPTED' ? '✓ ' : '✗ '}{result.status}
                                    </div>
                                    <div style={styles.resultInfo}>
                                        <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Test Cases: </span>
                                                <span style={{ color: result.status === 'ACCEPTED' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                                    {result.passCount}/{result.totalTestCases}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Runtime: </span>
                                                <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                                                    {result.runtimeMs ? result.runtimeMs + 'ms' : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        {result.status.includes('COMPILE_ERROR') && (
                                            <pre style={{
                                                color: '#ffbd2e',
                                                marginTop: '12px',
                                                padding: '12px',
                                                background: 'rgba(255, 189, 46, 0.1)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                overflowX: 'auto'
                                            }}>
                                                {result.status}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                    Nhấn "Run Code" để chạy code và xem kết quả...
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div >
    );
};

export default InterviewRoom;