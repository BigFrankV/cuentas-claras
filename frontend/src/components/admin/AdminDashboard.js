import React, { useState, useContext, useEffect } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import {
  HomeOutlined,
  DollarOutlined,
  WarningOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Notificaciones from '../common/Notificaciones';
import AdminEstadisticas from './AdminEstadisticas';
import AdminGastoComun from './AdminGastoComun';
import AdminMultas from './AdminMultas';
import AdminUsuarios from './AdminUsuarios';
import AdminProfile from './AdminProfile';
import AdminConfiguracion from './AdminConfiguracion';
import AdminGuiaUso from './AdminGuiaUso';
import './AdminDashboard.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
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

  // Determinar la ruta actual para seleccionar el menú correspondiente
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return '1';
    if (path === '/admin/estadisticas') return '2';
    if (path === '/admin/gastocomun') return '3';
    if (path === '/admin/multas') return '4';
    if (path === '/admin/residentes') return '5';
    if (path === '/admin/configuracion') return '6';
    if (path === '/admin/profile') return '7';
    if (path === '/admin/guia-uso') return '8';
    return '1';
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
          {/* Componente de notificaciones con isAdmin=true */}
          <Notificaciones isAdmin={true} />
          
          <span className="welcome-text">
            Administrador: {user?.first_name} {user?.last_name}
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
            defaultSelectedKeys={[getSelectedKey()]}
            selectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/admin')}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<BarChartOutlined />} onClick={() => navigate('/admin/estadisticas')}>
              Estadísticas
            </Menu.Item>
            <Menu.Item key="3" icon={<DollarOutlined />} onClick={() => navigate('/admin/gastocomun')}>
              Gastos Comunes
            </Menu.Item>
            <Menu.Item key="4" icon={<WarningOutlined />} onClick={() => navigate('/admin/multas')}>
              Multas
            </Menu.Item>
            <Menu.Item key="5" icon={<TeamOutlined />} onClick={() => navigate('/admin/residentes')}>
              Residentes
            </Menu.Item>
            <Menu.Item key="6" icon={<SettingOutlined />} onClick={() => navigate('/admin/configuracion')}>
              Configuración
            </Menu.Item>
            <Menu.Item key="7" icon={<UserOutlined />} onClick={() => navigate('/admin/profile')}>
              Mi Perfil
            </Menu.Item>
            <Menu.Item key="8" icon={<QuestionCircleOutlined />} onClick={() => navigate('/admin/guia-uso')}>
              Guía de Uso
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
            <Routes>
              <Route path="/" element={
                <>
                  <Title level={2}>Panel de Administración</Title>
                  <div className="dashboard-cards">
                    <div className="dashboard-card">
                      <BarChartOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Estadísticas</h3>
                        <p>Visualiza estadísticas de gastos comunes y multas</p>
                        <Button type="primary" onClick={() => navigate('/admin/estadisticas')}>Ver Estadísticas</Button>
                      </div>
                    </div>
                   
                    <div className="dashboard-card">
                      <DollarOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Gastos Comunes</h3>
                        <p>Administra los gastos comunes de los residentes</p>
                        <Button type="primary" onClick={() => navigate('/admin/gastocomun')}>Administrar</Button>
                      </div>
                    </div>
                   
                    <div className="dashboard-card">
                      <WarningOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Multas</h3>
                        <p>Gestiona las multas de los residentes</p>
                        <Button type="primary" onClick={() => navigate('/admin/multas')}>Administrar</Button>
                      </div>
                    </div>
                   
                    <div className="dashboard-card">
                      <TeamOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Residentes</h3>
                        <p>Administra los usuarios residentes</p>
                        <Button type="primary" onClick={() => navigate('/admin/residentes')}>Administrar</Button>
                      </div>
                    </div>
                   
                    <div className="dashboard-card">
                      <SettingOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Configuración</h3>
                        <p>Configura los parámetros del sistema</p>
                        <Button type="primary" onClick={() => navigate('/admin/configuracion')}>Configurar</Button>
                      </div>
                    </div>
                   
                    {/* Tarjeta para Guía de Uso */}
                    <div className="dashboard-card">
                      <QuestionCircleOutlined className="card-icon" />
                      <div className="card-content">
                        <h3>Guía de Uso</h3>
                        <p>Consulta la documentación y ayuda del sistema</p>
                        <Button type="primary" onClick={() => navigate('/admin/guia-uso')}>Ver Guía</Button>
                      </div>
                    </div>
                  </div>
                </>
              } />
              <Route path="estadisticas" element={<AdminEstadisticas />} />
              <Route path="gastocomun" element={<AdminGastoComun />} />
              <Route path="multas" element={<AdminMultas />} />
              <Route path="residentes" element={<AdminUsuarios />} />
              <Route path="configuracion" element={<AdminConfiguracion />} />
              <Route path="guia-uso" element={<AdminGuiaUso />} />
              <Route path="profile" element={<AdminProfile />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
