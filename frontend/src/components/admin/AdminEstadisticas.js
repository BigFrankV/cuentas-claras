import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Divider, message, Spin } from 'antd';
import { DollarOutlined, UserOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import './AdminEstadisticas.css';

const { Title } = Typography;

const AdminEstadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    usuarios: {
      total: 0,
      admins: 0,
      residentes: 0
    },
    gastoComun: {
      total: 0,
      pendientes: 0,
      pagados: 0,
      montoPendiente: 0,
      montoPagado: 0
    },
    multas: {
      total: 0,
      pendientes: 0,
      pagadas: 0,
      anuladas: 0,
      montoPendiente: 0,
      montoPagado: 0
    }
  });

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Usar los endpoints específicos de estadísticas para cada módulo
      
      // Obtener estadísticas de usuarios
      const usuariosResponse = await axios.get('http://localhost:8000/api/usuarios/estadisticas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      // Obtener estadísticas de gastos comunes
      const gastosComunesResponse = await axios.get('http://localhost:8000/api/gastocomun/estadisticas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      // Obtener estadísticas de multas
      const multasResponse = await axios.get('http://localhost:8000/api/multas/estadisticas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      setEstadisticas({
        usuarios: {
          total: usuariosResponse.data.total_usuarios,
          admins: usuariosResponse.data.total_admins,
          residentes: usuariosResponse.data.total_residentes
        },
        gastoComun: {
          total: gastosComunesResponse.data.total_gastos,
          pendientes: gastosComunesResponse.data.total_pendientes,
          pagados: gastosComunesResponse.data.total_pagados,
          montoPendiente: gastosComunesResponse.data.monto_pendiente,
          montoPagado: gastosComunesResponse.data.monto_pagado
        },
        multas: {
          total: multasResponse.data.total_multas,
          pendientes: multasResponse.data.total_pendientes,
          pagadas: multasResponse.data.total_pagadas,
          anuladas: multasResponse.data.total_anuladas,
          montoPendiente: multasResponse.data.monto_pendiente,
          montoPagado: multasResponse.data.monto_pagado
        }
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
      message.error('Error al cargar las estadísticas. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear montos con separador de miles
  const formatMonto = (monto) => {
    if (!monto && monto !== 0) return '0';
    return parseFloat(monto).toLocaleString('es-CL');
  };

  // Componente de carga
  if (loading) {
    return (
      <div className="admin-estadisticas-container">
        <Title level={2}>Estadísticas Generales</Title>
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-estadisticas-container">
      <Title level={2}>Estadísticas Generales</Title>
      
      <div className="estadisticas-section">
        <Title level={4}>Usuarios</Title>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="Total Usuarios"
                value={estadisticas.usuarios.total}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="Administradores"
                value={estadisticas.usuarios.admins}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="Residentes"
                value={estadisticas.usuarios.residentes}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      <Divider />
      
      <div className="estadisticas-section">
        <Title level={4}>Gastos Comunes</Title>
        <Row gutter={16}>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Total Gastos"
                value={estadisticas.gastoComun.total}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Pendientes"
                value={estadisticas.gastoComun.pendientes}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Pagados"
                value={estadisticas.gastoComun.pagados}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pendiente"
                value={formatMonto(estadisticas.gastoComun.montoPendiente)}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pagado"
                value={formatMonto(estadisticas.gastoComun.montoPagado)}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      <Divider />
      
      <div className="estadisticas-section">
        <Title level={4}>Multas</Title>
        <Row gutter={16}>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Total Multas"
                value={estadisticas.multas.total}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Pendientes"
                value={estadisticas.multas.pendientes}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Card className="stat-card">
              <Statistic
                title="Pagadas"
                value={estadisticas.multas.pagadas}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pendiente"
                value={formatMonto(estadisticas.multas.montoPendiente)}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pagado"
                value={formatMonto(estadisticas.multas.montoPagado)}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminEstadisticas;
