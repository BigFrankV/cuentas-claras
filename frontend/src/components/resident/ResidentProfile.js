import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message, Layout, Menu } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MailOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './ResidentProfile.css';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ResidentProfile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(window.innerWidth < 768);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);

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
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        telefono: user.telefono || '',
        numero_residencia: user.numero_residencia || ''
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.patch(
        'http://localhost:8000/api/usuarios/actualizar-perfil/',
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      setUser({ ...user, ...response.data });
      message.success('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      message.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setPasswordLoading(true);
    try {
      await axios.post(
        'http://localhost:8000/api/usuarios/cambiar-password/',
        {
          old_password: values.old_password,
          new_password: values.new_password
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      message.success('Contraseña actualizada correctamente');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      message.error('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout className="resident-layout">
      <Header className="resident-header">
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
          className="resident-sider"
          collapsible
          collapsed={collapsed}
          trigger={null}
          breakpoint="lg"
          collapsedWidth={mobileView ? 0 : 80}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['4']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/resident')}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<DollarOutlined />} onClick={() => navigate('/resident/gastocomun')}>
              Gastos Comunes
            </Menu.Item>
            <Menu.Item key="3" icon={<WarningOutlined />} onClick={() => navigate('/resident/multas')}>
              Mis Multas
            </Menu.Item>
            <Menu.Item key="4" icon={<UserOutlined />} onClick={() => navigate('/resident/profile')}>
              Mi Perfil
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="resident-content"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div className="profile-container">
              <Title level={2}>Mi Perfil</Title>
             
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Card
                    title="Información Personal"
                    extra={!editing ? (
                      <Button type="primary" onClick={() => setEditing(true)}>Editar</Button>
                    ) : null}
                    className="profile-card"
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                      disabled={!editing}
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="first_name"
                            label="Nombre"
                            rules={[{ required: true, message: 'Por favor ingresa tu nombre' }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Nombre" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="last_name"
                            label="Apellido"
                            rules={[{ required: true, message: 'Por favor ingresa tu apellido' }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Apellido" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="email"
                        label="Correo Electrónico"
                        rules={[
                          { required: true, message: 'Por favor ingresa tu correo electrónico' },
                          { type: 'email', message: 'Ingresa un correo electrónico válido' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Correo Electrónico" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="telefono"
                            label="Teléfono"
                          >
                            <Input prefix={<PhoneOutlined />} placeholder="Teléfono" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="numero_residencia"
                            label="Número de Residencia"
                          >
                            <Input prefix={<HomeOutlined />} placeholder="Número de Residencia" />
                          </Form.Item>
                        </Col>
                      </Row>

                      {editing && (
                        <Form.Item>
                          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            Guardar Cambios
                          </Button>
                          <Button onClick={() => setEditing(false)}>
                            Cancelar
                          </Button>
                        </Form.Item>
                      )}
                    </Form>
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card title="Cambiar Contraseña" className="profile-card">
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handlePasswordChange}
                    >
                      <Form.Item
                        name="old_password"
                        label="Contraseña Actual"
                        rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Contraseña Actual" />
                      </Form.Item>

                      <Form.Item
                        name="new_password"
                        label="Nueva Contraseña"
                        rules={[{ required: true, message: 'Por favor ingresa tu nueva contraseña' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Nueva Contraseña" />
                      </Form.Item>

                      <Form.Item
                        name="confirm_password"
                        label="Confirmar Contraseña"
                        dependencies={['new_password']}
                        rules={[
                          { required: true, message: 'Por favor confirma tu nueva contraseña' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('new_password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Las contraseñas no coinciden'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Contraseña" />
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit" loading={passwordLoading} block>
                          Cambiar Contraseña
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card title="Información de la Cuenta" className="profile-card" style={{ marginTop: 16 }}>
                    <p><strong>Usuario:</strong> {user?.username}</p>
                    <p><strong>Rol:</strong> {user?.rol === 'residente' ? 'Residente' : 'Administrador'}</p>
                    <p><strong>Fecha de registro:</strong> {new Date(user?.date_joined).toLocaleDateString('es-ES')}</p>
                  </Card>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ResidentProfile;
