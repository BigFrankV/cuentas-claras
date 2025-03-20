import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, Form, Input, Select, InputNumber, DatePicker, Layout, Menu, Spin, Space, Alert } from 'antd';
import { 
  DollarOutlined, 
  PlusOutlined,
  UserOutlined, 
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  WarningOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminGastoComun.css';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import 'moment/locale/es';
import { useNavigate } from 'react-router-dom';

moment.locale('es');

const { Header, Content, Sider } = Layout;
const { Column } = Table;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminGastoComun = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [residentes, setResidentes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalGastos: 0,
    gastosPendientes: 0,
    gastosPagados: 0,
    montoPendiente: 0,
    montoPagado: 0
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
  useEffect(() => {
    fetchGastos();
    fetchResidentes();
    fetchEstadisticas();
  }, []);

  // Modifica fetchGastos para incluir manejo de errores mejor y debugging
  const fetchGastos = async () => {
    try {
      setLoading(true);
      console.log("Iniciando solicitud de gastos comunes");
      const response = await axios.get(`http://localhost:8000/api/gastocomun/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log("Gastos recibidos:", response.data);
      setGastos(response.data);
    } catch (error) {
      console.error('Error fetching gastos comunes:', error);
      message.error('No se pudieron cargar los gastos comunes');
    } finally {
      setLoading(false);
    }
  };


  const fetchEstadisticas = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/gastocomun/estadisticas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      setEstadisticas({
        totalGastos: response.data.total_gastos,
        gastosPendientes: response.data.total_pendientes,
        gastosPagados: response.data.total_pagados,
        montoPendiente: response.data.monto_pendiente,
        montoPagado: response.data.monto_pagado
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    }
  };

  const fetchResidentes = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/usuarios/residentes/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setResidentes(response.data);
    } catch (error) {
      console.error('Error fetching residentes:', error);
    }
  };

  const handleCreateGasto = () => {
    form.resetFields();
    // Establecer fecha de vencimiento predeterminada (30 días desde hoy)
    form.setFieldsValue({
      fecha_vencimiento: moment().add(30, 'days')
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
     
      await axios.post('http://localhost:8000/api/gastocomun/', {
        residente: values.residente,
        concepto: values.concepto,
        descripcion: values.descripcion,
        monto: values.monto,
        fecha_vencimiento: values.fecha_vencimiento.format('YYYY-MM-DD')
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
     
      setModalVisible(false);
      fetchGastos(); // Recargar la lista de gastos
      fetchEstadisticas(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error creating gasto común:', error);
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
            defaultSelectedKeys={['3']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/admin')}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<TeamOutlined />} onClick={() => navigate('/admin/usuarios')}>
              Usuarios
            </Menu.Item>
            <Menu.Item key="3" icon={<DollarOutlined />} onClick={() => navigate('/admin/gastocomun')}>
              Gastos Comunes
            </Menu.Item>
            <Menu.Item key="4" icon={<WarningOutlined />} onClick={() => navigate('/admin/multas')}>
              Multas
            </Menu.Item>
            <Menu.Item key="5" icon={<FileTextOutlined />} onClick={() => navigate('/admin/reportes')}>
              Reportes
            </Menu.Item>
            <Menu.Item key="6" icon={<UserOutlined />} onClick={() => navigate('/admin/profile')}>
              Mi Perfil
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
            <div className="admin-gastocomun-container">
              <Title level={2}>Gestión de Gastos Comunes</Title>
              
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
                      description={`Hay ${gastosVencidos.length} gasto(s) común(es) vencido(s) pendiente(s) de pago.`}
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
                          value={estadisticas.gastosPendientes}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<ExclamationCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Gastos Pagados"
                          value={estadisticas.gastosPagados}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Total Pendiente"
                          value={formatMonto(estadisticas.montoPendiente)}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<DollarOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card className="stat-card">
                        <Statistic
                          title="Total Pagado"
                          value={formatMonto(estadisticas.montoPagado)}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<DollarOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  <div className="table-actions">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreateGasto}
                      className="create-button"
                    >
                      Crear Nuevo Gasto Común
                    </Button>
                  </div>
                  
                  <Divider orientation="left">
                    <Space>
                      <FilterOutlined />
                      <SortAscendingOutlined />
                      Listado de Gastos Comunes
                    </Space>
                  </Divider>
                  <Table
                    dataSource={gastos}
                    loading={loading}
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
                    <Column
                      title="Residente"
                      dataIndex="residente"
                      render={(residente) => (
                        typeof residente === 'object' ?
                          `${residente.first_name} ${residente.last_name}` :
                          residente
                      )}
                      sorter={(a, b) => {
                        const aName = typeof a.residente === 'object' ? 
                          `${a.residente.first_name} ${a.residente.last_name}` : 
                          a.residente;
                        const bName = typeof b.residente === 'object' ? 
                          `${b.residente.first_name} ${b.residente.last_name}` : 
                          b.residente;
                        return aName.localeCompare(bName);
                      }}
                    />
                    <Column 
                      title="Concepto" 
                      dataIndex="concepto" 
                      sorter={(a, b) => a.concepto.localeCompare(b.concepto)} 
                    />
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
                      title="Fecha Pago"
                      dataIndex="fecha_pago"
                      render={(text) => text ? formatDate(text) : '-'}
                    />
                  </Table>
                </>
              )}
              
              <Modal
                title="Crear Nuevo Gasto Común"
                visible={modalVisible}
                onCancel={handleModalCancel}
                footer={[
                  <Button key="cancel" onClick={handleModalCancel}>
                    Cancelar
                  </Button>,
                  <Button key="submit" type="primary" onClick={handleModalSubmit}>
                    Crear
                  </Button>,
                ]}
              >
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="residente"
                    label="Residente"
                    rules={[{ required: true, message: 'Por favor seleccione un residente' }]}
                  >
                    <Select placeholder="Seleccione un residente">
                      {residentes.map(residente => (
                        <Option key={residente.id} value={residente.id}>
                          {residente.first_name} {residente.last_name} ({residente.username})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                 
                  <Form.Item
                    name="concepto"
                    label="Concepto"
                    rules={[{ required: true, message: 'Por favor ingrese el concepto del gasto' }]}
                  >
                    <Input placeholder="Ej: Gasto común mes de Marzo" />
                  </Form.Item>
                 
                  <Form.Item
                    name="descripcion"
                    label="Descripción"
                    rules={[{ required: true, message: 'Por favor ingrese una descripción' }]}
                  >
                    <TextArea rows={4} placeholder="Detalles del gasto común" />
                  </Form.Item>
                 
                  <Form.Item
                    name="monto"
                    label="Monto"
                    rules={[{ required: true, message: 'Por favor ingrese el monto del gasto' }]}
                  >
                    <InputNumber
                      min={1}
                      step={1000}
                      style={{ width: '100%' }}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      parser={value => value.replace(/\$\s?|(\.|,)/g, '')}
                      placeholder="Monto en pesos"
                    />
                  </Form.Item>
                 
                  <Form.Item
                    name="fecha_vencimiento"
                    label="Fecha de Vencimiento"
                    rules={[{ required: true, message: 'Por favor seleccione la fecha de vencimiento' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      locale={locale}
                      placeholder="Seleccione fecha"
                    />
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminGastoComun;

