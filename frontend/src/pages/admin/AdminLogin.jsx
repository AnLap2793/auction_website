import {
    Button,
    Checkbox,
    Col,
    message,
    Flex,
    Form,
    Input,
    Row,
    Typography
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const AdminLogin = ({ setIsAdminAuthenticated }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        // Giả lập quá trình đăng nhập admin
        setTimeout(() => {
            if (values.username === 'admin' && values.password === 'admin123') {
                setIsAdminAuthenticated(true);
                message.success('Đăng nhập thành công!');
                navigate('/admin');
            } else {
                message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <Row
            style={{
                minHeight: '100vh',
                overflow: 'hidden'
            }}
        >
            <Col xs={24} lg={12}>
                <Flex
                    vertical
                    align='center'
                    justify='center'
                    className='text-center'
                    style={{
                        background: '#1890ff',
                        height: '100%',
                        padding: '1rem'
                    }}
                >
                    <Title level={2} className='text-white'>
                        Welcome back to Admin
                    </Title>
                    <Text className='text-white' style={{ fontSize: 18 }}>
                        A dynamic and versatile multipurpose dashboard utilizing
                        Ant Design, React, and TypeScript.
                    </Text>
                </Flex>
            </Col>
            <Col xs={24} lg={12}>
                <Flex
                    vertical
                    justify='center'
                    align={'flex-start'}
                    gap='middle'
                    style={{ height: '100%', padding: '2rem' }}
                >
                    <Title className='m-0'>Login</Title>
                    <Form
                        name='sign-in-form'
                        layout='vertical'
                        autoComplete='off'
                        onFinish={onFinish}
                    >
                        <Row gutter={[8, 0]}>
                            <Col xs={24}>
                                <Form.Item
                                    label='Username'
                                    name='username'
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Vui lòng nhập tên đăng nhập!'
                                        }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    label='Password'
                                    name='password'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mật khẩu!'
                                        }
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name='remember'
                                    valuePropName='checked'
                                >
                                    <Checkbox>Remember me</Checkbox>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Flex align='center' justify='space-between'>
                                <Button
                                    type='primary'
                                    size='middle'
                                    loading={loading}
                                    htmlType='submit'
                                >
                                    Đăng nhập
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Flex>
            </Col>
        </Row>
    );
};

export default AdminLogin;
