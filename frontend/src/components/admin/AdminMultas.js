import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd';
import { WarningOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminMultas.css';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { Column } = Table; 
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminMultas = () => {
  const { user } = useContext(AuthContext);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [residentes, setResidentes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalMultas: 0,
    multasPendientes: 0,
    multasPagadas: 0,
    multasAnuladas: 0
  });

  useEffect(() => {
    fetchMultas();
    fetchResidentes();
  }, []);

  const fetchMultas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/multas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setMultas(response.data);
      
      // Calcular estadísticas
      const pendientes = response.data.filter(multa => multa.estado === 'pendiente');
      const pagadas = response.data.filter(multa => multa.estado === 'pagada');
      const anuladas = response.data.filter(multa => multa.estado === 'anulada');
      
      setEstadisticas({
        totalMultas: response.data.length,
        multasPendientes: pendientes.length,
        multasPagadas: pagadas.length,
        multasAnuladas: anuladas.length
      });
    } catch (error) {
      console.error('Error fetching multas:', error);
    } finally {
      setLoading(false);
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
      
      setModalVisible(false);
      fetchMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error creating multa:', error);
    }
  };

  const handleAnularMulta = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/multas/${id}/anular/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      fetchMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error anulando multa:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="admin-multas-container">
      <Title level={2}>Gestión de Multas</Title>
      
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Multas"
              value={estadisticas.totalMultas}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Multas Pendientes"
              value={estadisticas.multasPendientes}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Multas Pagadas"
              value={estadisticas.multasPagadas}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Multas Anuladas"
              value={estadisticas.multasAnuladas}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="table-actions">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateMulta}
          className="create-button"
        >
          Crear Nueva Multa
        </Button>
      </div>
      
      <Table dataSource={multas} loading={loading} rowKey="id">
        <Column 
          title="Residente" 
          dataIndex="residente" 
          render={(residente) => (
            typeof residente === 'object' ? 
              `${residente.first_name} ${residente.last_name}` : 
              residente
          )}
        />
        <Column title="Motivo" dataIndex="motivo" />
        <Column title="Descripción" dataIndex="descripcion" ellipsis={true} />
        <Column 
          title="Precio" 
          dataIndex="precio" 
          render={(text) => `$${parseFloat(text).toLocaleString('es-CL')}`}
          sorter={(a, b) => a.precio - b.precio}
        />
        <Column 
          title="Estado" 
          dataIndex="estado" 
          render={(estado) => {
            let color = 'volcano';
            if (estado === 'pagada') color = 'green';
            if (estado === 'anulada') color = 'gold';
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
          render={(text, record) => (
            <Button 
              type="primary" 
              danger
              onClick={() => handleAnularMulta(record.id)} 
              disabled={record.estado !== 'pendiente'}
            >
              Anular
            </Button>
          )}
        />
      </Table>
      
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
            <Select placeholder="Seleccione un residente">
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
            <Input placeholder="Ej: Ruido excesivo" />
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
            label="Precio"
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
