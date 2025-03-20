import React from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import UserHeader from '../components/UserHeader';
import AppFooter from '../components/Footer';

const { Content } = Layout;

const UserLayout = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <UserHeader />
            <Layout>
                <Content className='p-8 bg-gray-50'>
                    {' '}
                    <Outlet />{' '}
                </Content>
            </Layout>
            <AppFooter />
        </Layout>
    );
};

export default UserLayout;
