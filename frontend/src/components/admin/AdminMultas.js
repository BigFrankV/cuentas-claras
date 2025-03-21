import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, Form, Input, Select, InputNumber, DatePicker, Spin, Space, Alert, message } from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  StopOutlined
} from '@ant-design/icons';
import axios from 'axios';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { Column } = Table;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminMultas = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [residentes, setResidentes] = useState([]);
  const [loadingResidentes, setLoadingResidentes] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalMultas: 0,
    multasPendientes: 0,
    multasPagadas: 0,
    multasAnuladas: 0,
    montoPendiente: 0,
    montoPagado: 0
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchMultas();
    fetchResidentes();
    fetchEstadisticas();
  }, []);

  const fetchMultas = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await axios.get(`http://localhost:8000/api/multas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setMultas(response.data);
    } catch (error) {
      console.error('Error fetching multas:', error);
      setErrorMessage('No se pudieron cargar las multas');
      message.error('No se pudieron cargar las multas');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/multas/estadisticas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      setEstadisticas({
        totalMultas: response.data.total_multas,
        multasPendientes: response.data.total_pendientes,
        multasPagadas: response.data.total_pagadas,
        multasAnuladas: response.data.total_anuladas,
        montoPendiente: response.data.monto_pendiente,
        montoPagado: response.data.monto_pagado
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
      message.error('Error al cargar las estadísticas de multas');
    }
  };

  const fetchResidentes = async () => {
    try {
      setLoadingResidentes(true);
      const response = await axios.get(`http://localhost:8000/api/usuarios/lista/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // Filtramos solo los residentes
      const soloResidentes = response.data.filter(user => user.rol === 'residente');
      setResidentes(soloResidentes);
    } catch (error) {
      console.error('Error fetching residentes:', error);
      message.error('Error al cargar la lista de residentes');
    } finally {
      setLoadingResidentes(false);
    }
  };

  const handleCreateMulta = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await axios.post('http://localhost:8000/api/multas/', {
        residente: values.residente,
        motivo: values.motivo,
        descripcion: values.descripcion,
        precio: values.precio
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      message.success('Multa creada exitosamente');
      setModalVisible(false);
      fetchMultas(); // Recargar la lista de multas
      fetchEstadisticas(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error creating multa:', error);
      message.error('Error al crear la multa');
    }
  };

  const handleAnularMulta = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/multas/${id}/anular/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      message.success('Multa anulada exitosamente');
      fetchMultas(); // Recargar la lista de multas
      fetchEstadisticas(); // Actualizar estadísticas
    } catch (error) {
      console.error('Error anulando multa:', error);
      message.error('Error al anular la multa');
    }
  };

  const confirmAnularMulta = (multa) => {
    Modal.confirm({
      title: '¿Está seguro de anular esta multa?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, anular',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleAnularMulta(multa.id);
      }
    });
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
    <div className="admin-multas-container">
      <Title level={2}>Gestión de Multas</Title>
      
      {errorMessage && (
        <Alert 
          message="Error" 
          description={errorMessage} 
          type="error" 
          showIcon 
          closable 
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMessage(null)}
        />
      )}
      
      {loading ? (
        <div className="loading-container" style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Cargando multas...</div>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Multas Pendientes"
                  value={estadisticas.multasPendientes}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <Statistic
                  title="Multas Pagadas"
                  value={estadisticas.multasPagadas}
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
          
          <div className="table-actions" style={{ marginTop: 16, marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateMulta}
              className="create-button"
            >
              Crear Nueva Multa
            </Button>
          </div>
          
          <Divider orientation="left">
            <Space>
              <FilterOutlined />
              <SortAscendingOutlined />
              Listado de Multas
            </Space>
          </Divider>
          
          <Table
            dataSource={multas}
            loading={loading}
            rowKey="id"
            className="multas-table"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} multas`
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
              title="Motivo"
              dataIndex="motivo"
              sorter={(a, b) => a.motivo.localeCompare(b.motivo)}
            />
            <Column title="Descripción" dataIndex="descripcion" ellipsis={true} />
            <Column
              title="Monto"
              dataIndex="precio"
              render={(text) => formatMonto(text)}
              sorter={(a, b) => parseFloat(a.precio || 0) - parseFloat(b.precio || 0)}
            />
            <Column
              title="Estado"
              dataIndex="estado"
              render={(estado) => {
                let color = 'green';
                if (estado === 'pendiente') color = 'volcano';
                if (estado === 'anulada') color = 'gray';
                return (
                  <Tag color={color}>
                    {estado.toUpperCase()}
                  </Tag>
                );
              }}
              filters={[
                { text: 'Pendiente', value: 'pendiente' },
                { text: 'Pagada', value: 'pagada' },
                { text: 'Anulada', value: 'anulada' },
              ]}
              onFilter={(value, record) => record.estado === value}
            />
            <Column
              title="Fecha Creación"
              dataIndex="fecha_creacion"
              render={(text) => formatDate(text)}
              sorter={(a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)}
            />
            <Column
              title="Fecha Pago"
              dataIndex="fecha_pago"
              render={(text) => text ? formatDate(text) : '-'}
            />
            <Column
              title="Acciones"
              key="acciones"
              render={(_, record) => (
                <Space>
                  {record.estado === 'pendiente' && (
                    <Button 
                      type="default" 
                      danger
                      icon={<StopOutlined />}
                      onClick={() => confirmAnularMulta(record)}
                    >
                      Anular
                    </Button>
                  )}
                </Space>
              )}
            />
          </Table>
        </>
      )}
      
      <Modal
        title="Crear Nueva Multa"
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
            <Select 
              placeholder="Seleccione un residente" 
              loading={loadingResidentes}
              notFoundContent={loadingResidentes ? <Spin size="small" /> : 'No hay residentes disponibles'}
            >
              {residentes.map(residente => (
                <Option key={residente.id} value={residente.id}>
                  {residente.first_name} {residente.last_name} ({residente.username})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="motivo"
            label="Motivo"
            rules={[{ required: true, message: 'Por favor ingrese el motivo de la multa' }]}
          >
            <Input placeholder="Ej: Exceso de ruido" />
          </Form.Item>
          
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingrese una descripción' }]}
          >
            <TextArea rows={4} placeholder="Detalles de la multa" />
          </Form.Item>
          
          <Form.Item
            name="precio"
            label="Monto"
            rules={[{ required: true, message: 'Por favor ingrese el monto de la multa' }]}
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
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMultas;
