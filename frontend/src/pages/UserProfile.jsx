import React, { useState, useEffect } from 'react';
import {
    Routes,
    Route,
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    Layout,
    Menu,
    Typography,
    Avatar,
    Card,
    Tabs,
    Button,
    message,
    Breadcrumb
} from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    HeartOutlined,
    HistoryOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import ProfileInfo from '../components/user/ProfileInfo';
import MyAuctions from '../components/user/MyAuctions';
import MyBids from '../components/user/MyBids';
import Wishlist from '../components/user/Wishlist';
import PaymentHistory from '../components/user/PaymentHistory';
import AccountSettings from '../components/user/AccountSettings';
import './UserProfile.less';

const { Title } = Typography;
const { Sider, Content } = Layout;

const UserProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        // Set active tab based on URL path
        const path = location.pathname.split('/').pop();
        if (path && path !== 'profile') {
            setActiveTab(path);
        } else {
            setActiveTab('profile');
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            message.error('Failed to logout');
        }
    };

    if (!user) {
        return null; // Protected route should handle this
    }

    const menuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to='/profile'>Profile</Link>
        },
        {
            key: 'auctions',
            icon: <ShoppingOutlined />,
            label: <Link to='/profile/auctions'>My Auctions</Link>
        },
        {
            key: 'bids',
            icon: <HistoryOutlined />,
            label: <Link to='/profile/bids'>My Bids</Link>
        },
        {
            key: 'wishlist',
            icon: <HeartOutlined />,
            label: <Link to='/profile/wishlist'>Wishlist</Link>
        },
        {
            key: 'payments',
            icon: <BellOutlined />,
            label: <Link to='/profile/payments'>Payment History</Link>
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link to='/profile/settings'>Account Settings</Link>
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogout}>Logout</span>
        }
    ];

    return (
        <>
            <Helmet>
                <title>My Profile | Auction Hub</title>
            </Helmet>

            <div className='profile-container'>
                <Breadcrumb className='profile-breadcrumb'>
                    <Breadcrumb.Item>
                        <Link to='/'>Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Profile</Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {activeTab === 'profile' && 'My Profile'}
                        {activeTab === 'auctions' && 'My Auctions'}
                        {activeTab === 'bids' && 'My Bids'}
                        {activeTab === 'wishlist' && 'Wishlist'}
                        {activeTab === 'payments' && 'Payment History'}
                        {activeTab === 'settings' && 'Account Settings'}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <Layout className='profile-layout'>
                    <Sider
                        width={250}
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        className='profile-sider'
                        breakpoint='lg'
                        collapsedWidth={0}
                    >
                        <div className='profile-sidebar-header'>
                            <Avatar
                                size={64}
                                src={user.avatar}
                                icon={!user.avatar && <UserOutlined />}
                            />
                            {!collapsed && (
                                <div className='profile-user-info'>
                                    <Title level={4}>{user.name}</Title>
                                    <span className='user-role'>
                                        {user.role}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Menu
                            mode='inline'
                            selectedKeys={[activeTab]}
                            items={menuItems}
                            className='profile-menu'
                        />
                    </Sider>

                    <Content className='profile-content'>
                        <Card className='profile-card'>
                            <Routes>
                                <Route index element={<ProfileInfo />} />
                                <Route
                                    path='auctions'
                                    element={<MyAuctions />}
                                />
                                <Route path='bids' element={<MyBids />} />
                                <Route path='wishlist' element={<Wishlist />} />
                                <Route
                                    path='payments'
                                    element={<PaymentHistory />}
                                />
                                <Route
                                    path='settings'
                                    element={<AccountSettings />}
                                />
                            </Routes>
                        </Card>
                    </Content>
                </Layout>
            </div>
        </>
    );
};

export default UserProfile;
