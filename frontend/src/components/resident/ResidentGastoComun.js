import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, message, Spin, Space, Alert, Layout, Menu } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentGastoComun.css';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Column } = Table;
const { Title, Text } = Typography;
const { confirm } = Modal;
 
const ResidentGastoComun = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [gastos, setGastos] = useState([]);
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

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/gastocomun/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      // Filtrar gastos del usuario actual
      const gastosUsuario = response.data.filter(gasto => gasto.residente === user.id);
      setGastos(gastosUsuario);
     
      // Calcular estadísticas
      calcularEstadisticas(gastosUsuario);
    } catch (error) {
      console.error('Error fetching gastos comunes:', error);
      message.error('No se pudieron cargar los gastos comunes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calcularEstadisticas = (datos) => {
    const pendientes = datos.filter(gasto => gasto.estado === 'pendiente');
    const pagados = datos.filter(gasto => gasto.estado === 'pagado');
   
    const totalPendiente = pendientes.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
    const totalPagado = pagados.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
   
    setEstadisticas({
      totalPendiente,
      totalPagado,
      cantidadPendiente: pendientes.length,
      cantidadPagado: pagados.length
    });
  };

  const showConfirm = (gasto) => {
    confirm({
      title: '¿Confirmar pago de gasto común?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Está a punto de pagar el siguiente gasto común:</p>
          <p><strong>Concepto:</strong> {gasto.concepto}</p>
          <p><strong>Monto:</strong> ${parseFloat(gasto.monto).toLocaleString('es-CL')}</p>
          <p><strong>Vencimiento:</strong> {formatDate(gasto.fecha_vencimiento)}</p>
        </div>
      ),
      okText: 'Confirmar Pago',
      okType: 'primary',
      cancelText: 'Cancelar',
      onOk() {
        handlePay(gasto.id);
      },
    });
  };

  const handlePay = async (id) => {
    try {
      setPagando(true);
      await axios.post(`http://localhost:8000/api/gastocomun/${id}/pagar/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      // Actualizar la lista después del pago
      const updatedGastos = gastos.map(gasto => {
        if (gasto.id === id) {
          return { ...gasto, estado: 'pagado', fecha_pago: new Date().toISOString() };
        }
        return gasto;
      });
     
      setGastos(updatedGastos);
      calcularEstadisticas(updatedGastos);
     
      message.success('Pago realizado con éxito');
    } catch (error) {
      console.error('Error pagando gasto común:', error);
      message.error('Error al procesar el pago');
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
    return `$${parseFloat(monto).toLocaleString('es-CL')}`;
  };

  // Verificar si hay gastos vencidos
  const gastosVencidos = gastos.filter(gasto =>
    gasto.estado === 'pendiente' && new Date(gasto.fecha_vencimiento) < new Date()
  );

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
            defaultSelectedKeys={['2']}
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
            <div className="gasto-comun-container">
              <Title level={2}>Mis Gastos Comunes</Title>
             
              {loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                  <Text>Cargando gastos comunes...</Text>
                </div>
              ) : (
                <>
                  {gastosVencidos.length > 0 && (
                    <Alert
                      message="Gastos vencidos"
                      description={`Tiene ${gastosVencidos.length} gasto(s) común(es) vencido(s) pendiente(s) de pago.`}
                      type="warning"
                      showIcon
                      className="alerta-vencidos"
                    />
                  )}
                 
                  <Row gutter={[16, 16]} className="stats-row">
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Gastos Pendientes"
                          value={estadisticas.cantidadPendiente}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<ExclamationCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Gastos Pagados"
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
                          prefix={<DollarOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Total Pagado"
                          value={formatMonto(estadisticas.totalPagado)}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<DollarOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                 
                  <Divider orientation="left">
                    <Space>
                      <FilterOutlined />
                      <SortAscendingOutlined />
                      Listado de Gastos Comunes
                    </Space>
                  </Divider>
                 
                  <Table
                    dataSource={gastos}
                    loading={pagando}
                    rowKey="id"
                    className="gastos-table"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} gastos`
                    }}
                    rowClassName={(record) => {
                      if (record.estado === 'pendiente' && new Date(record.fecha_vencimiento) < new Date()) {
                        return 'row-vencido';
                      }
                      return '';
                    }}
                  >
                    <Column title="Concepto" dataIndex="concepto" sorter={(a, b) => a.concepto.localeCompare(b.concepto)} />
                    <Column title="Descripción" dataIndex="descripcion" ellipsis={true} />
                    <Column
                      title="Monto"
                      dataIndex="monto"
                      render={(text) => formatMonto(text)}
                      sorter={(a, b) => parseFloat(a.monto) - parseFloat(b.monto)}
                    />
                    <Column
                      title="Estado"
                      dataIndex="estado"
                      render={(estado) => (
                        <Tag color={estado === 'pendiente' ? 'volcano' : 'green'}>
                          {estado.toUpperCase()}
                        </Tag>
                      )}
                      filters={[
                        { text: 'Pendiente', value: 'pendiente' },
                        { text: 'Pagado', value: 'pagado' },
                      ]}
                      onFilter={(value, record) => record.estado === value}
                    />
                    <Column
                      title="Fecha Emisión"
                      dataIndex="fecha_emision"
                      render={(text) => formatDate(text)}
                      sorter={(a, b) => new Date(a.fecha_emision) - new Date(b.fecha_emision)}
                    />
                    <Column
                      title="Fecha Vencimiento"
                      dataIndex="fecha_vencimiento"
                      render={(text, record) => {
                        const fechaVencimiento = new Date(text);
                        const hoy = new Date();
                        const esVencido = record.estado === 'pendiente' && fechaVencimiento < hoy;
                       
                        return (
                          <Space>
                            {esVencido && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                            <span className={esVencido ? 'texto-vencido' : ''}>
                              {formatDate(text)}
                            </span>
                          </Space>
                        );
                      }}
                      sorter={(a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)}
                    />
                    <Column
                      title="Acciones"
                      render={(text, record) => (
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

export default ResidentGastoComun;
