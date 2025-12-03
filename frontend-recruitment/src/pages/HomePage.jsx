import React from 'react';
import { Layout, Button, Typography, Row, Col, Card, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    CodeOutlined,
    VideoCameraOutlined,
    TeamOutlined,
    RocketOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Layout className="layout" style={{ background: '#fff' }}>
            <div style={styles.heroSection}>
                <div style={styles.overlay}></div>
                <Row justify="center" align="middle" style={{ height: '100%', position: 'relative', zIndex: 1, padding: '0 50px' }}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size="large">
                            <div style={styles.badge}>🚀 Nền tảng tuyển dụng IT số 1</div>
                            <Title level={1} style={{ color: '#fff', fontSize: '3.5rem', margin: 0, lineHeight: 1.2 }}>
                                Tuyển dụng lập trình viên <br/>
                                <span style={{ color: '#40a9ff' }}>Chính xác & Hiệu quả</span>
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: 500 }}>
                                Đánh giá năng lực ứng viên trực tiếp qua Live Coding.
                                Kết hợp phỏng vấn Video Call và chấm điểm tự động.
                            </Paragraph>
                        </Space>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                        <img
                            src="https://image.slidesdocs.com/responsive-images/background/big-data-and-code-concept-illustrated-with-creative-glowing-blue-coding-programming-featuring-a-blank-square-mock-up-frame-3d-rendered-image-powerpoint-background_54fe5bd64d__960_540.jpg"
                            alt="Coding Illustration"
                            style={{ width: '80%', maxWidth: 500, filter: 'drop-shadow(0 0 20px rgba(64, 169, 255, 0.5))' }}
                        />
                    </Col>
                </Row>
            </div>

            <Content style={{ padding: '50px 50px' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <Title level={2}>Tại sao chọn chúng tôi?</Title>
                    <Text type="secondary">Giải pháp toàn diện cho quy trình tuyển dụng nhân sự IT</Text>
                </div>

                <Row gutter={[32, 32]} justify="center">
                    <FeatureCard
                        icon={<CodeOutlined style={{ fontSize: 40, color: '#1890ff' }} />}
                        title="Live Coding Real-time"
                        desc="Môi trường lập trình trực tuyến, hỗ trợ đa ngôn ngữ (Java, C++, Python). Đồng bộ code thời gian thực giữa ứng viên và người phỏng vấn."
                    />
                    <FeatureCard
                        icon={<VideoCameraOutlined style={{ fontSize: 40, color: '#52c41a' }} />}
                        title="Phỏng vấn Video Call"
                        desc="Tích hợp gọi video chất lượng cao ngay trong trình duyệt. Không cần cài đặt phần mềm thứ 3 như Zoom hay Google Meet."
                    />
                    <FeatureCard
                        icon={<CheckCircleOutlined style={{ fontSize: 40, color: '#faad14' }} />}
                        title="Chấm điểm tự động"
                        desc="Hệ thống Test Case tự động đánh giá độ chính xác và hiệu năng code của ứng viên ngay lập tức."
                    />
                </Row>

                <div style={{ marginTop: 100, padding: '60px 0', background: '#f0f5ff', borderRadius: 20 }}>
                    <Row justify="space-around" align="middle">
                        <StatItem number="10+" label="Ngôn ngữ hỗ trợ" />
                        <StatItem number="500+" label="Bài kiểm tra" />
                        <StatItem number="1000+" label="Ứng viên đã test" />
                    </Row>
                </div>
            </Content>

            <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff', padding: '40px 0' }}>
                <Title level={4} style={{ color: '#fff' }}>CMC Code Assessment</Title>
                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                    ©2025 Created by CMC Student. All Rights Reserved.
                </Text>
            </Footer>
        </Layout>
    );
};


const FeatureCard = ({ icon, title, desc }) => (
    <Col xs={24} sm={12} md={8}>
        <Card hoverable style={{ height: '100%', borderRadius: 15, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 20 }}>{icon}</div>
            <Title level={4}>{title}</Title>
            <Paragraph type="secondary">{desc}</Paragraph>
        </Card>
    </Col>
);

const StatItem = ({ number, label }) => (
    <Col span={8} style={{ textAlign: 'center' }}>
        <Title level={1} style={{ color: '#1890ff', margin: 0 }}>{number}</Title>
        <Text style={{ fontSize: 18 }}>{label}</Text>
    </Col>
);

const styles = {
    heroSection: {
        height: '90vh',
        background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg")',
        opacity: 0.1,
        zIndex: 0
    },
    badge: {
        display: 'inline-block',
        padding: '5px 15px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        color: '#40a9ff',
        fontWeight: 'bold',
        marginBottom: 10,
        border: '1px solid rgba(64, 169, 255, 0.3)'
    }
};

export default HomePage;