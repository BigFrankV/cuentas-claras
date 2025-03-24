import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MailOutlined,
  LockOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminProfile.css';

const { Title } = Typography;

const AdminProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(false);

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
        `http://localhost:8000/api/usuarios/${user.id}/`,
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
      
      if (error.response) {
        const errorMessage = error.response.data.detail ||
                           (typeof error.response.data === 'object' && Object.values(error.response.data)[0]) ||
                           'Error al actualizar el perfil';
        message.error(errorMessage);
      } else {
        message.error('Error al actualizar el perfil. Revisa tu conexión a internet.');
      }
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
      
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.detail ||
                           (typeof error.response.data === 'object' && Object.values(error.response.data)[0]) ||
                           'Error al cambiar la contraseña';
        message.error(errorMessage);
      } else {
        message.error('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <Title level={2}>Perfil de Administrador</Title>
      
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
  );
};

export default AdminProfile;
