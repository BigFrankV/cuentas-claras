import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, Form, Input, Select, InputNumber, DatePicker, message, Space, Drawer } from 'antd';
import { WarningOutlined, PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminMultas.css';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { Column } = Table;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminMultas = () => {
  const { user } = useContext(AuthContext);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detalleDrawerVisible, setDetalleDrawerVisible] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
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
      message.error('No se pudieron cargar las multas. Por favor, intenta nuevamente.');
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
      message.error('No se pudieron cargar los residentes. Por favor, intenta nuevamente.');
    }
  };

  const handleCreateMulta = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditMulta = (multa) => {
    setSelectedMulta(multa);
    editForm.setFieldsValue({
      residente: typeof multa.residente === 'object' ? multa.residente.id : multa.residente,
      motivo: multa.motivo,
      descripcion: multa.descripcion,
      precio: parseFloat(multa.precio)
    });
    setEditModalVisible(true);
  };

  const handleVerDetalle = (multa) => {
    setSelectedMulta(multa);
    setDetalleDrawerVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  const handleDetalleDrawerClose = () => {
    setDetalleDrawerVisible(false);
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
      message.success('Multa creada exitosamente');
      fetchMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error creating multa:', error);
      
      if (error.response && error.response.data) {
        // Mostrar errores específicos del servidor si están disponibles
        const errorMessages = Object.values(error.response.data).flat().join(', ');
        message.error(`Error al crear la multa: ${errorMessages}`);
      } else {
        message.error('Error al crear la multa. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      
      await axios.put(`http://localhost:8000/api/multas/${selectedMulta.id}/`, {
        residente: values.residente,
        motivo: values.motivo,
        descripcion: values.descripcion,
        precio: values.precio,
        estado: selectedMulta.estado // Mantener el estado actual
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      setEditModalVisible(false);
      message.success('Multa actualizada exitosamente');
      fetchMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error updating multa:', error);
      
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat().join(', ');
        message.error(`Error al actualizar la multa: ${errorMessages}`);
      } else {
        message.error('Error al actualizar la multa. Por favor, intenta nuevamente.');
      }
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
    } catch (error) {
      console.error('Error anulando multa:', error);
      
      if (error.response && error.response.data) {
        const errorMessages = typeof error.response.data === 'object' 
          ? Object.values(error.response.data).flat().join(', ')
          : error.response.data;
        message.error(`Error al anular la multa: ${errorMessages}`);
      } else {
        message.error('Error al anular la multa. Por favor, intenta nuevamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getEstadoTag = (estado) => {
    let color = 'volcano';
    if (estado === 'pagada') color = 'green';
    if (estado === 'anulada') color = 'gold';
    return (
      <Tag color={color}>
        {estado.toUpperCase()}
      </Tag>
    );
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
          render={(estado) => getEstadoTag(estado)}
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
            <Space size="small">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleVerDetalle(record)}
              />
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => handleEditMulta(record)}
                disabled={record.estado !== 'pendiente'}
              />
              <Button
                type="primary"
                danger
                onClick={() => handleAnularMulta(record.id)}
                disabled={record.estado !== 'pendiente'}
              >
                Anular
              </Button>
            </Space>
          )}
        />
      </Table>
     
      {/* Modal para crear multa */}
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

      {/* Modal para editar multa */}
      <Modal
        title="Editar Multa"
        visible={editModalVisible}
        onCancel={handleEditModalCancel}
        footer={[
          <Button key="cancel" onClick={handleEditModalCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit}>
            Guardar Cambios
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical">
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

            {/* Drawer para ver detalle de multa */}
            <Drawer
        title="Detalle de la Multa"
        placement="right"
        width={500}
        onClose={handleDetalleDrawerClose}
        open={detalleDrawerVisible}
        extra={
          selectedMulta && selectedMulta.estado === 'pendiente' && (
            <Space>
              <Button type="primary" onClick={() => {
                handleDetalleDrawerClose();
                handleEditMulta(selectedMulta);
              }}>
                Editar
              </Button>
              <Button type="primary" danger onClick={() => {
                handleAnularMulta(selectedMulta.id);
                handleDetalleDrawerClose();
              }}>
                Anular
              </Button>
            </Space>
          )
        }
      >
        {selectedMulta && (
          <div className="multa-detail">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Información de la Multa">
                  <p><strong>ID:</strong> {selectedMulta.id}</p>
                  <p><strong>Estado:</strong> {getEstadoTag(selectedMulta.estado)}</p>
                  <p><strong>Fecha de Creación:</strong> {formatDate(selectedMulta.fecha_creacion)}</p>
                  {selectedMulta.fecha_pago && (
                    <p><strong>Fecha de Pago:</strong> {formatDate(selectedMulta.fecha_pago)}</p>
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Residente">
                  {typeof selectedMulta.residente === 'object' ? (
                    <>
                      <p><strong>Nombre:</strong> {selectedMulta.residente.first_name} {selectedMulta.residente.last_name}</p>
                      <p><strong>Usuario:</strong> {selectedMulta.residente.username}</p>
                      {selectedMulta.residente.email && (
                        <p><strong>Email:</strong> {selectedMulta.residente.email}</p>
                      )}
                    </>
                  ) : (
                    <p>ID de Residente: {selectedMulta.residente}</p>
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Detalles de la Multa">
                  <p><strong>Motivo:</strong> {selectedMulta.motivo}</p>
                  <Divider style={{ margin: '12px 0' }} />
                  <p><strong>Descripción:</strong></p>
                  <div className="descripcion-box">
                    {selectedMulta.descripcion}
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <p><strong>Precio:</strong> ${parseFloat(selectedMulta.precio).toLocaleString('es-CL')}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminMultas;

