import React, { useState, useContext } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './ResidentDashboard.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ResidentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);

  // Detectar cambios en el tamaño de la ventana
  React.useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout className="resident-layout">
      <Header className="resident-header">
        <div className="header-left">
          {mobileView && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className="menu-toggle-button"
              style={{ color: 'white', marginRight: '10px' }}
            />
          )}
          <div className="logo">
            <Title level={3} style={{ color: 'white', margin: 0 }}>Cuentas Claras</Title>
          </div>
        </div>
        <div className="header-right">
          <span className="welcome-text">
            Bienvenido, {user?.first_name} {user?.last_name}
          </span>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            Cerrar Sesión
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider 
          width={200} 
          className="resident-sider"
          collapsible
          collapsed={collapsed}
          trigger={null}
          breakpoint="lg"
          collapsedWidth={mobileView ? 0 : 80}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/resident')}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<DollarOutlined />} onClick={() => navigate('/resident/gastocomun')}>
              Gastos Comunes
            </Menu.Item>
            <Menu.Item key="3" icon={<WarningOutlined />} onClick={() => navigate('/resident/multas')}>
              Mis Multas
            </Menu.Item>
            <Menu.Item key="4" icon={<UserOutlined />} onClick={() => navigate('/resident/profile')}>
              Mi Perfil
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="resident-content"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Title level={2}>Panel de Residente</Title>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <DollarOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Gastos Comunes</h3>
                  <p>Consulta y realiza pagos de gastos comunes</p>
                  <Button type="primary" onClick={() => navigate('/resident/gastocomun')}>Ver Gastos</Button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <WarningOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Mis Multas</h3>
                  <p>Revisa y paga tus multas pendientes</p>
                  <Button type="primary" onClick={() => navigate('/resident/multas')}>Ver Multas</Button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <UserOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Mi Perfil</h3>
                  <p>Actualiza tu información personal</p>
                  <Button type="primary" onClick={() => navigate('/resident/profile')}>Editar Perfil</Button>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ResidentDashboard; 