import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Switch, Button, Tabs, message, Divider } from 'antd';
import { SaveOutlined, DollarOutlined, BellOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;

const AdminConfiguracion = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Aquí podrías cargar configuraciones guardadas previamente
  useEffect(() => {
    // Simulamos cargar configuraciones por defecto
    form.setFieldsValue({
      diasVencimiento: 30,
      montoMultaRetraso: 5000,
      enviarNotificaciones: true,
      diasAntesNotificar: 5,
      nombreCondominio: "Residencial Cuentas Claras",
      direccionCondominio: "Av. Principal 123",
      administradorPrincipal: "Juan Pérez"
    });
  }, [form]);

  const onFinish = (values) => {
    setLoading(true);
    
    // Aquí implementarías el guardado real en backend
    setTimeout(() => {
      console.log('Configuraciones guardadas:', values);
      message.success('Configuraciones guardadas con éxito');
      setLoading(false);
      
      // Aquí podrías actualizar variables globales o context
      // que afecten el comportamiento de la aplicación
    }, 1000);
  };

  return (
    <div className="config-container">
      <Card title="Configuración del Sistema" className="config-card">
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><DollarOutlined /> Facturación</span>} key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item 
                label="Días de vencimiento para gastos comunes" 
                name="diasVencimiento"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={60} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item 
                label="Monto de multa por retraso (CLP)" 
                name="montoMultaRetraso"
                rules={[{ required: true }]}
              >
                <InputNumber 
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={value => value.replace(/\$\s?|(\.*)/g, '')}
                  style={{ width: '100%' }} 
                />
              </Form.Item>
              
              <Divider />
              
              <Form.Item 
                label="Activar notificaciones automáticas" 
                name="enviarNotificaciones"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="Días antes para notificar vencimientos" 
                name="diasAntesNotificar"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={15} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  loading={loading} 
                  htmlType="submit"
                >
                  Guardar Configuración
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab={<span><HomeOutlined /> Condominio</span>} key="2">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item 
                label="Nombre del Condominio" 
                name="nombreCondominio"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item 
                label="Dirección" 
                name="direccionCondominio"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item 
                label="Administrador Principal" 
                name="administradorPrincipal"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  loading={loading} 
                  htmlType="submit"
                >
                  Guardar Configuración
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminConfiguracion;




