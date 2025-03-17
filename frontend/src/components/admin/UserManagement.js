import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './UserManagement.css';

const { Option } = Select;

const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/usuarios/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      message.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Abrir modal de edición
  const showEditModal = (user) => {
    setCurrentUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      rol: user.rol,
      telefono: user.telefono,
      numero_departamento: user.numero_departamento
    });
    setEditModalVisible(true);
  };

  // Abrir modal de eliminación
  const showDeleteModal = (user) => {
    setCurrentUser(user);
    setDeleteModalVisible(true);
  };

  // Actualizar usuario
  const handleUpdate = async (values) => {
    try {
      await axios.put(`http://localhost:8000/api/usuarios/${currentUser.id}/`, values, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Usuario actualizado correctamente');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      message.error('No se pudo actualizar el usuario');
    }
  };

  // Eliminar usuario
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/usuarios/${currentUser.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Usuario eliminado correctamente');
      setDeleteModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      message.error('No se pudo eliminar el usuario');
    }
  };

  // Columnas para la tabla
  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Nombre',
      key: 'nombre',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (rol) => rol === 'admin' ? 'Administrador' : 'Residente',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Departamento',
      dataIndex: 'numero_departamento',
      key: 'numero_departamento',
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteModal(record)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>Gestión de Usuarios</h1>
        <Link to="/admin/register">
          <Button type="primary" icon={<UserAddOutlined />}>
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal de edición */}
      <Modal
        title="Editar Usuario"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="username"
            label="Nombre de usuario"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
          >
            <Select>
              <Option value="admin">Administrador</Option>
              <Option value="residente">Residente</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="numero_departamento"
            label="Número de Departamento"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Actualizar Usuario
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de eliminación */}
      <Modal
        title="Eliminar Usuario"
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <p>¿Está seguro que desea eliminar al usuario {currentUser?.username}?</p>
        <p>Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};

export default UserManagement;
