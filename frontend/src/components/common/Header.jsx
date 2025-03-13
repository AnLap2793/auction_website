import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Badge, Avatar, Dropdown } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    ShoppingOutlined,
    UserOutlined,
    LoginOutlined,
    MenuOutlined,
    HeartOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from './SearchBar';
import './Header.less';

const { Header: AntHeader } = Layout;

const Header = () => {
    const [visible, setVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userMenu = (
        <Menu>
            <Menu.Item key='profile' icon={<UserOutlined />}>
                <Link to='/profile'>My Profile</Link>
            </Menu.Item>
            <Menu.Item key='wishlist' icon={<HeartOutlined />}>
                <Link to='/profile/wishlist'>My Wishlist</Link>
            </Menu.Item>
            <Menu.Item key='bids' icon={<ShoppingOutlined />}>
                <Link to='/profile/bids'>My Bids</Link>
            </Menu.Item>
            {user?.role === 'admin' && (
                <Menu.Item key='admin' icon={<UserOutlined />}>
                    <Link to='/admin/dashboard'>Admin Dashboard</Link>
                </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item
                key='logout'
                icon={<LogoutOutlined />}
                onClick={handleLogout}
            >
                Logout
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to='/'>Home</Link>
        },
        {
            key: '/search',
            icon: <ShoppingOutlined />,
            label: <Link to='/search'>Browse Auctions</Link>
        }
    ];

    return (
        <AntHeader className={`site-header ${scrolled ? 'scrolled' : ''}`}>
            <div className='header-content'>
                <div className='logo'>
                    <Link to='/'>
                        <img src='/logo.svg' alt='Auction Hub' />
                        <span className='logo-text'>Auction Hub</span>
                    </Link>
                </div>

                <div className='search-container'>
                    <SearchBar />
                </div>

                <div className='desktop-menu'>
                    <Menu
                        mode='horizontal'
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                    />
                </div>

                <div className='header-actions'>
                    {isAuthenticated ? (
                        <>
                            <Badge count={3} className='notification-badge'>
                                <Button
                                    type='text'
                                    icon={<BellOutlined />}
                                    className='notification-btn'
                                />
                            </Badge>
                            <Dropdown overlay={userMenu} trigger={['click']}>
                                <div className='user-info'>
                                    <Avatar
                                        src={
                                            user?.avatar ||
                                            '/avatar-default.png'
                                        }
                                    />
                                    <span className='username'>
                                        {user?.name}
                                    </span>
                                </div>
                            </Dropdown>
                        </>
                    ) : (
                        <div className='auth-buttons'>
                            <Button type='text'>
                                <Link to='/login'>Login</Link>
                            </Button>
                            <Button type='primary'>
                                <Link to='/register'>Register</Link>
                            </Button>
                        </div>
                    )}
                    <Button
                        className='menu-button'
                        type='text'
                        icon={<MenuOutlined />}
                        onClick={() => setVisible(true)}
                    />
                </div>
            </div>

            <Drawer
                title='Menu'
                placement='right'
                onClose={() => setVisible(false)}
                visible={visible}
                width={280}
            >
                <Menu
                    mode='vertical'
                    selectedKeys={[location.pathname]}
                    items={[
                        ...menuItems,
                        ...(isAuthenticated
                            ? [
                                  {
                                      key: 'profile',
                                      icon: <UserOutlined />,
                                      label: (
                                          <Link to='/profile'>My Profile</Link>
                                      )
                                  },
                                  {
                                      key: 'wishlist',
                                      icon: <HeartOutlined />,
                                      label: (
                                          <Link to='/profile/wishlist'>
                                              My Wishlist
                                          </Link>
                                      )
                                  },
                                  {
                                      key: 'bids',
                                      icon: <ShoppingOutlined />,
                                      label: (
                                          <Link to='/profile/bids'>
                                              My Bids
                                          </Link>
                                      )
                                  },
                                  {
                                      key: 'logout',
                                      icon: <LogoutOutlined />,
                                      label: (
                                          <span onClick={handleLogout}>
                                              Logout
                                          </span>
                                      )
                                  }
                              ]
                            : [
                                  {
                                      key: 'login',
                                      icon: <LoginOutlined />,
                                      label: <Link to='/login'>Login</Link>
                                  },
                                  {
                                      key: 'register',
                                      icon: <UserOutlined />,
                                      label: (
                                          <Link to='/register'>Register</Link>
                                      )
                                  }
                              ])
                    ]}
                />
            </Drawer>
        </AntHeader>
    );
};

export default Header;
