import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Modal, Form, Input, Select, Divider } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminUsuarios.css';

const { Column } = Table; 
const { Title } = Typography;
const { Option } = Select;

const AdminUsuarios = () => {
  const { user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalAdmins: 0,
    totalResidentes: 0
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/usuarios/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setUsuarios(response.data);
      
      // Calcular estadísticas
      const admins = response.data.filter(usuario => usuario.rol === 'admin');
      const residentes = response.data.filter(usuario => usuario.rol === 'residente');
      
      setEstadisticas({
        totalUsuarios: response.data.length,
        totalAdmins: admins.length,
        totalResidentes: residentes.length
      });
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = () => {
    setEditMode(false);
    setSelectedUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUsuario = (usuario) => {
    setEditMode(true);
    setSelectedUser(usuario);
    form.setFieldsValue({
      username: usuario.username,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      email: usuario.email,
      rol: usuario.rol,
      telefono: usuario.telefono,
      numero_residencia: usuario.numero_residencia
    });
    setModalVisible(true);
  };

  const handleDeleteUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/usuarios/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      fetchUsuarios(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editMode && selectedUser) {
        // Actualizar usuario existente
        await axios.put(`http://localhost:8000/api/usuarios/${selectedUser.id}/`, {
          ...values,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } else {
        // Crear nuevo usuario
        await axios.post('http://localhost:8000/api/usuarios/', {
          ...values,
          password: values.password
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      }
      
      setModalVisible(false);
      fetchUsuarios(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  return (
    <div className="admin-usuarios-container">
      <Title level={2}>Gestión de Usuarios</Title>
      
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Usuarios"
              value={estadisticas.totalUsuarios}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Administradores"
              value={estadisticas.totalAdmins}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Residentes"
              value={estadisticas.totalResidentes}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="table-actions">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateUsuario}
          className="create-button"
        >
          Crear Nuevo Usuario
        </Button>
      </div>
      
      <Table dataSource={usuarios} loading={loading} rowKey="id">
        <Column title="Username" dataIndex="username" />
        <Column 
          title="Nombre" 
          render={(text, record) => `${record.first_name} ${record.last_name}`}
        />
        <Column title="Email" dataIndex="email" />
        <Column 
          title="Rol" 
          dataIndex="rol" 
          render={(rol) => (
            <Tag color={rol === 'admin' ? 'purple' : 'blue'}>
              {rol === 'admin' ? 'Administrador' : 'Residente'}
            </Tag>
          )}
          filters={[
            { text: 'Administrador', value: 'admin' },
            { text: 'Residente', value: 'residente' },
          ]}
          onFilter={(value, record) => record.rol === value}
        />
        <Column title="Teléfono" dataIndex="telefono" />
        <Column title="N° Residencia" dataIndex="numero_residencia" />
        <Column
          title="Acciones"
          render={(text, record) => (
            <div>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => handleEditUsuario(record)}
                style={{ marginRight: '8px' }}
              />
              <Button 
                type="primary" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteUsuario(record.id)}
                disabled={record.id === user?.id} // No permitir eliminar al usuario actual
              />
            </div>
          )}
        />
      </Table>
      
      <Modal
        title={editMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalSubmit}>
            {editMode ? "Actualizar" : "Crear"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Nombre de Usuario"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="Ej: jperez" />
          </Form.Item>
          
          {!editMode && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: 'Por favor ingrese una contraseña' }]}
            >
              <Input.Password placeholder="Contraseña" />
            </Form.Item>
          )}
          
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
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsuarios;
