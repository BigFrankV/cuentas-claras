import React, { useState, useContext } from 'react';
import { Card, Typography, Form, Input, Button, Select, message, Row, Col } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminRegistro.css';

const { Title } = Typography;
const { Option } = Select;

const AdminRegistro = () => {
  const { user } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/usuarios/', {
        ...values,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      message.success('Usuario registrado exitosamente');
      form.resetFields();
    } catch (error) {
      console.error('Error registrando usuario:', error);
      message.error('Error al registrar usuario. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-registro-container">
      <Title level={2}>Registrar Nuevo Usuario</Title>
      
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card className="registro-card">
            <div className="registro-header">
              <UserAddOutlined className="registro-icon" />
              <h2>Formulario de Registro</h2>
            </div>
            
            <Form
              form={form}
              name="registro"
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ rol: 'residente' }}
            >
              <Form.Item
                name="username"
                label="Nombre de Usuario"
                rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
              >
                <Input placeholder="Ej: jperez" />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Por favor ingrese una contraseña' }]}
              >
                <Input.Password placeholder="Contraseña" />
              </Form.Item>
              
              <Form.Item
                name="first_name"
                label="Nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input placeholder="Ej: Juan" />
              </Form.Item>
              
              <Form.Item
                name="last_name"
                label="Apellido"
                rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
              >
                <Input placeholder="Ej: Pérez" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Por favor ingrese el email' },
                  { type: 'email', message: 'Por favor ingrese un email válido' }
                ]}
              >
                <Input placeholder="Ej: juan.perez@ejemplo.com" />
              </Form.Item>
              
              <Form.Item
                name="rol"
                label="Rol"
                rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
              >
                <Select placeholder="Seleccione un rol">
                  <Option value="admin">Administrador</Option>
                  <Option value="residente">Residente</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="telefono"
                label="Teléfono"
              >
                <Input placeholder="Ej: +56 9 1234 5678" />
              </Form.Item>
              
              <Form.Item
                name="numero_residencia"
                label="N° Residencia"
              >
                <Input placeholder="Ej: 101" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Registrar Usuario
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminRegistro;
