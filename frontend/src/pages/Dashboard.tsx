import { Col, Row, Alert, Badge, List, Empty, Card } from 'antd';
import {
  DatabaseOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import MonthlyChart from '../components/Charts/MonthlyChart';
import Loader from '../components/Loader';
import { useCountProductsQuery, useGetAllProductsQuery } from '../redux/features/management/productApi';
import { useYearlySaleQuery } from '../redux/features/management/saleApi';
import DailyChart from '../components/Charts/DailyChart';
import { IProduct } from '../types/product.types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899'];

const Dashboard = () => {
  const { data: productsCount, isLoading: isLoadingCount } = useCountProductsQuery(undefined);
  const { data: yearlyData, isLoading: isLoadingYearly } = useYearlySaleQuery(undefined);
  const { data: allProducts, isLoading: isLoadingAllProducts } = useGetAllProductsQuery({ limit: 1000 });

  if (isLoadingCount || isLoadingYearly || isLoadingAllProducts) {
    return <Loader />;
  }

  const productsList: IProduct[] = allProducts?.data || [];
  
  // Compute low stock items (< 10 quantity)
  const lowStockItems = productsList.filter((item) => item.stock < 10);

  // Compute category distribution for donut chart
  const categoryDataMap: Record<string, number> = {};
  productsList.forEach((product) => {
    const categoryName = product.category?.name || 'Uncategorized';
    categoryDataMap[categoryName] = (categoryDataMap[categoryName] || 0) + product.stock;
  });

  const categoryChartData = Object.keys(categoryDataMap)
    .map((name) => ({
      name,
      value: categoryDataMap[name],
    }))
    .filter((item) => item.value > 0);

  const totalSalesCount = yearlyData?.data.reduce(
    (acc: number, cur: { totalQuantity: number }) => acc + cur.totalQuantity,
    0
  ) || 0;

  const totalRevenue = yearlyData?.data.reduce(
    (acc: number, cur: { totalRevenue: number }) => acc + cur.totalRevenue,
    0
  ) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '0.25rem' }}>
          Overview Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Monitor your inventory levels, revenue growth, and sales activities.
        </p>
      </div>

      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <div className="number-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Total Stock</h3>
                <h1>{productsCount?.data?.totalQuantity || 0}</h1>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)' }}>
                <DatabaseOutlined style={{ fontSize: '1.5rem' }} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total items currently stored in warehouse
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={8}>
          <div className="number-card" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Total Sold Items</h3>
                <h1>{totalSalesCount}</h1>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '50%', color: 'var(--accent)' }}>
                <ShoppingCartOutlined style={{ fontSize: '1.5rem' }} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--accent)' }}>
              ⚡ Sales logs synchronized successfully
            </div>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div className="number-card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Total Revenue</h3>
                <h1>₹ {totalRevenue.toLocaleString('en-IN')}</h1>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--warning-light)', borderRadius: '50%', color: 'var(--warning)' }}>
                <DollarCircleOutlined style={{ fontSize: '1.5rem' }} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Gross earnings from completed transactions
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Charts & Side Panels Section */}
      <Row gutter={[24, 24]}>
        {/* Left Side: Graphs */}
        <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            title="Daily Sales and Revenue"
            bordered={false}
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}
          >
            <DailyChart />
          </Card>

          <Card
            title="Monthly Sales Chart"
            bordered={false}
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}
          >
            <MonthlyChart />
          </Card>
        </Col>

        {/* Right Side: Stock Alerts and Category Breakdown */}
        <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Share Donut Chart */}
          <Card
            title="Stock Distribution (by Category)"
            bordered={false}
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}
          >
            {categoryChartData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {categoryChartData.slice(0, 4).map((item, index) => (
                    <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
                      {item.name}
                    </span>
                  ))}
                  {categoryChartData.length > 4 && <span style={{ color: 'var(--text-muted)' }}>+{categoryChartData.length - 4} more</span>}
                </div>
              </div>
            ) : (
              <Empty description="No categories cataloged yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* Low Stock Warnings Card */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Stock Alerts</span>
                {lowStockItems.length > 0 && <Badge count={lowStockItems.length} style={{ backgroundColor: 'var(--danger)' }} />}
              </div>
            }
            bordered={false}
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}
          >
            {lowStockItems.length > 0 ? (
              <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                <Alert
                  message="Low Stock Warning!"
                  description="The items below are running out of stock. Replenish immediately."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined style={{ color: 'var(--warning)' }} />}
                  style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)' }}
                />
                <List
                  size="small"
                  dataSource={lowStockItems}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '10px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px dashed var(--border-color)',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-title)', display: 'block' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {item.category?.name || 'N/A'}</span>
                      </div>
                      <Badge
                        count={`${item.stock} left`}
                        style={{
                          backgroundColor: item.stock <= 3 ? 'var(--danger)' : 'var(--warning)',
                          color: '#fff',
                        }}
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                description="All inventory levels normal. No alerts."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
