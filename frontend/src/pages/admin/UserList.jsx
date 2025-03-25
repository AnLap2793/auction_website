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
import { getUsers } from '../../services/apiUser';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// Dữ liệu mẫu
// const users = [
//     {
//         id: '1',
//         username: 'nguyenvana',
//         fullName: 'Nguyễn Văn A',
//         email: 'nguyenvana@example.com',
//         phone: '0901234567',
//         role: 'user',
//         status: 'active',
//         createdAt: '2024-01-01',
//         lastLogin: '2024-04-10 10:30:00',
//         avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
//         address: 'Hà Nội',
//         totalTransactions: 15,
//         totalAuctions: 25,
//         verifiedEmail: true,
//         verifiedPhone: true
//     },
//     {
//         id: '2',
//         username: 'tranthib',
//         fullName: 'Trần Thị B',
//         email: 'tranthib@example.com',
//         phone: '0909876543',
//         role: 'admin',
//         status: 'active',
//         createdAt: '2024-01-15',
//         lastLogin: '2024-04-09 15:20:00',
//         avatar: 'https://xsgames.co/randomusers/avatar.php?g=female',
//         address: 'Hồ Chí Minh',
//         totalTransactions: 5,
//         totalAuctions: 10,
//         verifiedEmail: true,
//         verifiedPhone: true
//     },
//     {
//         id: '3',
//         username: 'levanc',
//         fullName: 'Lê Văn C',
//         email: 'levanc@example.com',
//         phone: '0905555555',
//         role: 'user',
//         status: 'inactive',
//         createdAt: '2024-02-01',
//         lastLogin: '2024-03-15 09:00:00',
//         avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
//         address: 'Đà Nẵng',
//         totalTransactions: 0,
//         totalAuctions: 5,
//         verifiedEmail: false,
//         verifiedPhone: true
//     }
// ];

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

    //getUsers
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setData(response.data.data);
            let filteredData = response.data.data;

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
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            message.error('Không thể tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
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
            first_name: record.first_name,
            last_name: record.last_name,
            email: record.email,
            phone_number: record.phone_number,
            role: record.role,
            is_active: record.is_active,
            address: record.address
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            // TODO: Gọi API cập nhật thông tin người dùng
            // const response = await updateUser(selectedUser.id, values);
            message.success('Cập nhật thông tin thành công');
            setIsEditing(false);
            setIsModalVisible(false);
            form.resetFields();
            fetchData(); // Tải lại dữ liệu sau khi cập nhật
        } catch (error) {
            console.error('Lỗi validation:', error);
            message.error('Có lỗi xảy ra khi cập nhật thông tin');
        }
    };

    const handleDelete = async (userId) => {
        try {
            // TODO: Gọi API xóa người dùng
            // await deleteUser(userId);
            message.success('Xóa người dùng thành công');
            fetchData(); // Tải lại dữ liệu sau khi xóa
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            message.error('Không thể xóa người dùng');
        }
    };

    const handleLockUser = async (userId, currentStatus) => {
        try {
            // TODO: Gọi API khóa/mở khóa tài khoản
            // await toggleUserStatus(userId, !currentStatus);
            message.success(
                `${currentStatus ? 'Khóa' : 'Mở khóa'} tài khoản thành công`
            );
            fetchData(); // Tải lại dữ liệu sau khi thay đổi trạng thái
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái:', error);
            message.error('Không thể thay đổi trạng thái tài khoản');
        }
    };

    const getRoleTag = (role) => {
        switch (role) {
            case 'admin':
                return <Tag color='red'>Admin</Tag>;
            case 'seller':
                return <Tag color='green'>Người bán</Tag>;
            case 'buyer':
                return <Tag color='blue'>Người mua</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const getStatusTag = (isActive) => {
        if (isActive) {
            return (
                <Tag icon={<CheckCircleOutlined />} color='success'>
                    Online
                </Tag>
            );
        } else {
            return (
                <Tag icon={<CloseCircleOutlined />} color='error'>
                    Offline
                </Tag>
            );
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
                        <Text
                            strong
                        >{`${record.first_name} ${record.last_name}`}</Text>
                        <Text type='secondary'>{record.email}</Text>
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
                        {record.is_verified && (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        )}
                    </Space>
                    <Space>
                        <PhoneOutlined />
                        <Text>{record.phone_number}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role) => {
                switch (role) {
                    case 'admin':
                        return <Tag color='red'>Admin</Tag>;
                    case 'seller':
                        return <Tag color='green'>Người bán</Tag>;
                    case 'buyer':
                        return <Tag color='blue'>Người mua</Tag>;
                    default:
                        return <Tag>Không xác định</Tag>;
                }
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (isActive) => {
                if (isActive) {
                    return (
                        <Tag icon={<CheckCircleOutlined />} color='success'>
                            Hoạt động
                        </Tag>
                    );
                } else {
                    return (
                        <Tag icon={<CloseCircleOutlined />} color='error'>
                            Đã khóa
                        </Tag>
                    );
                }
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Cập nhật cuối',
            dataIndex: 'updated_at',
            key: 'updated_at',
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
                        title={record.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                    >
                        <Button
                            type={record.is_active ? 'default' : 'primary'}
                            icon={
                                record.is_active ? (
                                    <LockOutlined />
                                ) : (
                                    <UnlockOutlined />
                                )
                            }
                            onClick={() =>
                                handleLockUser(record.id, record.is_active)
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
                                                name='first_name'
                                                label='Tên'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập tên'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='last_name'
                                                label='Họ'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập họ'
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
                                                name='phone_number'
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
                                                    <Option value='seller'>
                                                        Người bán
                                                    </Option>
                                                    <Option value='buyer'>
                                                        Người mua
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='is_active'
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
                                                    <Option value={true}>
                                                        Hoạt động
                                                    </Option>
                                                    <Option value={false}>
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
                                    <Descriptions.Item label='Email'>
                                        <Space>
                                            {selectedUser.email}
                                            {selectedUser.is_verified && (
                                                <CheckCircleOutlined
                                                    style={{ color: '#52c41a' }}
                                                />
                                            )}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Số điện thoại'>
                                        {selectedUser.phone_number}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Họ và tên'>
                                        {`${selectedUser.first_name} ${selectedUser.last_name}`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Vai trò'>
                                        {(() => {
                                            switch (selectedUser.role) {
                                                case 'admin':
                                                    return (
                                                        <Tag color='red'>
                                                            Admin
                                                        </Tag>
                                                    );
                                                case 'seller':
                                                    return (
                                                        <Tag color='green'>
                                                            Người bán
                                                        </Tag>
                                                    );
                                                case 'buyer':
                                                    return (
                                                        <Tag color='blue'>
                                                            Người mua
                                                        </Tag>
                                                    );
                                                default:
                                                    return (
                                                        <Tag>
                                                            Không xác định
                                                        </Tag>
                                                    );
                                            }
                                        })()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Trạng thái'>
                                        {selectedUser.is_active ? (
                                            <Tag
                                                icon={<CheckCircleOutlined />}
                                                color='success'
                                            >
                                                Hoạt động
                                            </Tag>
                                        ) : (
                                            <Tag
                                                icon={<CloseCircleOutlined />}
                                                color='error'
                                            >
                                                Đã khóa
                                            </Tag>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Địa chỉ' span={2}>
                                        {selectedUser.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Ngày tạo'>
                                        {moment(selectedUser.created_at).format(
                                            'DD/MM/YYYY'
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Cập nhật cuối'>
                                        {moment(selectedUser.updated_at).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
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
