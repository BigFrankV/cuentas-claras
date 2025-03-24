import React, { useState, useContext, useEffect } from 'react';
import { Badge, Dropdown, List, Typography, Button, notification, Spin, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Notificaciones.css';

const { Text } = Typography;

const Notificaciones = ({ isAdmin = false }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotificaciones();
    }
  }, [open]);

  // Obtener solo el contador de notificaciones cada 30 segundos
  useEffect(() => {
    if (user) {
      fetchContadorNotificaciones();
      const interval = setInterval(fetchContadorNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Función para formatear fechas de forma relativa
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferencia = ahora - fecha;
     
    // Menos de 1 hora
    if (diferencia < 3600000) {
      const minutos = Math.floor(diferencia / 60000);
      return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }
    // Menos de 1 día
    else if (diferencia < 86400000) {
      const horas = Math.floor(diferencia / 3600000);
      return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    // Menos de 7 días
    else if (diferencia < 604800000) {
      const dias = Math.floor(diferencia / 86400000);
      return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }
    // Más de 7 días
    else {
      return fecha.toLocaleDateString('es-CL');
    }
  };

  // Nuevo método para obtener solo el contador
  const fetchContadorNotificaciones = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/notificaciones/contador/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotificacionesNoLeidas(response.data.no_leidas);
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
    }
  };

  const fetchNotificaciones = async (showLoading = true) => {
    if (!user) return;
   
    try {
      if (showLoading) {
        setLoading(true);
      }
     
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/notificaciones/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     
      setNotificaciones(response.data);
      // También actualizar el contador cuando se cargan las notificaciones completas
      setNotificacionesNoLeidas(response.data.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      if (showLoading) {
        notification.error({
          message: 'Error',
          description: 'No se pudieron cargar las notificaciones.',
          placement: 'topRight',
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const marcarComoLeida = async (id, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el click se propague al item
    }
   
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/notificaciones/${id}/marcar_como_leida/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     
      // Actualizar estado local
      setNotificaciones(prevState =>
        prevState.map(notif =>
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );
      setNotificacionesNoLeidas(prev => prev > 0 ? prev - 1 : 0);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudo marcar la notificación como leída.',
        placement: 'topRight',
      });
    }
  };

  const eliminarNotificacion = async (id, event) => {
    if (event) {
      event.stopPropagation(); // Evitar que el click se propague al item
    }
   
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.REACT_APP_API_URL || ''}/api/notificaciones/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     
      // Actualizar estado local
      const notifEliminada = notificaciones.find(n => n.id === id);
      setNotificaciones(prevState => prevState.filter(notif => notif.id !== id));
      
      // Si la notificación eliminada no estaba leída, actualizar el contador
      if (notifEliminada && !notifEliminada.leida) {
        setNotificacionesNoLeidas(prev => prev > 0 ? prev - 1 : 0);
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudo eliminar la notificación.',
        placement: 'topRight',
      });
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/notificaciones/marcar_como_leidas/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
     
      // Actualizar estado local
      setNotificaciones(prevState =>
        prevState.map(notif => ({ ...notif, leida: true }))
      );
      setNotificacionesNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudieron marcar todas las notificaciones como leídas.',
        placement: 'topRight',
      });
    }
  };

  const handleNotificacionClick = (notificacion) => {
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id);
    }
   
    // Navegar según el tipo y objeto_tipo de notificación
    const basePath = isAdmin ? '/admin' : '/resident';
   
    // Primero intentar navegar según objeto_tipo si existe
    if (notificacion.objeto_tipo === 'multa') {
      navigate(`${basePath}/multas`);
    } else if (notificacion.objeto_tipo === 'gasto_comun') {
      navigate(`${basePath}/gastocomun`);
    } 
    // Si no hay objeto_tipo o no es reconocido, usar el tipo
    else if (notificacion.tipo.includes('multa')) {
      navigate(`${basePath}/multas`);
    } else if (notificacion.tipo.includes('gasto')) {
      navigate(`${basePath}/gastocomun`);
    } else if (notificacion.tipo.includes('usuario')) {
      navigate(isAdmin ? `${basePath}/residentes` : `${basePath}/profile`);
    } else if (notificacion.tipo.includes('configuracion')) {
      navigate(`${basePath}/configuracion`);
    } else {
      // Para otros tipos, ir al dashboard
      navigate(basePath);
    }
   
    setOpen(false);
  };

  const getNotificacionStyle = (tipo) => {
    // Mapeo de tipos de notificaciones del backend a estilos visuales
    if (tipo.includes('multa_creada') || tipo.includes('multa_pendiente')) {
      return { borderLeft: '4px solid #faad14' }; // Amarillo para multas
    } else if (tipo.includes('pagado') || tipo.includes('aprobado') || tipo.includes('exito')) {
      return { borderLeft: '4px solid #52c41a' }; // Verde para éxitos
    } else if (tipo.includes('gasto_vencido') || tipo.includes('error') || tipo.includes('rechazado') || tipo.includes('anulada')) {
      return { borderLeft: '4px solid #f5222d' }; // Rojo para errores/urgentes
    } else if (tipo.includes('gasto_creado') || tipo.includes('informacion')) {
      return { borderLeft: '4px solid #1890ff' }; // Azul para info
    } else {
      return { borderLeft: '4px solid #722ed1' }; // Morado para otros
    }
  };

  const menu = (
    <div className="notificaciones-dropdown">
      <div className="notificaciones-header">
        <Text strong>Notificaciones</Text>
        {notificacionesNoLeidas > 0 && (
          <Button
            type="link"
            size="small"
            onClick={marcarTodasComoLeidas}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>
     
      <div className="notificaciones-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="small" />
            <Text>Cargando notificaciones...</Text>
          </div>
        ) : notificaciones.length === 0 ? (
          <Empty
            description="No tienes notificaciones"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notificaciones}
            renderItem={item => (
              <List.Item
                className={`notificacion-item ${!item.leida ? 'no-leida' : ''}`}
                style={getNotificacionStyle(item.tipo)}
                onClick={() => handleNotificacionClick(item)}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => marcarComoLeida(item.id, e)}
                    disabled={item.leida}
                  />,
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => eliminarNotificacion(item.id, e)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={item.titulo}
                  description={
                    <>
                      <div>{item.mensaje}</div>
                      <div className="notificacion-fecha">
                        {/* Usar tiempo_relativo del backend, con fallback a formatFecha */}
                        {item.tiempo_relativo || formatFecha(item.fecha_creacion || item.fecha)}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow
    >
      <Badge count={notificacionesNoLeidas} overflowCount={9}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className="notificaciones-button"
        />
      </Badge>
    </Dropdown>
  );
};

export default Notificaciones;
