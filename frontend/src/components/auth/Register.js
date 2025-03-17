import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Register.css';

const { Title } = Typography;
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Obtener token del localStorage
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setError('No tiene permisos para realizar esta acción. Por favor inicie sesión como administrador.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/usuarios/registro/', {
        username: values.username,
        password: values.password,
        password2: values.confirmPassword,
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        rol: values.rol,
        telefono: values.telefono,
        numero_residencia: values.numeroResidencia
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Usuario registrado exitosamente');
      // Resetear el formulario
      form.resetFields();
    } catch (err) {
      if (err.response && err.response.data) {
        // Mostrar errores específicos del backend
        const errorMessages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(`Error al registrar usuario: ${errorMessages}`);
      } else {
        setError('Error al registrar usuario. Verifique que tiene permisos de administrador.');
      }
      console.error('Error al registrar usuario:', err);
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  return (
    <div className="register-container">
      <Card className="register-card">
        <div className="register-header">
          <Title level={2}>Cuentas Claras</Title>
          <Title level={4}>Registrar Nuevo Usuario</Title>
        </div>
        
        {error && <Alert message={error} type="error" showIcon className="register-alert" />}
        {success && <Alert message={success} type="success" showIcon className="register-alert" />}
        
        <Form
          form={form}
          name="register"
          className="register-form"
          initialValues={{ rol: 'residente' }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Por favor ingrese un nombre de usuario' }]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="Usuario" 
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese un email' },
              { type: 'email', message: 'El email no es válido' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="site-form-item-icon" />} 
              placeholder="Email" 
            />
          </Form.Item>
          
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input 
              placeholder="Nombre" 
            />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
          >
            <Input 
              placeholder="Apellido" 
            />
          </Form.Item>
          
          <Form.Item
            name="telefono"
          >
            <Input 
              prefix={<PhoneOutlined className="site-form-item-icon" />} 
              placeholder="Teléfono" 
            />
          </Form.Item>
          
          <Form.Item
            name="numeroResidencia"
          >
            <Input 
              prefix={<HomeOutlined className="site-form-item-icon" />} 
              placeholder="Número de Residencia" 
            />
          </Form.Item>
          
          <Form.Item
            name="rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
          >
            <Select placeholder="Seleccione un rol">
              <Option value="residente">Residente</Option>
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese una contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Contraseña"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirme la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirmar Contraseña"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="register-form-button" 
              loading={loading}
              block
            >
              Registrar Usuario
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
