import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, message, Spin, Layout, Menu } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentMultas.css';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Column } = Table;
const { Title, Text } = Typography;
const { confirm } = Modal;

const ResidentMultas = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalPendiente: 0,
    totalPagado: 0,
    cantidadPendiente: 0,
    cantidadPagado: 0
  });

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

  const fetchMultas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/multas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      // Filtrar multas del usuario actual
      const multasUsuario = response.data.filter(multa => multa.residente === user.id);
      setMultas(multasUsuario);
     
      // Calcular estadísticas
      calcularEstadisticas(multasUsuario);
    } catch (error) {
      console.error('Error fetching multas:', error);
      message.error('No se pudieron cargar las multas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMultas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcularEstadisticas = (datos) => {
    const pendientes = datos.filter(multa => multa.estado === 'pendiente');
    const pagados = datos.filter(multa => multa.estado === 'pagada');
   
    const totalPendiente = pendientes.reduce((sum, multa) => sum + parseFloat(multa.precio || 0), 0);
    const totalPagado = pagados.reduce((sum, multa) => sum + parseFloat(multa.precio || 0), 0);
     
    setEstadisticas({
      totalPendiente,
      totalPagado,
      cantidadPendiente: pendientes.length,
      cantidadPagado: pagados.length
    });
  };

  const showConfirm = (multa) => {
    confirm({
      title: '¿Confirmar pago de multa?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Está a punto de pagar la siguiente multa:</p>
          <p><strong>Motivo:</strong> {multa.motivo}</p>
          <p><strong>Monto:</strong> ${parseFloat(multa.precio || 0).toLocaleString('es-CL')}</p>
          <p><strong>Fecha:</strong> {formatDate(multa.fecha_creacion)}</p>
        </div>
      ),
      okText: 'Confirmar Pago',
      okType: 'primary',
      cancelText: 'Cancelar',
      onOk() {
        handlePay(multa.id);
      },
    });
  };

  const handlePay = async (id) => {
    try {
      setPagando(true);
      await axios.post(`http://localhost:8000/api/multas/${id}/pagar/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      // Actualizar la lista después del pago
      const updatedMultas = multas.map(multa => {
        if (multa.id === id) {
          return { ...multa, estado: 'pagada', fecha_pago: new Date().toISOString() };
        }
        return multa;
      });
     
      setMultas(updatedMultas);
      calcularEstadisticas(updatedMultas);
     
      message.success('Pago de multa realizado con éxito');
    } catch (error) {
      console.error('Error pagando multa:', error);
      message.error('Error al procesar el pago de la multa');
    } finally {
      setPagando(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatMonto = (monto) => {
    if (!monto && monto !== 0) return '$0';
    return `$${parseFloat(monto).toLocaleString('es-CL')}`;
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
            defaultSelectedKeys={['3']}
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
            <div className="multas-container">
              <Title level={2}>Mis Multas</Title>
             
              {loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                  <Text>Cargando multas...</Text>
                </div>
              ) : (
                <>
                  <Row gutter={[16, 16]} className="stats-row">
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Multas Pendientes"
                          value={estadisticas.cantidadPendiente}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<ExclamationCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Multas Pagadas"
                          value={estadisticas.cantidadPagado}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Total Pendiente"
                          value={formatMonto(estadisticas.totalPendiente)}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<WarningOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Total Pagado"
                          value={formatMonto(estadisticas.totalPagado)}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                 
                  <Divider orientation="left">Listado de Multas</Divider>
                 
                  <Table
                    dataSource={multas}
                    loading={pagando}
                    rowKey="id"
                    className="multas-table"
                    pagination={{ pageSize: 5 }}
                  >
                    <Column
                      title="Motivo"
                      dataIndex="motivo"
                      key="motivo"
                      sorter={(a, b) => a.motivo.localeCompare(b.motivo)}
                    />
                    <Column
                      title="Descripción"
                      dataIndex="descripcion"
                      key="descripcion"
                      ellipsis={true}
                    />
                    <Column
                      title="Monto"
                      dataIndex="precio"
                      key="precio"
                      render={(text) => formatMonto(text)}
                      sorter={(a, b) => parseFloat(a.precio || 0) - parseFloat(b.precio || 0)}
                    />
                    <Column
                      title="Fecha"
                      dataIndex="fecha_creacion"
                      key="fecha_creacion"
                      render={(text) => formatDate(text)}
                      sorter={(a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)}
                    />
                    <Column
                      title="Estado"
                      dataIndex="estado"
                      key="estado"
                      render={(estado) => (
                        <Tag color={estado === 'pendiente' ? 'volcano' : 'green'}>
                          {estado.toUpperCase()}
                        </Tag>
                      )}
                      filters={[
                        { text: 'Pendiente', value: 'pendiente' },
                        { text: 'Pagado', value: 'pagada' },
                      ]}
                      onFilter={(value, record) => record.estado === value}
                    />
                    <Column
                      title="Acciones"
                      key="acciones"
                      render={(_, record) => (
                        <Button
                          type="primary"
                          onClick={() => showConfirm(record)}
                          disabled={record.estado !== 'pendiente'}
                          loading={pagando}
                        >
                          Pagar
                        </Button>
                      )}
                    />
                  </Table>
                </>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ResidentMultas;
