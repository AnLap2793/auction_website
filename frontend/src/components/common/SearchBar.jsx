import React, { useState } from 'react';
import { Input, Select, Button, Form, Drawer, Slider, DatePicker } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../services/categoryService';
import { useEffect } from 'react';
import './SearchBar.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SearchBar = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [filterVisible, setFilterVisible] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleSearch = (values) => {
        const { query, category, priceRange, dateRange, status } = values;

        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        if (priceRange) {
            params.append('minPrice', priceRange[0]);
            params.append('maxPrice', priceRange[1]);
        }
        if (dateRange) {
            params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
            params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
        }
        if (status) params.append('status', status);

        navigate(`/search?${params.toString()}`);
        setFilterVisible(false);
    };

    return (
        <div className='search-bar'>
            <Form
                form={form}
                onFinish={handleSearch}
                layout='inline'
                className='search-form'
            >
                <Form.Item name='query' className='search-input'>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder='Search for auctions...'
                        allowClear
                        size='large'
                    />
                </Form.Item>
                <Form.Item name='category' className='category-select'>
                    <Select
                        placeholder='All Categories'
                        allowClear
                        size='large'
                    >
                        {categories.map((category) => (
                            <Option key={category.id} value={category.id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Button
                    type='primary'
                    icon={<FilterOutlined />}
                    onClick={() => setFilterVisible(true)}
                    size='large'
                    className='filter-button'
                >
                    Filters
                </Button>
                <Button
                    type='primary'
                    htmlType='submit'
                    icon={<SearchOutlined />}
                    size='large'
                    loading={loading}
                    className='search-button'
                >
                    Search
                </Button>
            </Form>

            <Drawer
                title='Advanced Filters'
                placement='right'
                onClose={() => setFilterVisible(false)}
                visible={filterVisible}
                width={320}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            onClick={() => form.resetFields()}
                            style={{ marginRight: 8 }}
                        >
                            Reset
                        </Button>
                        <Button type='primary' onClick={() => form.submit()}>
                            Apply Filters
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout='vertical' onFinish={handleSearch}>
                    <Form.Item name='priceRange' label='Price Range'>
                        <Slider
                            range
                            min={0}
                            max={10000}
                            tipFormatter={(value) => `$${value}`}
                        />
                    </Form.Item>
                    <Form.Item name='dateRange' label='Date Range'>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name='status' label='Auction Status'>
                        <Select placeholder='Select status'>
                            <Option value='active'>Active</Option>
                            <Option value='upcoming'>Upcoming</Option>
                            <Option value='ended'>Ended</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default SearchBar;
