import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Col, Row, Spin, Typography, Image, Button, Empty } from 'antd';
import { getCategoriesApi, searchProductsApi } from '../util/api';
import type { Product, SearchParams } from '../util/api';
import { ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductFilter from '../components/product-filter';

const { Title, Text } = Typography;
interface ProductsState {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  categories: string[];
  currentPage: number;
  // Filters
  q: string;
  selectedCategory: string;
  inStockOnly: boolean;
  priceRange: [number, number];
  promotionRange: [number, number];
  viewsRange: [number, number];
  sortBy: 'createdAt' | 'price' | 'views' | 'promotion';
  sortOrder: 'asc' | 'desc';
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    hasMore: true,
    categories: [],
    currentPage: 1,
    q: '',
    selectedCategory: 'all',
    inStockOnly: false,
    priceRange: [0, 100000000],
    promotionRange: [0, 100],
    viewsRange: [0, 1000000],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const isLoadingRef = useRef(false);
  // Keep the last applied filters used for querying (only updated when pressing search)
  const appliedRef = useRef({
    q: '',
    selectedCategory: 'all',
    inStockOnly: false,
    priceRange: [0, 100000000] as [number, number],
    promotionRange: [0, 100] as [number, number],
    viewsRange: [0, 1000000] as [number, number],
    sortBy: 'createdAt' as ProductsState['sortBy'],
    sortOrder: 'desc' as ProductsState['sortOrder'],
  });
  // Whether user has performed a search; guard loading until then
  const hasSearchedRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto load once on first mount (initial list)
  useEffect(() => {
    appliedRef.current = {
      q: state.q,
      selectedCategory: state.selectedCategory,
      inStockOnly: state.inStockOnly,
      priceRange: state.priceRange,
      promotionRange: state.promotionRange,
      viewsRange: state.viewsRange,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    };
    hasSearchedRef.current = true;
    resetList();
    loadProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Load products via search API
  const loadProducts = useCallback(async (reset: boolean = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setState(prev => ({ ...prev, loading: true }));

    try {
      const page = reset ? 1 : state.currentPage;
      // Use applied filters snapshot (only set when pressing search)
      const filters = appliedRef.current;
      const [priceMin, priceMax] = filters.priceRange;
      const [promotionMin, promotionMax] = filters.promotionRange;
      const [viewsMin, viewsMax] = filters.viewsRange;

      const params: SearchParams = {
        q: filters.q,
        page,
        limit: 8,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      if (filters.inStockOnly) {
        params.inStock = true;
      }
      if (filters.selectedCategory && filters.selectedCategory !== 'all') {
        params.category = filters.selectedCategory;
      }

      // Only include ranges if user changed from defaults
      if (priceMin !== 0) params.priceMin = priceMin;
      if (priceMax !== 100000000) params.priceMax = priceMax;
      if (promotionMin !== 0) params.promotionMin = promotionMin;
      if (promotionMax !== 100) params.promotionMax = promotionMax;
      if (viewsMin !== 0) params.viewsMin = viewsMin;
      if (viewsMax !== 1000000) params.viewsMax = viewsMax;

      const response = await searchProductsApi(params);

      if (response.EC === 0) {
        const { products, pagination } = response.data;
        setState(prev => ({
          ...prev,
          products: reset ? products : [...prev.products, ...products],
          hasMore: pagination.hasMore,
          currentPage: pagination.currentPage,
          loading: false,
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
  }, [state.currentPage]);

  // Reset list helper
  const resetList = useCallback(() => {
    setState(prev => ({ ...prev, products: [], currentPage: 1, hasMore: true }));
  }, []);

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
    
  if (
      isNearBottom &&
      !isLoadingRef.current &&
      !state.loading &&
      state.hasMore &&
      hasSearchedRef.current
    ) {
      setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [state.loading, state.hasMore]);

  useEffect(() => {
    if (state.currentPage > 1 && !isLoadingRef.current && hasSearchedRef.current) {
      loadProducts(false);
    }
    // Intentionally not depending on loadProducts to avoid re-run on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPage]);

  // Remove auto-loading on filter/sort changes; only load on explicit search

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
        <ProductFilter
          categories={state.categories}
          q={state.q}
          selectedCategory={state.selectedCategory}
          inStockOnly={state.inStockOnly}
          priceRange={state.priceRange}
          promotionRange={state.promotionRange}
          viewsRange={state.viewsRange}
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          onSearch={() => {
            // Capture current filters as the applied snapshot
            appliedRef.current = {
              q: state.q,
              selectedCategory: state.selectedCategory,
              inStockOnly: state.inStockOnly,
              priceRange: state.priceRange,
              promotionRange: state.promotionRange,
              viewsRange: state.viewsRange,
              sortBy: state.sortBy,
              sortOrder: state.sortOrder,
            };
            hasSearchedRef.current = true;
            resetList();
            loadProducts(true);
          }}
          onQChange={(q) => setState(prev => ({ ...prev, q }))}
          onCategoryChange={(category) => { setState(prev => ({ ...prev, selectedCategory: category })); }}
          onInStockChange={(v) => { setState(prev => ({ ...prev, inStockOnly: v })); }}
          onPriceChange={(range) => setState(prev => ({ ...prev, priceRange: range }))}
          
          onPromotionChange={(range) => setState(prev => ({ ...prev, promotionRange: range }))}
          
          onViewsChange={(range) => setState(prev => ({ ...prev, viewsRange: range }))}
          
          onSortByChange={(v) => { setState(prev => ({ ...prev, sortBy: v })); }}
          onSortOrderChange={(v) => { setState(prev => ({ ...prev, sortOrder: v })); }}
        />
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
                      {product.promotion && product.promotion > 0 ? (
                        <>
                          <Text delete type="secondary">
                            {product.price.toLocaleString('vi-VN')} VNĐ
                          </Text>
                          <br />
                          <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                            {(Math.round(product.price * (1 - product.promotion / 100))).toLocaleString('vi-VN')} VNĐ
                          </Text>
                          <Text type="danger" style={{ marginLeft: 8 }}>
                            -{product.promotion}%
                          </Text>
                        </>
                      ) : (
                        <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                          {product.price.toLocaleString('vi-VN')} VNĐ
                        </Text>
                      )}
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