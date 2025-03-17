import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Login.css';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: values.username,
        password: values.password,
      });
      
      // Guardar tokens en localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      // Actualizar estado global de autenticación
      setToken(response.data.access);
      
      // Obtener información del usuario
      const userResponse = await axios.get('http://localhost:8000/api/usuarios/perfil/', {
        headers: {
          'Authorization': `Bearer ${response.data.access}`
        }
      });
      
      // Guardar información del usuario en el contexto
      setUser(userResponse.data);
      
      // Redireccionar según el rol del usuario
      if (userResponse.data.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/resident');
      }
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>Cuentas Claras</Title>
          <Title level={4}>Iniciar Sesión</Title>
        </div>
        
        {error && <Alert message={error} type="error" showIcon className="login-alert" />}
        
        <Form
          name="login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Por favor ingrese su nombre de usuario!' }]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="Usuario" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="login-form-button" 
              loading={loading}
              size="large"
              block
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
