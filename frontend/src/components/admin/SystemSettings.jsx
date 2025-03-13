import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    InputNumber,
    Select,
    Tabs,
    message,
    Typography,
    Space
} from 'antd';
import {
    SettingOutlined,
    MailOutlined,
    SecurityScanOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { getSettings, updateSettings } from '../../services/adminService';
import './Settings.less';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const settings = await getSettings();
            form.setFieldsValue(settings);
        } catch (error) {
            message.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setSaving(true);
            await updateSettings(values);
            message.success('Settings updated successfully');
        } catch (error) {
            message.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='admin-settings'>
            <Title level={2}>System Settings</Title>

            <Card loading={loading}>
                <Form form={form} layout='vertical' onFinish={handleSubmit}>
                    <Tabs defaultActiveKey='general'>
                        <TabPane
                            tab={
                                <span>
                                    <SettingOutlined />
                                    General
                                </span>
                            }
                            key='general'
                        >
                            <Form.Item
                                name='siteName'
                                label='Site Name'
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name='siteDescription'
                                label='Site Description'
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>

                            <Form.Item
                                name='maintenanceMode'
                                label='Maintenance Mode'
                                valuePropName='checked'
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name='timezone'
                                label='Default Timezone'
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value='UTC'>UTC</Option>
                                    <Option value='America/New_York'>
                                        Eastern Time
                                    </Option>
                                    <Option value='America/Los_Angeles'>
                                        Pacific Time
                                    </Option>
                                    {/* Add more timezones */}
                                </Select>
                            </Form.Item>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <MailOutlined />
                                    Email
                                </span>
                            }
                            key='email'
                        >
                            <Form.Item
                                name='smtpHost'
                                label='SMTP Host'
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name='smtpPort'
                                label='SMTP Port'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} max={65535} />
                            </Form.Item>

                            <Form.Item
                                name='smtpUser'
                                label='SMTP Username'
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name='smtpPassword'
                                label='SMTP Password'
                                rules={[{ required: true }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name='emailFromAddress'
                                label='From Address'
                                rules={[{ required: true, type: 'email' }]}
                            >
                                <Input />
                            </Form.Item>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <SecurityScanOutlined />
                                    Security
                                </span>
                            }
                            key='security'
                        >
                            <Form.Item
                                name='maxLoginAttempts'
                                label='Max Login Attempts'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} max={10} />
                            </Form.Item>

                            <Form.Item
                                name='lockoutDuration'
                                label='Lockout Duration (minutes)'
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={1} />
                            </Form.Item>

                            <Form.Item
                                name='passwordPolicy'
                                label='Password Policy'
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value='basic'>Basic</Option>
                                    <Option value='medium'>Medium</Option>
                                    <Option value='strong'>Strong</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name='twoFactorAuth'
                                label='Two-Factor Authentication'
                                valuePropName='checked'
                            >
                                <Switch />
                            </Form.Item>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <DollarOutlined />
                                    Payment
                                </span>
                            }
                            key='payment'
                        >
                            <Form.Item
                                name='currency'
                                label='Default Currency'
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value='USD'>USD</Option>
                                    <Option value='EUR'>EUR</Option>
                                    <Option value='GBP'>GBP</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name='stripePublicKey'
                                label='Stripe Public Key'
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name='stripeSecretKey'
                                label='Stripe Secret Key'
                                rules={[{ required: true }]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name='paypalClientId'
                                label='PayPal Client ID'
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name='paypalSecret'
                                label='PayPal Secret'
                            >
                                <Input.Password />
                            </Form.Item>
                        </TabPane>
                    </Tabs>

                    <div className='settings-actions'>
                        <Space>
                            <Button onClick={() => form.resetFields()}>
                                Reset
                            </Button>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={saving}
                            >
                                Save Changes
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Settings;
