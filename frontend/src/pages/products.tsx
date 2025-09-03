import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Col, Row, Select, Spin, Typography, Image, Button, Empty } from 'antd';
import { getProductsApi, getCategoriesApi } from '../util/api';
import type { Product } from '../util/api';
import { ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProductsState {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  categories: string[];
  selectedCategory: string;
  currentPage: number;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    hasMore: true,
    categories: [],
    selectedCategory: 'all',
    currentPage: 1
  });

  const isLoadingRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(true);
  }, [state.selectedCategory]);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await getCategoriesApi();
      if (response.EC === 0) {
        setState(prev => ({ ...prev, categories: response.data || [] }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load products
  const loadProducts = async (reset: boolean = false) => {

    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setState(prev => ({ ...prev, loading: true }));

    try {
      const page = reset ? 1 : state.currentPage;
      const response = await getProductsApi(page, 5, state.selectedCategory);
      
      if (response.EC === 0) {
        const { products, pagination } = response.data;
        
        setState(prev => ({
          ...prev,
          products: reset ? products : [...prev.products, ...products],
          hasMore: pagination.hasMore,
          currentPage: pagination.currentPage,
          loading: false
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setState(prev => ({ ...prev, loading: false }));
    } finally {

      isLoadingRef.current = false;
    }
  };

  const handleCategoryChange = (category: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category,
      products: [],
      currentPage: 1,
      hasMore: true
    }));
  };

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
    
    if (isNearBottom && !isLoadingRef.current && !state.loading && state.hasMore) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [state.loading, state.hasMore]);

  useEffect(() => {
    if (state.currentPage > 1 && !isLoadingRef.current) {
      loadProducts(false);
    }
  }, [state.currentPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={2}>Sản phẩm ({state.products.length})</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/add-product')}
          size="large"
        >
          Thêm sản phẩm
        </Button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <Text strong>Danh mục: </Text>
        <Select
          value={state.selectedCategory}
          onChange={handleCategoryChange}
          style={{ width: 200, marginLeft: 10 }}
        >
          <Option value="all">Tất cả</Option>
          {state.categories.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
      </div>

      {state.products.length === 0 && !state.loading ? (
        <Empty description="Không có sản phẩm nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {state.products.map((product, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`${product._id}-${index}`}>
              <Card
                hoverable
                cover={
                  <Image
                    alt={product.name}
                    src={product.image}
                    height={200}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                }
                actions={[
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => console.log('Add to cart:', product._id)}
                  >
                    Thêm vào giỏ
                  </Button>
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <Text type="secondary">{product.description}</Text>
                      <br />
                      <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                        {product.price.toLocaleString('vi-VN')} VNĐ
                      </Text>
                      <br />
                      <Text type="secondary">Danh mục: {product.category}</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {state.loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
          <div>Đang tải sản phẩm... (Trang {state.currentPage})</div>
        </div>
      )}

      {!state.hasMore && state.products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text type="secondary">Đã hiển thị tất cả sản phẩm</Text>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;