import React, { useEffect, useState, useContext } from 'react';
import { Typography, Card, Row, Col, Statistic, Divider, List, Spin, Empty } from 'antd';
import { DollarOutlined, WarningOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentResumen.css';

const { Title, Text, Paragraph } = Typography;

const ResidentResumen = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({
    gastoComun: {
      total: 0,
      pendientes: 0,
      pagados: 0,
      montoPendiente: 0,
      montoPagado: 0,
      proximos: []
    },
    multas: {
      total: 0,
      pendientes: 0,
      pagadas: 0,
      montoPendiente: 0,
      montoPagado: 0
    }
  });

  const fetchResumen = async () => {
    try {
      setLoading(true);
      
      // Obtener gastos comunes
      const gastosComunesResponse = await axios.get('http://localhost:8000/api/gastocomun/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      // Obtener multas
      const multasResponse = await axios.get('http://localhost:8000/api/multas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      procesarDatos(gastosComunesResponse.data, multasResponse.data);
    } catch (error) {
      console.error('Error obteniendo datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const procesarDatos = (gastosComunes, multas) => {
    // Filtrar gastos comunes del usuario
    const gastosUsuario = gastosComunes.filter(gasto => gasto.residente === user.id);
    const gastosPendientes = gastosUsuario.filter(gasto => gasto.estado === 'pendiente');
    const gastosPagados = gastosUsuario.filter(gasto => gasto.estado === 'pagado');
    
    // Calcular montos
    const montoPendienteGastos = gastosPendientes.reduce((total, gasto) => total + parseFloat(gasto.monto), 0);
    const montoPagadoGastos = gastosPagados.reduce((total, gasto) => total + parseFloat(gasto.monto), 0);
    
    // Ordenar gastos pendientes por fecha de vencimiento
    const gastosProximos = [...gastosPendientes].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)).slice(0, 3);
    
    // Filtrar multas del usuario
    const multasUsuario = multas.filter(multa => multa.residente === user.id);
    const multasPendientes = multasUsuario.filter(multa => multa.estado === 'pendiente');
    const multasPagadas = multasUsuario.filter(multa => multa.estado === 'pagada');
    
    // Calcular montos
    const montoPendienteMultas = multasPendientes.reduce((total, multa) => total + parseFloat(multa.precio), 0);
    const montoPagadoMultas = multasPagadas.reduce((total, multa) => total + parseFloat(multa.precio), 0);
    
    setResumen({
      gastoComun: {
        total: gastosUsuario.length,
        pendientes: gastosPendientes.length,
        pagados: gastosPagados.length,
        montoPendiente: montoPendienteGastos,
        montoPagado: montoPagadoGastos,
        proximos: gastosProximos
      },
      multas: {
        total: multasUsuario.length,
        pendientes: multasPendientes.length,
        pagadas: multasPagadas.length,
        montoPendiente: montoPendienteMultas,
        montoPagado: montoPagadoMultas
      }
    });
  };

  useEffect(() => {
    fetchResumen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatMonto = (monto) => {
    return `$${parseFloat(monto).toLocaleString('es-CL')}`;
  };

  return (
    <div className="resident-resumen-container">
      <Title level={2}>Resumen de Pagos</Title>
      <Paragraph className="resumen-descripcion">
        Bienvenido a su resumen de pagos. Aquí puede ver un resumen de sus gastos comunes y multas.
      </Paragraph>
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Cargando resumen...</Text>
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="resumen-cards">
            <Col xs={24} md={12}>
              <Card title="Gastos Comunes" className="resumen-card">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic 
                      title="Pendientes" 
                      value={resumen.gastoComun.pendientes} 
                      prefix={<WarningOutlined />} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Pagados" 
                      value={resumen.gastoComun.pagados} 
                      prefix={<CheckCircleOutlined />} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Monto Pendiente" 
                      value={formatMonto(resumen.gastoComun.montoPendiente)} 
                      prefix={<DollarOutlined />} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Monto Pagado" 
                      value={formatMonto(resumen.gastoComun.montoPagado)} 
                      prefix={<DollarOutlined />} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Multas" className="resumen-card">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic 
                      title="Pendientes" 
                      value={resumen.multas.pendientes} 
                      prefix={<WarningOutlined />} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Pagadas" 
                      value={resumen.multas.pagadas} 
                      prefix={<CheckCircleOutlined />} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Monto Pendiente" 
                      value={formatMonto(resumen.multas.montoPendiente)} 
                      prefix={<DollarOutlined />} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Monto Pagado" 
                      value={formatMonto(resumen.multas.montoPagado)} 
                      prefix={<DollarOutlined />} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          <Divider orientation="left">Próximos Vencimientos</Divider>
          
          {resumen.gastoComun.proximos.length > 0 ? (
            <List
              className="proximos-list"
              itemLayout="horizontal"
              dataSource={resumen.gastoComun.proximos}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined className="calendar-icon" />}
                    title={item.concepto}
                    description={
                      <>
                        <Text>Vence el: {formatFecha(item.fecha_vencimiento)}</Text>
                        <br />
                        <Text strong>{formatMonto(item.monto)}</Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="No tiene gastos comunes pendientes" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default ResidentResumen;
