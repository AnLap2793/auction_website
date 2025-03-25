import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Badge,
    Breadcrumb,
    theme
} from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ProductOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    DashboardFilled,
    DollarOutlined,
    BellOutlined,
    SettingOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { removeAdminToken } from '../utils/tokenManager';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;

const AdminLayout = ({ setIsAdminAuthenticated }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useToken();
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);

    // Cập nhật breadcrumb dựa trên đường dẫn hiện tại
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const items = [
            {
                title: (
                    <Link to='/admin'>
                        <HomeOutlined /> Trang chủ
                    </Link>
                )
            }
        ];

        pathSegments.forEach((segment, index) => {
            if (segment !== 'admin') {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                items.push({
                    title: (
                        <Link to={path}>
                            {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </Link>
                    )
                });
            }
        });

        setBreadcrumbItems(items);
    }, [location]);

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        removeAdminToken();
        setIsAdminAuthenticated(false);
        navigate('/admin/login');
    };

    // Menu thông báo
    const notificationItems = [
        {
            key: '1',
            label: 'Có 3 phiên đấu giá mới',
            icon: <ShoppingCartOutlined />
        },
        {
            key: '2',
            label: '5 người dùng mới đăng ký',
            icon: <UserOutlined />
        },
        {
            key: '3',
            label: '2 giao dịch cần xác nhận',
            icon: <DollarOutlined />
        }
    ];

    // Menu người dùng
    const userMenuItems = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined />
        },
        {
            key: '2',
            label: 'Cài đặt',
            icon: <SettingOutlined />
        },
        {
            type: 'divider'
        },
        {
            key: '3',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            onClick: handleLogout
        }
    ];

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardFilled />,
            label: <Link to='/admin'>Tổng quan</Link>
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link to='/admin/users'>Người dùng</Link>
        },
        {
            key: 'products',
            icon: <ProductOutlined />,
            label: <Link to='/admin/products'>Sản phẩm</Link>
        },
        {
            key: 'auctions',
            icon: <ShoppingCartOutlined />,
            label: <Link to='/admin/auctions'>Phiên đấu giá</Link>
        },
        {
            key: 'transactions',
            icon: <DollarOutlined />,
            label: <Link to='/admin/transactions'>Giao dịch</Link>
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: token.colorBgContainer
                }}
                theme='light'
            >
                <div
                    style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`
                    }}
                >
                    <Title
                        level={4}
                        style={{ margin: 0, color: token.colorPrimary }}
                    >
                        {collapsed ? 'AD' : 'ADMIN'}
                    </Title>
                </div>
                <Menu
                    mode='inline'
                    defaultSelectedKeys={['dashboard']}
                    selectedKeys={[
                        location.pathname.split('/')[2] || 'dashboard'
                    ]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 200,
                    transition: 'all 0.2s'
                }}
            >
                <Header
                    style={{
                        padding: '0 24px',
                        background: token.colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                    }}
                >
                    <Space>
                        <Button
                            type='text'
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={toggle}
                        />
                        <Breadcrumb items={breadcrumbItems} />
                    </Space>
                    <Space size='large'>
                        <Dropdown
                            menu={{ items: notificationItems }}
                            placement='bottomRight'
                            arrow
                        >
                            <Badge count={3} size='small'>
                                <Button type='text' icon={<BellOutlined />} />
                            </Badge>
                        </Dropdown>
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement='bottomRight'
                            arrow
                        >
                            <Space>
                                <Avatar icon={<UserOutlined />} />
                                {!collapsed && <Text>Admin</Text>}
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>
                <Content
                    style={{
                        margin: '24px',
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadius,
                        minHeight: 280
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
