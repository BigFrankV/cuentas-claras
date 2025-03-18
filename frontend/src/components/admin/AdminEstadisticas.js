import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Divider } from 'antd';
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
      
      // Obtener estadísticas de usuarios
      const usuariosResponse = await axios.get('http://localhost:8000/api/usuarios/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      const admins = usuariosResponse.data.filter(usuario => usuario.rol === 'admin');
      const residentes = usuariosResponse.data.filter(usuario => usuario.rol === 'residente');
      
      // Obtener estadísticas de gastos comunes
      const gastosComunesResponse = await axios.get('http://localhost:8000/api/gastocomun/estadisticas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      // Obtener estadísticas de multas
      const multasResponse = await axios.get('http://localhost:8000/api/multas/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      const multasPendientes = multasResponse.data.filter(multa => multa.estado === 'pendiente');
      const multasPagadas = multasResponse.data.filter(multa => multa.estado === 'pagada');
      const multasAnuladas = multasResponse.data.filter(multa => multa.estado === 'anulada');
      
      const montoPendienteMultas = multasPendientes.reduce((total, multa) => total + parseFloat(multa.precio), 0);
      const montoPagadoMultas = multasPagadas.reduce((total, multa) => total + parseFloat(multa.precio), 0);
      
      setEstadisticas({
        usuarios: {
          total: usuariosResponse.data.length,
          admins: admins.length,
          residentes: residentes.length
        },
        gastoComun: {
          total: gastosComunesResponse.data.total_gastos,
          pendientes: gastosComunesResponse.data.total_pendientes,
          pagados: gastosComunesResponse.data.total_pagados,
          montoPendiente: gastosComunesResponse.data.monto_pendiente,
          montoPagado: gastosComunesResponse.data.monto_pagado
        },
        multas: {
          total: multasResponse.data.length,
          pendientes: multasPendientes.length,
          pagadas: multasPagadas.length,
          anuladas: multasAnuladas.length,
          montoPendiente: montoPendienteMultas,
          montoPagado: montoPagadoMultas
        }
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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
                loading={loading}
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
                loading={loading}
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
                loading={loading}
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
                loading={loading}
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
                loading={loading}
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
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pendiente"
                value={estadisticas.gastoComun.montoPendiente}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
                formatter={value => value.toLocaleString('es-CL')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pagado"
                value={estadisticas.gastoComun.montoPagado}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
                formatter={value => value.toLocaleString('es-CL')}
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
                loading={loading}
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
                loading={loading}
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
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pendiente"
                value={estadisticas.multas.montoPendiente}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
                formatter={value => value.toLocaleString('es-CL')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Monto Pagado"
                value={estadisticas.multas.montoPagado}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="$"
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
                formatter={value => value.toLocaleString('es-CL')}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminEstadisticas;
