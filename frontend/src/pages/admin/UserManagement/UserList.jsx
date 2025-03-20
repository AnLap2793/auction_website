import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Input, Dropdown } from 'antd';
import { SearchOutlined, UpCircleOutlined } from '@ant-design/icons';

const { Column } = Table;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user1@example.com',
        ho: 'Nguyễn',
        ten: 'Văn A',
        so_dien_thoai: '0123456789',
        dia_chi: '123 Đường ABC, Quận 1, TP.HCM',
        da_xac_thuc: true,
        dang_hoat_dong: true
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'user2@example.com',
        ho: 'Trần',
        ten: 'Thị B',
        so_dien_thoai: '0987654321',
        dia_chi: '456 Đường XYZ, Quận 2, TP.HCM',
        da_xac_thuc: false,
        dang_hoat_dong: false
    }
];

const items = [
    {
        key: 'view',
        onClick: () => console.log('Xem chi tiết'),
        label: 'Xem chi tiết'
    },
    {
        key: 'edit',
        onClick: () => console.log('Chỉnh sửa'),
        label: 'Sửa'
    },
    {
        key: 'delete',
        onClick: () => console.log('Xóa'),
        label: 'Xóa'
    }
];

//const menu = <Menu items={items} />;

const UserList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Giả lập fetch dữ liệu từ API
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    // Hàm tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        const filteredData = mockData.filter((user) =>
            `${user.ho} ${user.ten}`.toLowerCase().includes(value.toLowerCase())
        );
        setData(filteredData);
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1>Danh sách người dùng</h1>
            <Space style={{ marginBottom: '16px' }}>
                <Input
                    placeholder='Tìm kiếm theo tên'
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>
            <Table
                dataSource={data}
                loading={loading}
                rowKey='id'
                pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            >
                <Column
                    title='Họ và tên'
                    key='ho_ten'
                    render={(_, record) => `${record.ho} ${record.ten}`}
                    ellipsis
                />
                <Column title='Email' dataIndex='email' key='email' ellipsis />
                <Column
                    title='Số điện thoại'
                    dataIndex='so_dien_thoai'
                    key='so_dien_thoai'
                    ellipsis
                />
                <Column
                    title='Địa chỉ'
                    dataIndex='dia_chi'
                    key='dia_chi'
                    ellipsis
                />
                <Column
                    title='Trạng thái xác thực'
                    dataIndex='da_xac_thuc'
                    key='da_xac_thuc'
                    render={(verified) => (
                        <Tag color={verified ? 'green' : 'red'}>
                            {verified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </Tag>
                    )}
                />
                <Column
                    title='Trạng thái hoạt động'
                    dataIndex='dang_hoat_dong'
                    key='dang_hoat_dong'
                    render={(active) => (
                        <Tag color={active ? 'green' : 'red'}>
                            {active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </Tag>
                    )}
                />
                <Column
                    responsive={['xs', 'sm']}
                    title='Thao tác'
                    key='action'
                    render={() => (
                        <Dropdown
                            menu={{
                                items
                            }}
                            placement='top'
                            arrow={{
                                pointAtCenter: true
                            }}
                        >
                            <UpCircleOutlined />
                        </Dropdown>
                    )}
                />
            </Table>
        </div>
    );
};

export default UserList;
