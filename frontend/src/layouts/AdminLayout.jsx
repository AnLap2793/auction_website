import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    ProductOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
    DashboardFilled,
    DollarOutlined
} from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ setIsAdminAuthenticated }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        navigate('/admin/login');
    };

    const items = [
        {
            key: '1',
            icon: <DashboardFilled />,
            label: <Link to={'/admin'}>Tổng quan</Link>
        },
        {
            key: '2',
            icon: <UserOutlined />,
            label: <Link to={'/admin/users'}>Người dùng</Link>
        },
        {
            key: '3',
            icon: <ProductOutlined />,
            label: <Link to={'/admin/products'}>Sản phẩm</Link>
        },
        {
            key: '4',
            icon: <ShoppingCartOutlined />,
            label: <Link to={'/admin/auctions'}>Phiên đấu giá</Link>
        },
        {
            key: '5',
            icon: <DollarOutlined />,
            label: <Link to={'/admin/transactions'}>Giao dịch</Link>
        },
        {
            key: '6',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogout}>Đăng xuất</span>,
            style: { position: 'absolute', bottom: 0, width: '100%' }
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div style={{ marginTop: '46px' }} className='logo'>
                    Admin
                </div>
                <Menu
                    theme='dark'
                    mode='inline'
                    defaultSelectedKeys={['1']}
                    items={items}
                />
            </Sider>
            <Layout
                className='site-layout'
                // style={{ marginLeft: collapsed ? 80 : 200 }}
            >
                <Header
                    className='site-layout-background'
                    style={{ padding: 0 }}
                >
                    <Button
                        type='primary'
                        onClick={toggle}
                        style={{ marginLeft: 16 }}
                    >
                        {collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )}
                    </Button>
                </Header>
                <Content
                    className='site-layout-background'
                    style={{
                        margin: '24px 16px',
                        padding: 24,
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
