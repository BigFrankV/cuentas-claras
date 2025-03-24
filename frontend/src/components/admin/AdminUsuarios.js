import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button, Tag, Card, Statistic, Row, Col, Modal, Form, Input, Select, message } from 'antd';

import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminUsuarios.css';

const { Column } = Table;
const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

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
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/usuarios/estadisticas/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      setEstadisticas({
        totalUsuarios: response.data.total_usuarios,
        totalAdmins: response.data.total_admins,
        totalResidentes: response.data.total_residentes
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
      message.error('Error al cargar las estadísticas de usuarios');
    }
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/usuarios/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      message.error('Error al cargar la lista de usuarios');
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

  const confirmDelete = (id) => {
    confirm({
      title: '¿Estás seguro de eliminar este usuario?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        handleDeleteUsuario(id);
      }
    });
  };

  const handleDeleteUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/usuarios/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      message.success('Usuario eliminado exitosamente');
      fetchUsuarios();
      fetchEstadisticas();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      message.error('Error al eliminar el usuario');
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
        await axios.put(`http://localhost:8000/api/usuarios/${selectedUser.id}/`, values, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        message.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await axios.post('http://localhost:8000/api/usuarios/registro/', {
          ...values,
          password2: values.password  // Django requiere password2 para la validación
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        message.success('Usuario creado exitosamente');
      }
      
      setModalVisible(false);
      fetchUsuarios();
      fetchEstadisticas();
    } catch (error) {
      console.error('Error saving usuario:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Error al guardar el usuario';
        
        // Mostrar errores específicos si están disponibles
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          errorMessage = `Error: ${errors}`;
        }
        
        message.error(errorMessage);
      } else {
        message.error('Error al guardar el usuario');
      }
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
                onClick={() => confirmDelete(record.id)}
                disabled={record.id === user?.id} // No permitir eliminar al usuario actual
              />
            </div>
          )}
        />
      </Table>
      
      <Modal
        title={editMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
        open={modalVisible}
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
