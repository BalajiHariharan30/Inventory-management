import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { sidebarItems } from '../../constant/sidebarItems';
import { useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../redux/services/authSlice';

const { Content, Sider } = Layout;

const Sidebar = () => {
  const [showLogoutBtn, setShowLogoutBtn] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: 'linear-gradient(135deg, #09090b 0%, #030712 50%, #0f172a 100%)' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed, type) => {
          if (type === 'responsive' || type === 'clickTrigger') {
            setShowLogoutBtn(!collapsed);
          }
        }}
        width="240px"
        style={{
          backgroundColor: '#09090b',
          position: 'relative',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          style={{
            padding: '1.5rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1rem',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: '800',
              textAlign: 'center',
              letterSpacing: '0.05em',
              background: 'linear-gradient(to right, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>⚡</span> STOCKFLOW
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ backgroundColor: '#09090b', fontWeight: '500', border: 'none' }}
          defaultSelectedKeys={['Dashboard']}
          items={sidebarItems}
        />
        {showLogoutBtn && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              padding: '1.25rem',
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#09090b',
            }}
          >
            <Button
              style={{
                width: '100%',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '40px',
                borderRadius: '6px',
                transition: 'all 200ms ease',
              }}
              onClick={handleClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f43f5e';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#f43f5e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)';
                e.currentTarget.style.color = '#f43f5e';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
              }}
            >
              <LogoutOutlined />
              Logout
            </Button>
          </div>
        )}
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Content style={{ padding: '1.5rem', height: '100vh', overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.5rem',
              height: 'calc(100vh - 3rem)',
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(20px)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
