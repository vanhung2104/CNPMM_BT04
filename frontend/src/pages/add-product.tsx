import React from 'react';
import { Form, Input, Button, Select, InputNumber, Row, Col, Card, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createProductApi } from '../util/api';

const { Option } = Select;
const { TextArea } = Input;

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  inStock: boolean;
}

const AddProductPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

  const onFinish = async (values: ProductFormValues) => {
    try {
      setLoading(true);
      
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        image: values.image || 'https://via.placeholder.com/300x200',
        inStock: values.inStock ?? true
      };

      const response = await createProductApi(productData);

      if (response.EC === 0) {
        notification.success({
          message: 'Thành công',
          description: 'Sản phẩm đã được tạo thành công!'
        });
        
        form.resetFields();
        navigate('/products');
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.EM || 'Không thể tạo sản phẩm'
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi tạo sản phẩm'
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: unknown) => {
    console.log('Failed:', errorInfo);
    notification.error({
      message: 'Lỗi validation',
      description: 'Vui lòng kiểm tra lại các trường bắt buộc'
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card title="Thêm Sản Phẩm Mới" bordered={false}>
            <Form
              form={form}
              name="add-product"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                  { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả sản phẩm!' },
                  { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Giá (VNĐ)"
                    name="price"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
                      { type: 'number', min: 1000, message: 'Giá phải lớn hơn 1,000 VNĐ!' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Nhập giá"
                      min={1000}
                      step={1000}
                      controls={true}
                      addonAfter="VNĐ"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Danh mục"
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      {categories.map(category => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="URL hình ảnh"
                name="image"
                rules={[
                  { type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }
                ]}
              >
                <Input 
                  placeholder="https://example.com/image.jpg (tùy chọn)"
                  addonBefore="🖼️"
                />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="inStock"
                initialValue={true}
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select>
                  <Option value={true}>Còn hàng</Option>
                  <Option value={false}>Hết hàng</Option>
                </Select>
              </Form.Item>

              <Form.Item style={{ marginTop: '30px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Button 
                      type="default" 
                      block 
                      onClick={() => navigate('/products')}
                    >
                      Hủy
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm sản phẩm
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddProductPage;