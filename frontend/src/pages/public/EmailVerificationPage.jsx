import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Result, Button, Spin, Typography } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Paragraph } = Typography;

const EmailVerificationPage = () => {
    const { token } = useParams();
    const { verifyEmail } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const isVerificationProcessed = useRef(false);

    useEffect(() => {
        const processEmailVerification = async () => {
            if (!token || isVerificationProcessed.current) {
                return;
            }

            isVerificationProcessed.current = true;

            try {
                const result = await verifyEmail(token);
                console.log(result);
                if (result.success) {
                    setVerificationStatus('success');
                } else {
                    setVerificationStatus('error');
                    setErrorMessage(result.message);
                }
            } catch (error) {
                setVerificationStatus('error');
                setErrorMessage(
                    'Xác thực email không thành công. Vui lòng thử lại sau.'
                );
            }
        };

        processEmailVerification();
    }, [token, verifyEmail]);

    // Hiển thị trạng thái đang xác thực
    if (verificationStatus === 'verifying') {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                    flexDirection: 'column'
                }}
            >
                <Spin size='large' />
                <Title level={3} style={{ marginTop: 20 }}>
                    Đang xác thực email của bạn...
                </Title>
            </div>
        );
    }

    // Hiển thị thông báo xác thực thành công
    if (verificationStatus === 'success') {
        return (
            <Result
                status='success'
                title='Xác thực email thành công!'
                subTitle='Tài khoản của bạn đã được kích hoạt.'
                extra={[
                    <Button type='primary' key='login'>
                        <Link to='/login'>Đăng nhập</Link>
                    </Button>,
                    <Button key='home'>
                        <Link to='/'>Trang chủ</Link>
                    </Button>
                ]}
            />
        );
    }

    // Hiển thị thông báo xác thực thất bại
    return (
        <Result
            status='error'
            title='Xác thực email không thành công'
            subTitle={errorMessage}
            extra={[
                <Button type='primary' key='resend'>
                    <Link to='/resend-verification'>
                        Gửi lại email xác thực
                    </Link>
                </Button>,
                <Button key='home'>
                    <Link to='/'>Trang chủ</Link>
                </Button>
            ]}
        />
    );
};

export default EmailVerificationPage;
