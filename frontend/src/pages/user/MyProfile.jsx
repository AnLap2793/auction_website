import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    Upload,
    Avatar,
    message,
    Divider,
    List,
    Row,
    Col,
    Typography,
    Space,
    Statistic,
    Tag
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    EditOutlined,
    UploadOutlined,
    ShoppingOutlined,
    HeartOutlined,
    HistoryOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);

    // Mock data for user profile
    const [profile, setProfile] = useState({
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        phone: '+1 (123) 456-7890',
        address: '123 Auction Street, City, Country',
        bio: 'Passionate collector and auction enthusiast with over 5 years of experience in vintage collectibles and art pieces.',
        avatar: null
    });

    const [form] = Form.useForm();

    // Mock data for bid history
    const bidHistory = [
        {
            id: 1,
            item: 'Vintage Camera',
            date: '2023-05-10',
            amount: '$450',
            status: 'Won'
        },
        {
            id: 2,
            item: 'Antique Clock',
            date: '2023-05-05',
            amount: '$320',
            status: 'Outbid'
        },
        {
            id: 3,
            item: 'Art Print',
            date: '2023-04-28',
            amount: '$175',
            status: 'Won'
        },
        {
            id: 4,
            item: 'Collectible Coin',
            date: '2023-04-15',
            amount: '$90',
            status: 'Pending'
        }
    ];

    // Mock data for watched items
    const watchedItems = [
        {
            id: 1,
            name: 'Vintage Record Player',
            currentBid: '$250',
            endTime: '2d 5h'
        },
        {
            id: 2,
            name: 'Handcrafted Jewelry Box',
            currentBid: '$120',
            endTime: '1d 12h'
        },
        {
            id: 3,
            name: 'First Edition Book',
            currentBid: '$350',
            endTime: '5h 30m'
        }
    ];

    const handleSave = (values) => {
        setProfile({ ...profile, ...values });
        setEditMode(false);
        message.success('Profile updated successfully!');
    };

    const handleEditToggle = () => {
        if (!editMode) {
            form.setFieldsValue(profile);
        }
        setEditMode(!editMode);
    };

    const handleAvatarChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            // In a real app, you would handle the uploaded file and update the avatar URL
            setProfile({
                ...profile,
                avatar: URL.createObjectURL(info.file.originFileObj)
            });
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const navigateToMyAuctions = () => {
        navigate('/my-auctions');
    };

    const getStatusTag = (status) => {
        let color;
        if (status === 'Won') color = 'success';
        else if (status === 'Outbid') color = 'error';
        else color = 'processing';

        return <Tag color={color}>{status}</Tag>;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card>
                        <Space
                            direction='vertical'
                            align='center'
                            style={{ width: '100%', marginBottom: '24px' }}
                        >
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={profile.avatar}
                                style={{ marginBottom: '16px' }}
                            />
                            {!editMode && (
                                <Upload
                                    name='avatar'
                                    showUploadList={false}
                                    onChange={handleAvatarChange}
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        size='small'
                                    >
                                        Change Avatar
                                    </Button>
                                </Upload>
                            )}
                            <Title level={3}>{profile.name}</Title>
                            <Text type='secondary'>{profile.email}</Text>
                            <Button
                                type='primary'
                                icon={<EditOutlined />}
                                onClick={handleEditToggle}
                                style={{ marginTop: '16px' }}
                            >
                                {editMode ? 'Cancel Edit' : 'Edit Profile'}
                            </Button>
                            <Button
                                icon={<ShoppingOutlined />}
                                onClick={navigateToMyAuctions}
                                style={{ marginTop: '8px', width: '100%' }}
                            >
                                My Auctions
                            </Button>
                        </Space>

                        {!editMode && (
                            <Space
                                direction='vertical'
                                style={{ width: '100%' }}
                            >
                                <Space align='start'>
                                    <MailOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Email</Text>
                                        <br />
                                        <Text>{profile.email}</Text>
                                    </div>
                                </Space>
                                <Space align='start'>
                                    <PhoneOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Phone</Text>
                                        <br />
                                        <Text>{profile.phone}</Text>
                                    </div>
                                </Space>
                                <Space align='start'>
                                    <HomeOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Address</Text>
                                        <br />
                                        <Text>{profile.address}</Text>
                                    </div>
                                </Space>
                                <div style={{ marginTop: '16px' }}>
                                    <Text strong>Bio</Text>
                                    <br />
                                    <Paragraph>{profile.bio}</Paragraph>
                                </div>
                            </Space>
                        )}

                        {editMode && (
                            <Form
                                form={form}
                                layout='vertical'
                                initialValues={profile}
                                onFinish={handleSave}
                            >
                                <Form.Item
                                    name='name'
                                    label='Name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your name'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder='Your Name'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name='email'
                                    label='Email'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your email'
                                        },
                                        {
                                            type: 'email',
                                            message:
                                                'Please enter a valid email'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder='Your Email'
                                    />
                                </Form.Item>

                                <Form.Item name='phone' label='Phone'>
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder='Your Phone Number'
                                    />
                                </Form.Item>

                                <Form.Item name='address' label='Address'>
                                    <Input
                                        prefix={<HomeOutlined />}
                                        placeholder='Your Address'
                                    />
                                </Form.Item>

                                <Form.Item name='bio' label='Bio'>
                                    <Input.TextArea
                                        placeholder='Tell us about yourself'
                                        rows={4}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        block
                                    >
                                        Save Changes
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Card>
                </Col>

                {/* Activity & Statistics */}
                <Col xs={24} lg={16}>
                    <Card style={{ marginBottom: '24px' }}>
                        <Tabs defaultActiveKey='1'>
                            <TabPane
                                tab={
                                    <span>
                                        <HistoryOutlined /> Bid History
                                    </span>
                                }
                                key='1'
                            >
                                <List
                                    itemLayout='horizontal'
                                    dataSource={bidHistory}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                getStatusTag(item.status)
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={item.item}
                                                description={`Bid: ${item.amount} on ${item.date}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                            <TabPane
                                tab={
                                    <span>
                                        <HeartOutlined /> Watchlist
                                    </span>
                                }
                                key='2'
                            >
                                <List
                                    itemLayout='horizontal'
                                    dataSource={watchedItems}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    size='small'
                                                    onClick={() =>
                                                        navigate(
                                                            `/auction/${item.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={item.name}
                                                description={`Current Bid: ${item.currentBid} • Ends in: ${item.endTime}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>

                    <Card title='Account Statistics'>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Total Bids'
                                    value={7}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Auctions Won'
                                    value={3}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Watchlist Items'
                                    value={5}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Active Bids'
                                    value={2}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Title level={4}>Recent Activity</Title>
                            <List
                                itemLayout='horizontal'
                                dataSource={[
                                    'You won an auction for "Vintage Camera" (2 days ago)',
                                    'You added "Antique Jewelry Box" to your watchlist (3 days ago)',
                                    'You placed a bid on "Limited Edition Print" (5 days ago)'
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Text>{item}</Text>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MyProfile;
