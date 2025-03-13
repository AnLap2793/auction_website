import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Tag,
    Tooltip,
    Typography,
    Popconfirm
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    UnlockOutlined,
    PlusOutlined
} from '@ant-design/icons';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
} from '../../services/adminService';
import './UserManagement.less';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers(pagination);
            setUsers(response.data);
            setPagination((prev) => ({
                ...prev,
                total: response.total
            }));
        } catch (error) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const showModal = (user = null) => {
        setEditingUser(user);
        form.resetFields();
        if (user) {
            form.setFieldsValue(user);
        }
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await updateUser(editingUser.id, values);
                message.success('User updated successfully');
            } else {
                await createUser(values);
                message.success('User created successfully');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await toggleUserStatus(userId);
            message.success(
                `User ${currentStatus ? 'blocked' : 'unblocked'} successfully`
            );
            fetchUsers();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    {text}
                </Space>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'ACTIVE' : 'BLOCKED'}
                </Tag>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size='middle'>
                    <Tooltip title='Edit'>
                        <Button
                            type='primary'
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.status ? 'Block' : 'Unblock'}>
                        <Button
                            type={record.status ? 'default' : 'primary'}
                            icon={
                                record.status ? (
                                    <LockOutlined />
                                ) : (
                                    <UnlockOutlined />
                                )
                            }
                            onClick={() =>
                                handleToggleStatus(record.id, record.status)
                            }
                        />
                    </Tooltip>
                    <Tooltip title='Delete'>
                        <Popconfirm
                            title='Are you sure you want to delete this user?'
                            onConfirm={() => handleDelete(record.id)}
                            okText='Yes'
                            cancelText='No'
                        >
                            <Button
                                type='primary'
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className='user-management'>
            <Card>
                <div className='table-header'>
                    <Title level={2}>User Management</Title>
                    <Button
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Add User
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey='id'
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                />

                <Modal
                    title={editingUser ? 'Edit User' : 'Add User'}
                    visible={modalVisible}
                    onOk={handleModalOk}
                    onCancel={() => setModalVisible(false)}
                    destroyOnClose
                >
                    <Form form={form} layout='vertical'>
                        <Form.Item
                            name='name'
                            label='Name'
                            rules={[
                                { required: true, message: 'Please enter name' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name='email'
                            label='Email'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter email'
                                },
                                {
                                    type: 'email',
                                    message: 'Please enter valid email'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        {!editingUser && (
                            <Form.Item
                                name='password'
                                label='Password'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter password'
                                    }
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        )}
                        <Form.Item
                            name='role'
                            label='Role'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select role'
                                }
                            ]}
                        >
                            <Select>
                                <Option value='user'>User</Option>
                                <Option value='admin'>Admin</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default UserManagement;
