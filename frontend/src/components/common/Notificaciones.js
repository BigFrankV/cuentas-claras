import React, { useState, useEffect, useContext } from 'react';
import { Badge, Dropdown, List, Typography, Button, notification, Spin, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import './Notificaciones.css';

const { Text } = Typography;

const Notificaciones = () => {
  const authContext = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotificaciones();
    }
  }, [open]);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      // En un entorno real, esta sería una llamada a la API para obtener notificaciones
      // Simulamos una respuesta de la API con datos de ejemplo
      const notificacionesEjemplo = [
        {
          id: 1,
          titulo: 'Nuevo gasto común',
          mensaje: 'Se ha generado un nuevo gasto común para el mes de marzo.',
          fecha: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          leida: false,
          tipo: 'info'
        },
        {
          id: 2,
          titulo: 'Recordatorio de pago',
          mensaje: 'El plazo para pagar el gasto común de febrero vence mañana.',
          fecha: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
          leida: false,
          tipo: 'warning'
        },
        {
          id: 3,
          titulo: 'Multa pagada',
          mensaje: 'Su multa por estacionamiento ha sido pagada exitosamente.',
          fecha: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
          leida: true,
          tipo: 'success'
        }
      ];
      
      // Simulamos un retraso de red
      setTimeout(() => {
        setNotificaciones(notificacionesEjemplo);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudieron cargar las notificaciones.',
        placement: 'topRight',
      });
      setLoading(false);
    }
  };

  const marcarComoLeida = (id) => {
    // En un entorno real, esta sería una llamada a la API para marcar como leída
    setNotificaciones(prevState =>
      prevState.map(notif =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const eliminarNotificacion = (id) => {
    // En un entorno real, esta sería una llamada a la API para eliminar
    setNotificaciones(prevState =>
      prevState.filter(notif => notif.id !== id)
    );
  };

  const marcarTodasComoLeidas = () => {
    // En un entorno real, esta sería una llamada a la API para marcar todas como leídas
    setNotificaciones(prevState =>
      prevState.map(notif => ({ ...notif, leida: true }))
    );
  };

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

  const getNotificacionStyle = (tipo) => {
    switch (tipo) {
      case 'warning':
        return { borderLeft: '4px solid #faad14' };
      case 'success':
        return { borderLeft: '4px solid #52c41a' };
      case 'error':
        return { borderLeft: '4px solid #f5222d' };
      case 'info':
      default:
        return { borderLeft: '4px solid #1890ff' };
    }
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

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
                actions={[
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CheckOutlined />} 
                    onClick={() => marcarComoLeida(item.id)}
                    disabled={item.leida}
                  />,
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={() => eliminarNotificacion(item.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={item.titulo}
                  description={
                    <>
                      <div>{item.mensaje}</div>
                      <div className="notificacion-fecha">{formatFecha(item.fecha)}</div>
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
