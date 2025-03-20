import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Space,
    Input,
    Dropdown,
    Modal,
    Card,
    Row,
    Col,
    Avatar,
    Button,
    Typography,
    Statistic,
    List
} from 'antd';
import {
    SearchOutlined,
    UpCircleOutlined,
    UserOutlined,
    EditOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Column } = Table;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user1@example.com',
        ho: 'Nguyễn',
        ten: 'Văn A',
        so_dien_thoai: '0123456789',
        dia_chi: '123 Đường ABC, Quận 1, TP.HCM',
        da_xac_thuc: true,
        dang_hoat_dong: true
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'user2@example.com',
        ho: 'Trần',
        ten: 'Thị B',
        so_dien_thoai: '0987654321',
        dia_chi: '456 Đường XYZ, Quận 2, TP.HCM',
        da_xac_thuc: false,
        dang_hoat_dong: false
    }
];

const items = [
    {
        key: 'edit',
        onClick: () => console.log('Chỉnh sửa'),
        label: 'Sửa'
    },
    {
        key: 'delete',
        onClick: () => console.log('Xóa'),
        label: 'Xóa'
    }
];

//const menu = <Menu items={items} />;

const UserList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setselectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Giả lập fetch dữ liệu từ API
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    // Hàm tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        const filteredData = mockData.filter((user) =>
            `${user.ho} ${user.ten}`.toLowerCase().includes(value.toLowerCase())
        );
        setData(filteredData);
    };

    const handleRowClick = (user) => {
        setselectedUser(user);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setselectedUser(null);
    };

    const columns = [
        {
            title: 'Họ và tên',
            key: 'ho_ten',
            render: (_, record) => `${record.ho} ${record.ten}`
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'so_dien_thoai',
            key: 'so_dien_thoai'
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'dia_chi',
            key: 'dia_chi'
        },
        {
            title: 'Trạng thái xác thực',
            dataIndex: 'da_xac_thuc',
            key: 'da_xac_thuc',
            render: (verified) => (
                <Tag color={verified ? 'green' : 'red'}>
                    {verified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
            )
        },
        {
            title: 'Trạng thái hoạt động',
            dataIndex: 'dang_hoat_dong',
            key: 'dang_hoat_dong',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Tag>
            )
        }
    ];

    const handleEdit = () => {
        console.log('Chỉnh sửa thông tin người dùng:', selectedUser);
        // Thêm logic xử lý chỉnh sửa ở đây
    };

    const handleDelete = () => {
        console.log('Xóa người dùng:', selectedUser);
        // Thêm logic xử lý xóa ở đây
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1>Danh sách người dùng</h1>
            <Space style={{ marginBottom: '16px' }}>
                <Input
                    placeholder='Tìm kiếm theo tên'
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>
            <Table
                dataSource={data}
                loading={loading}
                rowKey='id'
                pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record)
                })}
                columns={columns}
            />

            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Chi tiết người dùng</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedUser && (
                    <Space
                        direction='vertical'
                        style={{ width: '100%' }}
                        size='large'
                    >
                        <Card>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Space
                                        direction='vertical'
                                        align='center'
                                        style={{ width: '100%' }}
                                    >
                                        <Avatar
                                            size={100}
                                            icon={<UserOutlined />}
                                        />
                                        <Button
                                            type='primary'
                                            icon={<EditOutlined />}
                                            onClick={handleEdit}
                                        >
                                            Chỉnh sửa thông tin
                                        </Button>
                                    </Space>
                                </Col>
                                <Col span={16}>
                                    <Space
                                        direction='vertical'
                                        style={{ width: '100%' }}
                                    >
                                        <Title level={4}>
                                            {selectedUser.ho} {selectedUser.ten}
                                        </Title>
                                        <Space>
                                            <Tag color='blue'>
                                                {selectedUser.ho}{' '}
                                                {selectedUser.ten}
                                            </Tag>
                                            <Tag
                                                color={
                                                    selectedUser.dang_hoat_dong
                                                        ? 'success'
                                                        : 'error'
                                                }
                                            >
                                                {selectedUser.dang_hoat_dong
                                                    ? 'Đang hoạt động'
                                                    : 'Ngừng hoạt động'}
                                            </Tag>
                                        </Space>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        <Card title='Thông tin tài khoản'>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Space direction='vertical'>
                                        <Text type='secondary'>Email</Text>
                                        <Text strong>{selectedUser.email}</Text>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space direction='vertical'>
                                        <Text type='secondary'>
                                            Số điện thoại
                                        </Text>
                                        <Text strong>
                                            {selectedUser.so_dien_thoai}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space direction='vertical'>
                                        <Text type='secondary'>Địa chỉ</Text>
                                        <Text strong>
                                            {selectedUser.dia_chi}
                                        </Text>
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space direction='vertical'>
                                        <Text type='secondary'>
                                            Trạng thái xác thực
                                        </Text>
                                        <Text strong>
                                            {selectedUser.da_xac_thuc
                                                ? 'Đã xác thực'
                                                : 'Chưa xác thực'}
                                        </Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        <Card title='Thống kê hoạt động'>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title='Tổng số phiên đấu giá'
                                        value={0}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Lượt đặt giá đang hoạt động'
                                        value={0}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Phiên đấu giá đã thắng'
                                        value={0}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        <Card title='Hoạt động gần đây'>
                            <List
                                size='small'
                                dataSource={[
                                    'Tạo phiên đấu giá mới: Máy ảnh cổ',
                                    'Thắng phiên đấu giá: Đồng hồ cổ',
                                    'Đặt giá cho: Bản in nghệ thuật',
                                    'Cập nhật thông tin cá nhân'
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Space>
                                            <ClockCircleOutlined
                                                style={{ color: '#bfbfbf' }}
                                            />
                                            <Text>{item}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        <Space
                            style={{
                                width: '100%',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <Button onClick={handleModalClose}>Đóng</Button>
                            <Button
                                type='primary'
                                danger
                                onClick={handleDelete}
                            >
                                Xóa tài khoản
                            </Button>
                        </Space>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default UserList;
