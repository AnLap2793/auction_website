import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Card,
    Tabs,
    Button,
    List,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Upload,
    DatePicker,
    Select,
    Empty,
    Row,
    Col,
    Typography,
    Space,
    Divider
} from 'antd';
import {
    ShoppingOutlined,
    PlusOutlined,
    UploadOutlined,
    TagOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Table } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const MyAuctions = () => {
    const { user } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Mock data for active auctions
    const activeAuctions = [
        {
            id: 1,
            title: 'Vintage Leather Camera Bag',
            description:
                'Genuine leather camera bag from the 1950s in excellent condition',
            startingPrice: 75,
            currentBid: 120,
            bidCount: 7,
            endDate: '2023-06-15',
            timeLeft: '2d 5h',
            imageUrl: 'https://via.placeholder.com/150',
            category: 'Vintage'
        },
        {
            id: 2,
            title: 'Handcrafted Wooden Chess Set',
            description:
                'Beautiful hand-carved wooden chess set with inlaid board',
            startingPrice: 150,
            currentBid: 210,
            bidCount: 4,
            endDate: '2023-06-18',
            timeLeft: '5d 12h',
            imageUrl: 'https://via.placeholder.com/150',
            category: 'Collectibles'
        }
    ];

    // Mock data for completed auctions
    const completedAuctions = [
        {
            id: 3,
            title: 'Mid-Century Modern Lamp',
            description:
                'Original 1960s table lamp with brass base and new shade',
            startingPrice: 80,
            finalPrice: 145,
            bidCount: 12,
            endDate: '2023-05-05',
            status: 'Sold',
            imageUrl: 'https://via.placeholder.com/150',
            category: 'Home & Garden'
        },
        {
            id: 4,
            title: 'Rare Stamp Collection',
            description:
                'Collection of 25 rare international stamps from the 1930s',
            startingPrice: 200,
            finalPrice: 350,
            bidCount: 8,
            endDate: '2023-05-10',
            status: 'Sold',
            imageUrl: 'https://via.placeholder.com/150',
            category: 'Collectibles'
        },
        {
            id: 5,
            title: 'Vintage Pocket Watch',
            description:
                'Silver pocket watch from the early 1900s, still working',
            startingPrice: 100,
            finalPrice: 85,
            bidCount: 2,
            endDate: '2023-05-15',
            status: 'Not Sold',
            imageUrl: 'https://via.placeholder.com/150',
            category: 'Jewelry'
        }
    ];

    // Mock data for draft auctions
    const draftAuctions = [
        {
            id: 6,
            title: 'Antique Typewriter',
            description: 'Working condition typewriter from the 1940s',
            startingPrice: 120,
            category: 'Vintage',
            lastUpdated: '2023-05-20'
        },
        {
            id: 7,
            title: 'Collectible Coins Set',
            description: 'Set of 5 commemorative silver coins',
            startingPrice: 250,
            category: 'Collectibles',
            lastUpdated: '2023-05-18'
        }
    ];

    const categories = [
        'Art',
        'Books',
        'Collectibles',
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Jewelry',
        'Music',
        'Sports',
        'Toys',
        'Vintage',
        'Other'
    ];

    const handleCreateAuction = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = (values) => {
        console.log('Submitted auction:', values);
        // In a real app, you would submit this to your backend
        setIsModalVisible(false);
        form.resetFields();
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Row
                justify='space-between'
                align='middle'
                style={{ marginBottom: '24px' }}
            >
                <Col>
                    <Title level={2}>My Auctions</Title>
                </Col>
                <Col>
                    <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={handleCreateAuction}
                    >
                        Create New Auction
                    </Button>
                </Col>
            </Row>

            <Card>
                <Tabs defaultActiveKey='active'>
                    <TabPane
                        tab={
                            <span>
                                <ShoppingOutlined /> Active Auctions (
                                {activeAuctions.length})
                            </span>
                        }
                        key='active'
                    >
                        {activeAuctions.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {activeAuctions.map((auction) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        lg={8}
                                        key={auction.id}
                                    >
                                        <Card
                                            hoverable
                                            cover={
                                                <img
                                                    alt={auction.title}
                                                    src={auction.imageUrl}
                                                    style={{
                                                        height: '200px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            }
                                            actions={[
                                                <Link
                                                    to={`/auction/${auction.id}`}
                                                >
                                                    View Details
                                                </Link>,
                                                <Button type='text' danger>
                                                    End Early
                                                </Button>
                                            ]}
                                        >
                                            <Space
                                                direction='vertical'
                                                style={{ width: '100%' }}
                                            >
                                                <Tag color='blue'>
                                                    {auction.category}
                                                </Tag>
                                                <Title
                                                    level={4}
                                                    style={{ margin: '8px 0' }}
                                                >
                                                    {auction.title}
                                                </Title>
                                                <Paragraph
                                                    ellipsis={{ rows: 2 }}
                                                >
                                                    {auction.description}
                                                </Paragraph>
                                                <Divider
                                                    style={{ margin: '12px 0' }}
                                                />
                                                <Row gutter={[8, 8]}>
                                                    <Col span={12}>
                                                        <Text type='secondary'>
                                                            Current Bid
                                                        </Text>
                                                        <br />
                                                        <Text
                                                            strong
                                                            style={{
                                                                color: '#1890ff'
                                                            }}
                                                        >
                                                            $
                                                            {auction.currentBid}
                                                        </Text>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Text type='secondary'>
                                                            Bids
                                                        </Text>
                                                        <br />
                                                        <Text strong>
                                                            {auction.bidCount}
                                                        </Text>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Text type='secondary'>
                                                            Starting Price
                                                        </Text>
                                                        <br />
                                                        <Text strong>
                                                            $
                                                            {
                                                                auction.startingPrice
                                                            }
                                                        </Text>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Text type='secondary'>
                                                            Time Left
                                                        </Text>
                                                        <br />
                                                        <Text
                                                            strong
                                                            style={{
                                                                color: '#fa8c16'
                                                            }}
                                                        >
                                                            {auction.timeLeft}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty
                                description="You don't have any active auctions"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <UploadOutlined /> Completed (
                                {completedAuctions.length})
                            </span>
                        }
                        key='completed'
                    >
                        <Table
                            dataSource={completedAuctions}
                            rowKey='id'
                            pagination={{ pageSize: 5 }}
                        >
                            <Table.Column
                                title='Item'
                                dataIndex='title'
                                key='title'
                                render={(text) => <Text strong>{text}</Text>}
                            />
                            <Table.Column
                                title='Category'
                                dataIndex='category'
                                key='category'
                                render={(text) => (
                                    <Tag color='blue'>{text}</Tag>
                                )}
                            />
                            <Table.Column
                                title='Start Price'
                                dataIndex='startingPrice'
                                key='startingPrice'
                                render={(price) => `$${price}`}
                            />
                            <Table.Column
                                title='Final Price'
                                dataIndex='finalPrice'
                                key='finalPrice'
                                render={(price) => <Text strong>${price}</Text>}
                            />
                            <Table.Column
                                title='Bids'
                                dataIndex='bidCount'
                                key='bidCount'
                            />
                            <Table.Column
                                title='End Date'
                                dataIndex='endDate'
                                key='endDate'
                            />
                            <Table.Column
                                title='Status'
                                dataIndex='status'
                                key='status'
                                render={(status) => (
                                    <Tag
                                        color={
                                            status === 'Sold'
                                                ? 'success'
                                                : 'error'
                                        }
                                    >
                                        {status}
                                    </Tag>
                                )}
                            />
                            <Table.Column
                                title='Actions'
                                key='actions'
                                render={(_, record) => (
                                    <Link to={`/auction/${record.id}`}>
                                        View Details
                                    </Link>
                                )}
                            />
                        </Table>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <FileTextOutlined /> Drafts (
                                {draftAuctions.length})
                            </span>
                        }
                        key='drafts'
                    >
                        <List
                            itemLayout='horizontal'
                            dataSource={draftAuctions}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button type='primary' size='small'>
                                            Edit
                                        </Button>,
                                        <Button size='small'>Publish</Button>,
                                        <Button type='text' danger size='small'>
                                            Delete
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={<Text strong>{item.title}</Text>}
                                        description={
                                            <Space
                                                direction='vertical'
                                                style={{ width: '100%' }}
                                            >
                                                <Paragraph>
                                                    {item.description}
                                                </Paragraph>
                                                <Space>
                                                    <Tag color='blue'>
                                                        {item.category}
                                                    </Tag>
                                                    <Tag color='green'>
                                                        ${item.startingPrice}{' '}
                                                        starting price
                                                    </Tag>
                                                    <Tag>
                                                        Last updated:{' '}
                                                        {item.lastUpdated}
                                                    </Tag>
                                                </Space>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Create Auction Modal */}
            <Modal
                title='Create New Auction'
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form form={form} layout='vertical' onFinish={handleSubmit}>
                    <Form.Item
                        name='title'
                        label='Auction Title'
                        rules={[
                            {
                                required: true,
                                message: 'Please enter the auction title'
                            }
                        ]}
                    >
                        <Input
                            prefix={<FileTextOutlined />}
                            placeholder='Enter a descriptive title'
                        />
                    </Form.Item>

                    <Form.Item
                        name='description'
                        label='Description'
                        rules={[
                            {
                                required: true,
                                message: 'Please enter a description'
                            }
                        ]}
                    >
                        <TextArea
                            placeholder='Describe your item in detail including condition, history, and any special features'
                            rows={4}
                        />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name='category'
                                label='Category'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select a category'
                                    }
                                ]}
                            >
                                <Select
                                    placeholder='Select a category'
                                    prefix={<TagOutlined />}
                                >
                                    {categories.map((category) => (
                                        <Option key={category} value={category}>
                                            {category}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name='startingPrice'
                                label='Starting Price ($)'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter a starting price'
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    placeholder='0.00'
                                    style={{ width: '100%' }}
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name='reservePrice'
                                label='Reserve Price ($) (Optional)'
                                tooltip='Minimum price that must be met for the item to sell'
                            >
                                <InputNumber
                                    min={0}
                                    placeholder='0.00'
                                    style={{ width: '100%' }}
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name='endDate'
                                label='Auction End Date & Time'
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please select an end date and time'
                                    }
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name='images'
                        label='Images'
                        valuePropName='fileList'
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                required: true,
                                message: 'Please upload at least one image'
                            }
                        ]}
                    >
                        <Upload
                            listType='picture-card'
                            beforeUpload={() => false}
                            multiple
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: '8px' }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name='additionalTerms'
                        label='Additional Terms (Optional)'
                    >
                        <TextArea
                            placeholder='Enter any additional terms or conditions for this auction'
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type='default' onClick={handleCancel}>
                                Save as Draft
                            </Button>
                            <Button type='primary' htmlType='submit'>
                                Publish Auction
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyAuctions;
