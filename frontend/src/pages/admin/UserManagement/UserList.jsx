import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Space,
    Tag,
    Button,
    Input,
    Row,
    Col,
    DatePicker,
    Select,
    Typography,
    Modal,
    Form,
    Tooltip,
    Avatar,
    Statistic,
    Descriptions,
    Popconfirm,
    message,
    Switch
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    UnlockOutlined,
    MailOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined,
    SaveOutlined,
    CloseCircleOutlined as CloseIcon
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// Dữ liệu mẫu
const users = [
    {
        id: '1',
        username: 'nguyenvana',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2024-04-10 10:30:00',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
        address: 'Hà Nội',
        totalTransactions: 15,
        totalAuctions: 25,
        verifiedEmail: true,
        verifiedPhone: true
    },
    {
        id: '2',
        username: 'tranthib',
        fullName: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0909876543',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-04-09 15:20:00',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=female',
        address: 'Hồ Chí Minh',
        totalTransactions: 5,
        totalAuctions: 10,
        verifiedEmail: true,
        verifiedPhone: true
    },
    {
        id: '3',
        username: 'levanc',
        fullName: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0905555555',
        role: 'user',
        status: 'inactive',
        createdAt: '2024-02-01',
        lastLogin: '2024-03-15 09:00:00',
        avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
        address: 'Đà Nẵng',
        totalTransactions: 0,
        totalAuctions: 5,
        verifiedEmail: false,
        verifiedPhone: true
    }
];

const UserList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        role: 'all',
        dateRange: null
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = () => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            let filteredData = [...users];

            // Lọc theo trạng thái
            if (filters.status !== 'all') {
                filteredData = filteredData.filter(
                    (item) => item.status === filters.status
                );
            }

            // Lọc theo vai trò
            if (filters.role !== 'all') {
                filteredData = filteredData.filter(
                    (item) => item.role === filters.role
                );
            }

            // Lọc theo khoảng thời gian
            if (filters.dateRange) {
                const [start, end] = filters.dateRange;
                filteredData = filteredData.filter((item) => {
                    const createdAt = moment(item.createdAt);
                    return createdAt.isBetween(start, end, 'day', '[]');
                });
            }

            // Lọc theo từ khóa tìm kiếm
            if (searchText) {
                filteredData = filteredData.filter(
                    (item) =>
                        item.username
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.fullName
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.email
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.phone.includes(searchText)
                );
            }

            setData(filteredData);
            setLoading(false);
        }, 500);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        fetchData();
    };

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }));
    };

    const handleEdit = (record) => {
        setSelectedUser(record);
        setIsEditing(true);
        setIsModalVisible(true);
        form.setFieldsValue({
            username: record.username,
            fullName: record.fullName,
            email: record.email,
            phone: record.phone,
            role: record.role,
            status: record.status,
            address: record.address
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log('Cập nhật thông tin người dùng:', values);
            message.success('Cập nhật thông tin thành công');
            setIsEditing(false);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Lỗi validation:', error);
        }
    };

    const handleDelete = (userId) => {
        console.log('Xóa người dùng:', userId);
        message.success('Xóa người dùng thành công');
    };

    const handleLockUser = (userId, currentStatus) => {
        console.log('Thay đổi trạng thái người dùng:', userId, currentStatus);
        message.success(
            `${
                currentStatus === 'active' ? 'Khóa' : 'Mở khóa'
            } tài khoản thành công`
        );
    };

    const getRoleTag = (role) => {
        switch (role) {
            case 'admin':
                return <Tag color='red'>Admin</Tag>;
            case 'user':
                return <Tag color='blue'>User</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'active':
                return (
                    <Tag icon={<CheckCircleOutlined />} color='success'>
                        Hoạt động
                    </Tag>
                );
            case 'inactive':
                return (
                    <Tag icon={<CloseCircleOutlined />} color='error'>
                        Đã khóa
                    </Tag>
                );
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            fixed: 'left',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.avatar}
                        size={40}
                        icon={<UserOutlined />}
                    />
                    <Space direction='vertical' size={0}>
                        <Text strong>{record.fullName}</Text>
                        <Text type='secondary'>{record.username}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: 250,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Space>
                        <MailOutlined />
                        <Text>{record.email}</Text>
                        {record.verifiedEmail && (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                    </Space>
                    <Space>
                        <PhoneOutlined />
                        <Text>{record.phone}</Text>
                        {record.verifiedPhone && (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                    </Space>
                </Space>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role) => getRoleTag(role)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Hoạt động',
            key: 'activity',
            width: 200,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text>{record.totalTransactions} giao dịch</Text>
                    <Text>{record.totalAuctions} đấu giá</Text>
                </Space>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Đăng nhập cuối',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 150,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title='Chỉnh sửa'>
                        <Button
                            type='primary'
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status === 'active'
                                ? 'Khóa tài khoản'
                                : 'Mở khóa'
                        }
                    >
                        <Button
                            type={
                                record.status === 'active'
                                    ? 'default'
                                    : 'primary'
                            }
                            icon={
                                record.status === 'active' ? (
                                    <LockOutlined />
                                ) : (
                                    <UnlockOutlined />
                                )
                            }
                            onClick={() =>
                                handleLockUser(record.id, record.status)
                            }
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Xóa người dùng'
                            description='Bạn có chắc chắn muốn xóa người dùng này?'
                            onConfirm={() => handleDelete(record.id)}
                            okText='Xóa'
                            cancelText='Hủy'
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                {/* Tiêu đề và thanh tìm kiếm */}
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={2}>Quản lý người dùng</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder='Tìm kiếm người dùng...'
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Button icon={<FilterOutlined />}>Lọc</Button>
                            <Button type='primary' icon={<PlusOutlined />}>
                                Thêm người dùng
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Tổng người dùng'
                                value={data.length}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đang hoạt động'
                                value={
                                    data.filter((u) => u.status === 'active')
                                        .length
                                }
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đã khóa'
                                value={
                                    data.filter((u) => u.status === 'inactive')
                                        .length
                                }
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Admin'
                                value={
                                    data.filter((u) => u.role === 'admin')
                                        .length
                                }
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<LockOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Bộ lọc */}
                <Card>
                    <Space>
                        <Select
                            style={{ width: 150 }}
                            placeholder='Trạng thái'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('status', value)
                            }
                        >
                            <Option value='all'>Tất cả trạng thái</Option>
                            <Option value='active'>Đang hoạt động</Option>
                            <Option value='inactive'>Đã khóa</Option>
                        </Select>
                        <Select
                            style={{ width: 150 }}
                            placeholder='Vai trò'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('role', value)
                            }
                        >
                            <Option value='all'>Tất cả vai trò</Option>
                            <Option value='admin'>Admin</Option>
                            <Option value='user'>User</Option>
                        </Select>
                        <RangePicker
                            onChange={(dates) =>
                                handleFilterChange('dateRange', dates)
                            }
                            format='DD/MM/YYYY'
                        />
                    </Space>
                </Card>

                {/* Bảng dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey='id'
                    scroll={{ x: 1500 }}
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} người dùng`
                    }}
                />

                {/* Modal chỉnh sửa */}
                <Modal
                    title={
                        isEditing
                            ? 'Chỉnh sửa thông tin người dùng'
                            : 'Chi tiết người dùng'
                    }
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setIsEditing(false);
                        form.resetFields();
                    }}
                    footer={
                        isEditing
                            ? [
                                  <Button
                                      key='cancel'
                                      onClick={() => {
                                          setIsEditing(false);
                                          form.resetFields();
                                      }}
                                  >
                                      Hủy
                                  </Button>,
                                  <Button
                                      key='save'
                                      type='primary'
                                      icon={<SaveOutlined />}
                                      onClick={handleSave}
                                  >
                                      Lưu
                                  </Button>
                              ]
                            : [
                                  <Button
                                      key='close'
                                      onClick={() => setIsModalVisible(false)}
                                  >
                                      Đóng
                                  </Button>
                              ]
                    }
                    width={700}
                >
                    {selectedUser && (
                        <div>
                            {isEditing ? (
                                <Form
                                    form={form}
                                    layout='vertical'
                                    initialValues={selectedUser}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name='username'
                                                label='Tên đăng nhập'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập tên đăng nhập'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='fullName'
                                                label='Họ và tên'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập họ và tên'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name='email'
                                                label='Email'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập email'
                                                    },
                                                    {
                                                        type: 'email',
                                                        message:
                                                            'Email không hợp lệ'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='phone'
                                                label='Số điện thoại'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập số điện thoại'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name='role'
                                                label='Vai trò'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng chọn vai trò'
                                                    }
                                                ]}
                                            >
                                                <Select>
                                                    <Option value='admin'>
                                                        Admin
                                                    </Option>
                                                    <Option value='user'>
                                                        User
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='status'
                                                label='Trạng thái'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng chọn trạng thái'
                                                    }
                                                ]}
                                            >
                                                <Select>
                                                    <Option value='active'>
                                                        Hoạt động
                                                    </Option>
                                                    <Option value='inactive'>
                                                        Khóa
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item name='address' label='Địa chỉ'>
                                        <TextArea rows={3} />
                                    </Form.Item>
                                </Form>
                            ) : (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label='Avatar' span={2}>
                                        <Avatar
                                            src={selectedUser.avatar}
                                            size={64}
                                            icon={<UserOutlined />}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Tên đăng nhập'>
                                        {selectedUser.username}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Họ và tên'>
                                        {selectedUser.fullName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Email'>
                                        <Space>
                                            {selectedUser.email}
                                            {selectedUser.verifiedEmail && (
                                                <CheckCircleOutlined
                                                    style={{ color: '#52c41a' }}
                                                />
                                            )}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Số điện thoại'>
                                        <Space>
                                            {selectedUser.phone}
                                            {selectedUser.verifiedPhone && (
                                                <CheckCircleOutlined
                                                    style={{ color: '#52c41a' }}
                                                />
                                            )}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Vai trò'>
                                        {getRoleTag(selectedUser.role)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Trạng thái'>
                                        {getStatusTag(selectedUser.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Địa chỉ' span={2}>
                                        {selectedUser.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Ngày tạo'>
                                        {moment(selectedUser.createdAt).format(
                                            'DD/MM/YYYY'
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Đăng nhập cuối'>
                                        {moment(selectedUser.lastLogin).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label='Thống kê'
                                        span={2}
                                    >
                                        <Space size='large'>
                                            <Statistic
                                                title='Giao dịch'
                                                value={
                                                    selectedUser.totalTransactions
                                                }
                                            />
                                            <Statistic
                                                title='Đấu giá'
                                                value={
                                                    selectedUser.totalAuctions
                                                }
                                            />
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </div>
                    )}
                </Modal>
            </Space>
        </div>
    );
};

export default UserList;
