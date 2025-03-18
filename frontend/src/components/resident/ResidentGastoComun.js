import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Divider, Modal, message, Spin, Space, Alert } from 'antd';
import { DollarOutlined, ExclamationCircleOutlined, CheckCircleOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentGastoComun.css';

const { Column } = Table; 
const { Title, Text } = Typography;
const { confirm } = Modal;

const ResidentGastoComun = () => {
  const { user } = useContext(AuthContext);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalPendiente: 0,
    totalPagado: 0,
    cantidadPendiente: 0,
    cantidadPagado: 0
  });

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
  );
};

export default ResidentGastoComun;
