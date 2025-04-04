import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Input,
    Button,
    Drawer,
    Space,
    Avatar,
    Dropdown
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
    MenuOutlined,
    SearchOutlined,
    UserOutlined,
    HomeOutlined,
    GiftOutlined,
    AuditOutlined,
    ContactsOutlined,
    ContainerOutlined,
    HeartOutlined,
    LogoutOutlined,
    LoginOutlined,
    UserAddOutlined,
    SettingOutlined,
    GifOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive'; // Sử dụng react-responsive;
import { useAuth } from '../context/AuthContext';

const { Header } = Layout;
const { Search } = Input;

const UserHeader = () => {
    const [visible, setVisible] = useState(false);
    const isDesktop = useMediaQuery({ minWidth: 768 }); // Kiểm tra màn hình lớn hơn 768px
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const showDrawer = () => {
        setVisible(true);
    };

    const onClose = () => {
        setVisible(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const authenticatedMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to='/profile'>My Profile</Link>
        },
        ...(user?.role === 'seller'
            ? [
                  {
                      key: 'my-auctions',
                      icon: <AuditOutlined />,
                      label: <Link to='/my-auctions'>My Auctions</Link>
                  }
              ]
            : []),
        {
            key: 'watchlist',
            icon: <HeartOutlined />,
            label: <Link to='/watchlist'>Watchlist</Link>
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogout}>Logout</span>
        }
    ];

    const unauthenticatedMenuItems = [
        {
            key: 'login',
            icon: <LoginOutlined />,
            label: <Link to='/login'>Sign In</Link>
        },
        {
            key: 'register',
            icon: <UserAddOutlined />,
            label: <Link to='/register'>Register</Link>
        }
    ];

    const userMenuItems = isAuthenticated
        ? authenticatedMenuItems
        : unauthenticatedMenuItems;

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: <Link to='/'>Home</Link>
        },
        {
            key: 'auctions',
            icon: <AuditOutlined />,
            label: <Link to='/auctions'>Auctions</Link>
        },
        // {
        //     key: 'categories',
        //     icon: <GifOutlined />,
        //     label: <Link to='/categories'>Categories</Link>
        // },
        {
            key: 'about',
            icon: <ContainerOutlined />,
            label: <Link to='/about'>About</Link>
        },
        {
            key: 'contact',
            icon: <ContactsOutlined />,
            label: <Link to='/contact'>Contact</Link>
        }
    ];

    return (
        <Header
            style={{
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: '0 20px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                {/* Logo */}
                <div
                    className='logo'
                    style={{ fontSize: '24px', fontWeight: 'bold' }}
                >
                    <Link to='/' style={{ color: '#1890ff' }}>
                        Auction
                    </Link>
                </div>

                <div>
                    {isDesktop ? (
                        <Menu
                            mode='horizontal'
                            items={menuItems}
                            style={{
                                border: 'none',
                                minWidth: '402px'
                            }}
                        />
                    ) : null}
                </div>

                {/* User Tools */}
                <div>
                    <Space size='middle'>
                        {!isAuthenticated ? (
                            <Button
                                type='primary'
                                onClick={() => navigate('/login')}
                            >
                                Sign in
                            </Button>
                        ) : (
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement='bottomRight'
                                arrow
                            >
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#1890ff'
                                    }}
                                />
                            </Dropdown>
                        )}

                        {isDesktop ? null : (
                            <div>
                                <Button
                                    type='text'
                                    icon={<MenuOutlined />}
                                    onClick={showDrawer}
                                    style={{
                                        display: 'inline-block'
                                    }}
                                />
                            </div>
                        )}
                    </Space>
                </div>
            </div>

            {/* Mobile Drawer */}
            <Drawer
                title='Menu'
                placement='right'
                onClose={onClose}
                open={visible}
                width={280}
            >
                <Search
                    placeholder='Search for auctions...'
                    allowClear
                    enterButton={<SearchOutlined />}
                    size='middle'
                    style={{ marginBottom: 20 }}
                />

                <Menu
                    mode='vertical'
                    items={menuItems}
                    style={{ border: 'none', marginBottom: 20 }}
                />
                {isAuthenticated ? (
                    <div
                        style={{
                            padding: '10px 0',
                            borderTop: '1px solid #f0f0f0'
                        }}
                    >
                        <Menu
                            mode='vertical'
                            items={userMenuItems}
                            style={{ border: 'none' }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            padding: '10px 0',
                            borderTop: '1px solid #f0f0f0'
                        }}
                    >
                        <Menu
                            mode='vertical'
                            items={unauthenticatedMenuItems}
                            style={{ border: 'none' }}
                        />
                    </div>
                )}
            </Drawer>
        </Header>
    );
};

export default UserHeader;
