import React, { useEffect, useState, useContext } from 'react';
import { Table, Typography, Button } from 'antd';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
const { Column } = Table; 
const { Title } = Typography;

const ResidentMultas = () => {
  const { user } = useContext(AuthContext);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/multas/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setFines(response.data);
      } catch (error) {
        console.error('Error fetching fines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFines();
  }, []);

  const handlePay = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/multas/${id}/pagar/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // Refresh fines after payment
      setFines(fines.filter(fine => fine.id !== id));
    } catch (error) {
      console.error('Error paying fine:', error);
    }
  };

  return (
    
    <div>
      <Title level={2}>Mis Multas</Title>
      <Table dataSource={fines} loading={loading} rowKey="id">
        <Column title="Motivo" dataIndex="motivo" />
        <Column title="Descripción" dataIndex="descripcion" />
        <Column title="Precio" dataIndex="precio" />
        <Column title="Estado" dataIndex="estado" />
        <Column
          title="Acciones"
          render={(text, record) => (
            <Button 
              type="primary" 
              onClick={() => handlePay(record.id)} 
              disabled={record.estado !== 'pendiente'}
            >
              Pagar
            </Button>
          )}
        />
      </Table>
    </div>
  );
};

export default ResidentMultas;