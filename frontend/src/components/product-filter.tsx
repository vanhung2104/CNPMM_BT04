import React from 'react';
import { Input, Select, Switch, Slider, Space, Typography, Row, Col } from 'antd';

const { Text } = Typography;
const { Option } = Select;

export type SortBy = 'createdAt' | 'price' | 'views' | 'promotion';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilterProps {
  // Data
  categories: string[];

  // Controlled values
  q: string;
  selectedCategory: string;
  inStockOnly: boolean;
  priceRange: [number, number];
  promotionRange: [number, number];
  viewsRange: [number, number];
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Limits (optional)
  priceMin?: number;
  priceMax?: number;
  priceStep?: number;
  promotionMin?: number;
  promotionMax?: number;
  viewsMin?: number;
  viewsMax?: number;
  viewsStep?: number;

  // Events
  onSearch?: () => void;
  onQChange: (q: string) => void;
  onCategoryChange: (category: string) => void;
  onInStockChange: (value: boolean) => void;

  onPriceChange: (range: [number, number]) => void;
  onPriceAfterChange?: (range: [number, number]) => void;

  onPromotionChange: (range: [number, number]) => void;
  onPromotionAfterChange?: (range: [number, number]) => void;

  onViewsChange: (range: [number, number]) => void;
  onViewsAfterChange?: (range: [number, number]) => void;

  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = (
  {
    categories,
    q,
    selectedCategory,
    inStockOnly,
    priceRange,
    promotionRange,
    viewsRange,
    sortBy,
    sortOrder,
    priceMin = 0,
    priceMax = 100_000_000,
    priceStep = 10_000,
    promotionMin = 0,
    promotionMax = 100,
    viewsMin = 0,
    viewsMax = 1_000_000,
    viewsStep = 100,
    onSearch,
    onQChange,
    onCategoryChange,
    onInStockChange,
    onPriceChange,
    onPriceAfterChange,
    onPromotionChange,
    onPromotionAfterChange,
    onViewsChange,
    onViewsAfterChange,
    onSortByChange,
    onSortOrderChange,
  }
) => {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            onSearch={() => onSearch?.()}
            style={{ width: 300 }}
          />

          <span>
            <Text strong>Danh mục: </Text>
            <Select value={selectedCategory} onChange={onCategoryChange} style={{ width: 200, marginLeft: 10 }}>
              <Option value="all">Tất cả</Option>
              {categories.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </span>

          <span>
            <Text strong>Chỉ hiển thị còn hàng: </Text>
            <Switch checked={inStockOnly} onChange={onInStockChange} />
          </span>

          <span>
            <Text strong>Sắp xếp: </Text>
            <Select value={sortBy} style={{ width: 160 }} onChange={(v: SortBy) => onSortByChange(v)}>
              <Option value="createdAt">Mới nhất</Option>
              <Option value="price">Giá</Option>
              <Option value="views">Lượt xem</Option>
              <Option value="promotion">Khuyến mãi</Option>
            </Select>
            <Select value={sortOrder} style={{ width: 120, marginLeft: 8 }} onChange={(v: SortOrder) => onSortOrderChange(v)}>
              <Option value="desc">Giảm dần</Option>
              <Option value="asc">Tăng dần</Option>
            </Select>
          </span>
        </Space>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Text strong>Khoảng giá (VNĐ):</Text>
          <Slider
            range
            min={priceMin}
            max={priceMax}
            step={priceStep}
            value={priceRange}
            tooltip={{ formatter: (v) => `${(v || 0).toLocaleString('vi-VN')} đ` }}
            onChange={(val) => onPriceChange(val as [number, number])}
            onChangeComplete={(val) => onPriceAfterChange?.(val as [number, number])}
          />
        </Col>
        <Col xs={24} md={8}>
          <Text strong>Khuyến mãi (%):</Text>
          <Slider
            range
            min={promotionMin}
            max={promotionMax}
            value={promotionRange}
            onChange={(val) => onPromotionChange(val as [number, number])}
            onChangeComplete={(val) => onPromotionAfterChange?.(val as [number, number])}
          />
        </Col>
        <Col xs={24} md={8}>
          <Text strong>Lượt xem:</Text>
          <Slider
            range
            min={viewsMin}
            max={viewsMax}
            step={viewsStep}
            value={viewsRange}
            onChange={(val) => onViewsChange(val as [number, number])}
            onChangeComplete={(val) => onViewsAfterChange?.(val as [number, number])}
          />
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(ProductFilter);
