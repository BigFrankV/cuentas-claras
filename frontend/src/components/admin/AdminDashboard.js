import React, { useState, useContext } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  WarningOutlined, 
  LogoutOutlined,
  UserAddOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './AdminDashboard.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
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
    <Layout className="admin-layout">
      <Header className="admin-header">
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
          className="admin-sider"
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
            <Menu.Item key="1" icon={<HomeOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              Usuarios
            </Menu.Item>
            <Menu.Item key="3" icon={<DollarOutlined />}>
              Gastos Comunes
            </Menu.Item>
            <Menu.Item key="4" icon={<WarningOutlined />}>
              Multas
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="admin-content"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Title level={2}>Panel de Administración</Title>
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <UserOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Usuarios</h3>
                  <p>Gestiona los residentes y administradores</p>
                  <Button type="primary">Ver Usuarios</Button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <UserAddOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Registrar Usuario</h3>
                  <p>Añade nuevos residentes o administradores</p>
                  <Button type="primary">Registrar</Button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <DollarOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Gastos Comunes</h3>
                  <p>Administra los gastos del edificio</p>
                  <Button type="primary">Ver Gastos</Button>
                </div>
              </div>
              
              <div className="dashboard-card">
                <WarningOutlined className="card-icon" />
                <div className="card-content">
                  <h3>Multas</h3>
                  <p>Gestiona las multas de los residentes</p>
                  <Button type="primary">Ver Multas</Button>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
