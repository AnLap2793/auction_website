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
    ShoppingOutlined,
    PlusOutlined,
    FilterOutlined,
    DollarOutlined,
    TagOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {
    getAllProducts,
    updateProduct,
    deleteProduct
} from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { uploadImages, deleteImage } from '../../services/imageService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProductList = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        priceRange: null,
        dateRange: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] =
                    await Promise.all([getAllProducts(), getAllCategories()]);

                const formattedData = productsResponse.data.map((product) => ({
                    id: product.id,
                    tieu_de: product.title,
                    mo_ta: product.description,
                    danh_muc: product.Category?.name || 'Chưa phân loại',
                    gia_khoi_diem: product.starting_price,
                    hinh_anh:
                        product.ProductImages?.map((img) => img.image_url) ||
                        [],
                    nguoi_ban: {
                        id: product.seller_id,
                        ho_ten: `${product.User?.first_name || ''} ${
                            product.User?.last_name || ''
                        }`
                    },
                    thoi_gian_tao:
                        product.created_at || new Date().toISOString(),
                    thoi_gian_cap_nhat:
                        product.updated_at || new Date().toISOString()
                }));
                setData(formattedData);
                setCategories(categoriesResponse.data);
            } catch (error) {
                message.error('Không thể tải dữ liệu: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        if (value.trim() === '') {
            fetchData();
        } else {
            const filteredData = data.filter((item) =>
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
        setIsEditing(false);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setIsEditing(false);
        setFileList([]);
        form.resetFields();
    };

    const handleEdit = (product) => {
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
        setIsEditing(true);
        form.setFieldsValue(product);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            // Xác thực form trước khi submit
            const values = await form.validateFields();

            // Chuẩn bị dữ liệu để cập nhật
            const updatedProduct = {
                id: selectedProduct.id,
                title: values.tieu_de,
                description: values.mo_ta,
                category_name: values.danh_muc,
                starting_price: values.gia_khoi_diem
            };

            // Xử lý hình ảnh
            let imageUrls = [];
            const oldImages = selectedProduct.hinh_anh;
            const currentImages = fileList
                .filter((file) => file.url)
                .map((file) => file.url);

            // Xác định những hình ảnh đã bị xóa
            const deletedImages = oldImages.filter(
                (url) => !currentImages.includes(url)
            );

            // Xóa những hình ảnh cũ
            if (deletedImages.length > 0) {
                //console.log('Các hình ảnh cần xóa:', deletedImages);
                for (const imageUrl of deletedImages) {
                    try {
                        // Trích xuất publicId từ URL Cloudinary
                        // URL có dạng: https://res.cloudinary.com/xxx/image/upload/v1234567890/auction_website/products/abc123def.jpg
                        const urlParts = imageUrl.split('/');
                        const fileNameWithExtension =
                            urlParts[urlParts.length - 1];
                        const fileName = fileNameWithExtension.split('.')[0];

                        // Tạo publicId đúng định dạng (auction_website/products/abc123def)
                        // const folderPath = 'auction_website/products/';
                        // const publicId = folderPath + fileName;

                        console.log('Xóa hình ảnh với fileName:', fileName);
                        await deleteImage(fileName);
                    } catch (deleteError) {
                        console.warn(
                            'Không thể xóa hình ảnh:',
                            imageUrl,
                            deleteError
                        );
                        //message.error('Không thể xóa hình ảnh');
                        // Tiếp tục với các hình ảnh khác, không dừng quá trình cập nhật
                    }
                }
            }

            // Tải lên những hình ảnh mới
            const newFiles = fileList.filter(
                (file) => !file.url && file.originFileObj
            );

            //console.log('Số lượng file mới cần tải lên:', newFiles.length);

            if (newFiles.length > 0) {
                const formData = new FormData();

                newFiles.forEach((file, index) => {
                    formData.append('images', file.originFileObj);
                });

                try {
                    const uploadResponse = await uploadImages(formData);
                    if (uploadResponse && uploadResponse.data) {
                        const newImageUrls = uploadResponse.data.map(
                            (img) => img.url
                        );
                        imageUrls = [...currentImages, ...newImageUrls];
                    } else {
                        imageUrls = currentImages;
                    }
                } catch (uploadError) {
                    //.error('Lỗi khi tải lên hình ảnh:', uploadError);
                    message.error(
                        'Không thể tải lên hình ảnh: ' + uploadError.message
                    );
                    imageUrls = currentImages;
                }
            } else {
                imageUrls = currentImages;
            }

            // Thêm danh sách hình ảnh vào sản phẩm cập nhật
            updatedProduct.ProductImages = imageUrls.map((url) => ({
                image_url: url
            }));

            //console.log('Dữ liệu hình ảnh gửi lên:',updatedProduct.ProductImages);

            // Gọi API cập nhật sản phẩm
            await updateProduct(selectedProduct.id, updatedProduct);

            message.success('Cập nhật sản phẩm thành công');

            // Cập nhật lại danh sách sản phẩm
            const updatedData = data.map((item) => {
                if (item.id === selectedProduct.id) {
                    return {
                        ...item,
                        tieu_de: values.tieu_de,
                        mo_ta: values.mo_ta,
                        danh_muc: values.danh_muc,
                        gia_khoi_diem: values.gia_khoi_diem,
                        hinh_anh: imageUrls,
                        thoi_gian_cap_nhat: new Date().toISOString()
                    };
                }
                return item;
            });
            setData(updatedData);
            setIsModalVisible(false);
            setIsEditing(false);
        } catch (error) {
            console.error('Lỗi chi tiết khi lưu:', error);
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin sản phẩm');
            } else {
                message.error('Lỗi khi cập nhật sản phẩm: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        form.setFieldsValue(selectedProduct);
        setFileList(
            selectedProduct.hinh_anh.map((url, index) => ({
                uid: `-${index}`,
                name: `image-${index}`,
                status: 'done',
                url: url
            }))
        );
    };

    const handleDelete = async (productId) => {
        try {
            setLoading(true);
            // Lấy thông tin sản phẩm cần xóa
            const productToDelete = data.find((item) => item.id === productId);

            // Xóa ảnh trên Cloudinary
            if (
                productToDelete &&
                productToDelete.hinh_anh &&
                productToDelete.hinh_anh.length > 0
            ) {
                for (const imageUrl of productToDelete.hinh_anh) {
                    try {
                        // Trích xuất publicId từ URL Cloudinary
                        const urlParts = imageUrl.split('/');
                        const fileNameWithExtension =
                            urlParts[urlParts.length - 1];
                        const fileName = fileNameWithExtension.split('.')[0];

                        console.log('Deleting image with fileName:', fileName);
                        await deleteImage(fileName);
                    } catch (deleteError) {
                        console.warn(
                            'Không thể xóa hình ảnh:',
                            imageUrl,
                            deleteError
                        );
                    }
                }
            }

            // Xóa sản phẩm
            await deleteProduct(productId);
            message.success('Xóa sản phẩm thành công');
            // Cập nhật lại danh sách sản phẩm
            setData(data.filter((item) => item.id !== productId));
        } catch (error) {
            message.error('Lỗi khi xóa sản phẩm: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async ({ fileList: newFileList, file }) => {
        try {
            // Xử lý trường hợp tải lên file mới
            if (file.originFileObj && !file.url) {
                // Cập nhật trạng thái file
                const updatedFile = {
                    ...file,
                    status: 'uploading'
                };

                // Cập nhật fileList với file đang tải lên
                const updatedFileList = newFileList.map((f) =>
                    f.uid === updatedFile.uid ? updatedFile : f
                );
                setFileList(updatedFileList);

                // Hiển thị preview hình ảnh
                try {
                    const reader = new FileReader();
                    reader.onload = () => {
                        updatedFile.thumbUrl = reader.result;
                        updatedFile.status = 'done';

                        // Cập nhật fileList với file đã hiển thị preview
                        const finalFileList = updatedFileList.map((f) =>
                            f.uid === updatedFile.uid ? updatedFile : f
                        );
                        setFileList(finalFileList);
                    };
                    reader.readAsDataURL(file.originFileObj);
                } catch (error) {
                    message.error('Không thể hiển thị hình ảnh');
                }
            }
            // Xử lý trường hợp xóa file
            else if (file.status === 'removed') {
                // Cập nhật fileList bằng cách lọc bỏ file bị xóa
                setFileList(newFileList.filter((f) => f.uid !== file.uid));
                message.success('Đã xóa ảnh');
            }
            // Cập nhật fileList cho các trường hợp khác
            else {
                setFileList(newFileList);
            }
        } catch (error) {
            message.error('Lỗi xử lý hình ảnh: ' + error.message);
            // Nếu có lỗi, xóa file khỏi danh sách
            setFileList(newFileList.filter((f) => f.uid !== file.uid));
        }
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
        let filteredData = [...data];

        // Lọc theo danh mục
        if (filters.category !== 'all') {
            filteredData = filteredData.filter(
                (item) => item.danh_muc === filters.category
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
                        {/* <Text type='secondary' ellipsis>
                            {record.mo_ta}
                        </Text> */}
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
                    {Number(price).toLocaleString()} VNĐ
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
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title='Tổng sản phẩm'
                                value={data.length}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title='Tổng giá trị'
                                value={data.reduce(
                                    (sum, item) =>
                                        sum + Number(item.gia_khoi_diem),
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
                            {categories.map((category) => (
                                <Option key={category.id} value={category.name}>
                                    {category.name}
                                </Option>
                            ))}
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
                    confirmLoading={loading}
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
                                      loading={loading}
                                  >
                                      Lưu
                                  </Button>
                              ]
                            : [
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
                                    disabled={loading}
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
                                                    {categories.map(
                                                        (category) => (
                                                            <Option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.name
                                                                }
                                                            >
                                                                {category.name}
                                                            </Option>
                                                        )
                                                    )}
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
                                    <Form.Item label='Hình ảnh'>
                                        <Upload
                                            listType='picture-card'
                                            fileList={fileList}
                                            onChange={handleImageChange}
                                            beforeUpload={() => false}
                                            maxCount={8}
                                            multiple
                                            accept='image/*'
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
                                            {Number(
                                                selectedProduct.gia_khoi_diem
                                            ).toLocaleString()}{' '}
                                            VNĐ
                                        </Text>
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
