import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, message, Spin, Space } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentMultas.css';

const { Column } = Table; 
const { Title, Text } = Typography;
const { confirm } = Modal;

const ResidentMultas = () => {
  const { user } = useContext(AuthContext);
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalPendiente: 0,
    totalPagado: 0,
    cantidadPendiente: 0,
    cantidadPagado: 0
  });

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
    const pagados = datos.filter(multa => multa.estado === 'pagado');
    
    const totalPendiente = pendientes.reduce((sum, multa) => sum + parseFloat(multa.monto), 0);
    const totalPagado = pagados.reduce((sum, multa) => sum + parseFloat(multa.monto), 0);
    
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
          <p><strong>Monto:</strong> ${parseFloat(multa.monto).toLocaleString('es-CL')}</p>
          <p><strong>Fecha:</strong> {formatDate(multa.fecha)}</p>
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
          return { ...multa, estado: 'pagado', fecha_pago: new Date().toISOString() };
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
    return `$${parseFloat(monto).toLocaleString('es-CL')}`;
  };

  return (
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
              dataIndex="monto" 
              key="monto" 
              render={(text) => formatMonto(text)}
              sorter={(a, b) => a.monto - b.monto}
            />
            <Column 
              title="Fecha" 
              dataIndex="fecha" 
              key="fecha" 
              render={(text) => formatDate(text)}
              sorter={(a, b) => new Date(a.fecha) - new Date(b.fecha)}
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
                { text: 'Pagado', value: 'pagado' },
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
  );
};

export default ResidentMultas;