import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd';
import { DollarOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminGastoComun.css';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { Column } = Table; 
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminGastoComun = () => {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetchGastos();
    fetchResidentes();
    fetchEstadisticas();
  }, []);

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/gastocomun/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setGastos(response.data);
    } catch (error) {
      console.error('Error fetching gastos comunes:', error);
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="admin-gastocomun-container">
      <Title level={2}>Gestión de Gastos Comunes</Title>
      
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Gastos"
              value={estadisticas.totalGastos}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Gastos Pendientes"
              value={estadisticas.gastosPendientes}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monto Pendiente"
              value={estadisticas.montoPendiente}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monto Pagado"
              value={estadisticas.montoPagado}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="$"
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
      
      <Table dataSource={gastos} loading={loading} rowKey="id">
        <Column 
          title="Residente" 
          dataIndex="residente" 
          render={(residente) => (
            typeof residente === 'object' ? 
              `${residente.first_name} ${residente.last_name}` : 
              residente
          )}
        />
        <Column title="Concepto" dataIndex="concepto" />
        <Column title="Descripción" dataIndex="descripcion" ellipsis={true} />
        <Column 
          title="Monto" 
          dataIndex="monto" 
          render={(text) => `$${parseFloat(text).toLocaleString('es-CL')}`}
          sorter={(a, b) => a.monto - b.monto}
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
          render={(text) => formatDate(text)}
          sorter={(a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)}
        />
        <Column 
          title="Fecha Pago" 
          dataIndex="fecha_pago" 
          render={(text) => text ? formatDate(text) : '-'}
        />
      </Table>
      
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
  );
};

export default AdminGastoComun;
