import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Space,
    Input,
    Modal,
    Card,
    Row,
    Col,
    Button,
    Typography,
    Image,
    Form,
    InputNumber,
    Select,
    Upload,
    message,
    Statistic,
    Descriptions,
    Tooltip,
    Popconfirm,
    DatePicker
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseCircleOutlined,
    ShoppingOutlined,
    UploadOutlined,
    PlusOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    TagOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '1',
        tieu_de: 'iPhone 14 Pro Max',
        mo_ta: 'Điện thoại iPhone 14 Pro Max mới 100%',
        danh_muc: 'Điện tử',
        gia_khoi_diem: 20000000,
        trang_thai: 'active',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-8-1671776739.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=6Ef2NJjcIfxPkuy6_sJZOA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        nguoi_ban: {
            id: '1',
            ho_ten: 'Nguyễn Văn A'
        },
        thoi_gian_tao: '2023-10-01T10:00:00Z',
        thoi_gian_cap_nhat: '2023-10-05T15:00:00Z'
    },
    {
        id: '2',
        tieu_de: 'Macbook Pro M2',
        mo_ta: 'Macbook Pro M2 2023 mới 100%',
        danh_muc: 'Điện tử',
        gia_khoi_diem: 35000000,
        trang_thai: 'inactive',
        hinh_anh: ['https://via.placeholder.com/150'],
        nguoi_ban: {
            id: '2',
            ho_ten: 'Trần Thị B'
        },
        thoi_gian_tao: '2023-10-02T11:00:00Z',
        thoi_gian_cap_nhat: '2023-10-06T16:00:00Z'
    }
];

const ProductList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        priceRange: null,
        dateRange: null
    });

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 500);
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        if (value.trim() === '') {
            setData(mockData);
        } else {
            const filteredData = mockData.filter((item) =>
                item.tieu_de.toLowerCase().includes(value.toLowerCase())
            );
            setData(filteredData);
        }
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
        setFileList(
            product.hinh_anh.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}`,
                status: 'done',
                url: url
            }))
        );
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setIsEditing(false);
        setFileList([]);
        form.resetFields();
    };

    const handleEdit = () => {
        setIsEditing(true);
        form.setFieldsValue({
            tieu_de: selectedProduct.tieu_de,
            mo_ta: selectedProduct.mo_ta,
            danh_muc: selectedProduct.danh_muc,
            gia_khoi_diem: selectedProduct.gia_khoi_diem,
            trang_thai: selectedProduct.trang_thai
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formData = {
                ...values,
                hinh_anh: fileList.map((file) => file.url || file.response?.url)
            };
            console.log('Cập nhật thông tin sản phẩm:', formData);
            // Thêm logic cập nhật thông tin sản phẩm ở đây
            setIsEditing(false);
        } catch (error) {
            console.error('Lỗi validation:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        form.resetFields();
        setFileList(
            selectedProduct.hinh_anh.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}`,
                status: 'done',
                url: url
            }))
        );
    };

    const handleDelete = () => {
        console.log('Xóa sản phẩm:', selectedProduct);
        // Thêm logic xử lý xóa ở đây
    };

    const handleImageChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
        </div>
    );

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }));
        // Thực hiện lọc dữ liệu dựa trên các bộ lọc
        filterData();
    };

    const filterData = () => {
        let filteredData = [...mockData];

        // Lọc theo danh mục
        if (filters.category !== 'all') {
            filteredData = filteredData.filter(
                (item) => item.danh_muc === filters.category
            );
        }

        // Lọc theo trạng thái
        if (filters.status !== 'all') {
            filteredData = filteredData.filter(
                (item) => item.trang_thai === filters.status
            );
        }

        // Lọc theo khoảng giá
        if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            filteredData = filteredData.filter(
                (item) => item.gia_khoi_diem >= min && item.gia_khoi_diem <= max
            );
        }

        // Lọc theo thời gian
        if (filters.dateRange) {
            const [start, end] = filters.dateRange;
            filteredData = filteredData.filter((item) => {
                const createdAt = moment(item.thoi_gian_tao);
                return createdAt.isBetween(start, end, 'day', '[]');
            });
        }

        setData(filteredData);
    };

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            fixed: 'left',
            width: 300,
            render: (_, record) => (
                <Space>
                    <Image
                        src={record.hinh_anh[0]}
                        alt={record.tieu_de}
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover' }}
                        fallback='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADA...'
                    />
                    <Space direction='vertical' size={0}>
                        <Text strong>{record.tieu_de}</Text>
                        <Text type='secondary' ellipsis>
                            {record.mo_ta}
                        </Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Danh mục',
            dataIndex: 'danh_muc',
            key: 'danh_muc',
            width: 120,
            render: (category) => (
                <Tag color='blue' icon={<TagOutlined />}>
                    {category}
                </Tag>
            )
        },
        {
            title: 'Giá khởi điểm',
            dataIndex: 'gia_khoi_diem',
            key: 'gia_khoi_diem',
            width: 150,
            render: (price) => (
                <Text strong style={{ color: '#f50' }}>
                    {price.toLocaleString()} VNĐ
                </Text>
            )
        },
        {
            title: 'Người bán',
            key: 'nguoi_ban',
            width: 200,
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <Text>{record.nguoi_ban.ho_ten}</Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 150,
            render: (status) => (
                <Tag
                    color={status === 'active' ? 'success' : 'error'}
                    icon={
                        status === 'active' ? (
                            <CheckCircleOutlined />
                        ) : (
                            <CloseCircleOutlined />
                        )
                    }
                >
                    {status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </Tag>
            )
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 200,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text type='secondary'>
                        Tạo:{' '}
                        {moment(record.thoi_gian_tao).format(
                            'DD/MM/YYYY HH:mm'
                        )}
                    </Text>
                    <Text type='secondary'>
                        Cập nhật:{' '}
                        {moment(record.thoi_gian_cap_nhat).format(
                            'DD/MM/YYYY HH:mm'
                        )}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title='Chỉnh sửa'>
                        <Button
                            type='primary'
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Xóa sản phẩm'
                            description='Bạn có chắc chắn muốn xóa sản phẩm này?'
                            onConfirm={(e) => {
                                e.stopPropagation();
                                handleDelete(record.id);
                            }}
                            okText='Xóa'
                            cancelText='Hủy'
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                {/* Tiêu đề và thanh tìm kiếm */}
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={2}>Quản lý sản phẩm</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder='Tìm kiếm sản phẩm...'
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Button icon={<FilterOutlined />}>Lọc</Button>
                            <Button type='primary' icon={<PlusOutlined />}>
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Tổng sản phẩm'
                                value={data.length}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đang hoạt động'
                                value={
                                    data.filter(
                                        (p) => p.trang_thai === 'active'
                                    ).length
                                }
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Ngừng hoạt động'
                                value={
                                    data.filter(
                                        (p) => p.trang_thai === 'inactive'
                                    ).length
                                }
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Tổng giá trị'
                                value={data.reduce(
                                    (sum, item) => sum + item.gia_khoi_diem,
                                    0
                                )}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<DollarOutlined />}
                                suffix='VNĐ'
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Bộ lọc */}
                <Card>
                    <Space>
                        <Select
                            style={{ width: 150 }}
                            placeholder='Danh mục'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('category', value)
                            }
                        >
                            <Option value='all'>Tất cả danh mục</Option>
                            <Option value='Điện tử'>Điện tử</Option>
                            <Option value='Thời trang'>Thời trang</Option>
                            <Option value='Đồ gia dụng'>Đồ gia dụng</Option>
                        </Select>
                        <Select
                            style={{ width: 150 }}
                            placeholder='Trạng thái'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('status', value)
                            }
                        >
                            <Option value='all'>Tất cả trạng thái</Option>
                            <Option value='active'>Đang hoạt động</Option>
                            <Option value='inactive'>Ngừng hoạt động</Option>
                        </Select>
                        <RangePicker
                            onChange={(dates) =>
                                handleFilterChange('dateRange', dates)
                            }
                            format='DD/MM/YYYY'
                        />
                    </Space>
                </Card>

                {/* Bảng dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey='id'
                    scroll={{ x: 1500 }}
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`
                    }}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record)
                    })}
                />

                {/* Modal chi tiết/chỉnh sửa */}
                <Modal
                    title={
                        <Space>
                            <ShoppingOutlined />
                            <span>
                                {isEditing
                                    ? 'Chỉnh sửa sản phẩm'
                                    : 'Chi tiết sản phẩm'}
                            </span>
                        </Space>
                    }
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={
                        isEditing
                            ? [
                                  <Button
                                      key='cancel'
                                      onClick={handleCancelEdit}
                                  >
                                      Hủy
                                  </Button>,
                                  <Button
                                      key='save'
                                      type='primary'
                                      icon={<SaveOutlined />}
                                      onClick={handleSave}
                                  >
                                      Lưu
                                  </Button>
                              ]
                            : [
                                  <Button
                                      key='edit'
                                      type='primary'
                                      icon={<EditOutlined />}
                                      onClick={() => setIsEditing(true)}
                                  >
                                      Chỉnh sửa
                                  </Button>,
                                  <Button
                                      key='close'
                                      onClick={handleModalClose}
                                  >
                                      Đóng
                                  </Button>
                              ]
                    }
                    width={800}
                >
                    {selectedProduct && (
                        <div>
                            {isEditing ? (
                                <Form
                                    form={form}
                                    layout='vertical'
                                    initialValues={selectedProduct}
                                >
                                    <Row gutter={16}>
                                        <Col span={24}>
                                            <Form.Item
                                                name='tieu_de'
                                                label='Tên sản phẩm'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập tên sản phẩm'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name='danh_muc'
                                                label='Danh mục'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng chọn danh mục'
                                                    }
                                                ]}
                                            >
                                                <Select>
                                                    <Option value='Điện tử'>
                                                        Điện tử
                                                    </Option>
                                                    <Option value='Thời trang'>
                                                        Thời trang
                                                    </Option>
                                                    <Option value='Đồ gia dụng'>
                                                        Đồ gia dụng
                                                    </Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='gia_khoi_diem'
                                                label='Giá khởi điểm'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập giá khởi điểm'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ','
                                                        )
                                                    }
                                                    parser={(value) =>
                                                        value.replace(
                                                            /\$\s?|(,*)/g,
                                                            ''
                                                        )
                                                    }
                                                    addonAfter='VNĐ'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item
                                        name='mo_ta'
                                        label='Mô tả'
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập mô tả sản phẩm'
                                            }
                                        ]}
                                    >
                                        <TextArea rows={4} />
                                    </Form.Item>
                                    <Form.Item
                                        name='trang_thai'
                                        label='Trạng thái'
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng chọn trạng thái'
                                            }
                                        ]}
                                    >
                                        <Select>
                                            <Option value='active'>
                                                Đang hoạt động
                                            </Option>
                                            <Option value='inactive'>
                                                Ngừng hoạt động
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label='Hình ảnh'>
                                        <Upload
                                            listType='picture-card'
                                            fileList={fileList}
                                            onChange={handleImageChange}
                                            beforeUpload={() => false}
                                        >
                                            {fileList.length >= 8
                                                ? null
                                                : uploadButton}
                                        </Upload>
                                    </Form.Item>
                                </Form>
                            ) : (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item
                                        label='Hình ảnh'
                                        span={2}
                                    >
                                        <Image.PreviewGroup>
                                            <Space wrap>
                                                {selectedProduct.hinh_anh.map(
                                                    (url, index) => (
                                                        <Image
                                                            key={index}
                                                            src={url}
                                                            width={100}
                                                            height={100}
                                                            style={{
                                                                objectFit:
                                                                    'cover'
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </Space>
                                        </Image.PreviewGroup>
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label='Tên sản phẩm'
                                        span={2}
                                    >
                                        {selectedProduct.tieu_de}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Danh mục'>
                                        <Tag
                                            color='blue'
                                            icon={<TagOutlined />}
                                        >
                                            {selectedProduct.danh_muc}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Giá khởi điểm'>
                                        <Text strong style={{ color: '#f50' }}>
                                            {selectedProduct.gia_khoi_diem.toLocaleString()}{' '}
                                            VNĐ
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Trạng thái'>
                                        {selectedProduct.trang_thai ===
                                        'active' ? (
                                            <Tag
                                                color='success'
                                                icon={<CheckCircleOutlined />}
                                            >
                                                Đang hoạt động
                                            </Tag>
                                        ) : (
                                            <Tag
                                                color='error'
                                                icon={<CloseCircleOutlined />}
                                            >
                                                Ngừng hoạt động
                                            </Tag>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Người bán'>
                                        <Space>
                                            <UserOutlined />
                                            {selectedProduct.nguoi_ban.ho_ten}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Mô tả' span={2}>
                                        {selectedProduct.mo_ta}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Thời gian tạo'>
                                        {moment(
                                            selectedProduct.thoi_gian_tao
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Cập nhật lần cuối'>
                                        {moment(
                                            selectedProduct.thoi_gian_cap_nhat
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </div>
                    )}
                </Modal>
            </Space>
        </div>
    );
};

export default ProductList;
