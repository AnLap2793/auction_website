import React from 'react';
import { Layout } from 'antd';
import Hero from '../../components/Hero';
import FeaturedAuctions from '../../components/FeaturedAuctions';
import Categories from '../../components/Categories';
import HowItWorks from '../../components/HowItWorks';

const { Content } = Layout;

const HomePage = () => {
    return (
        <Content style={{ padding: '0', background: '#f5f5f5' }}>
            <Hero />
            <FeaturedAuctions />
            <Categories />
            <HowItWorks />
        </Content>
    );
};

export default HomePage;
