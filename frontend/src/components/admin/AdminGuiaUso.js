import React, { useState } from 'react';
import { Card, Collapse, Typography, Steps, Divider, Alert, Button, Tabs, Input } from 'antd';
import { 
  UserOutlined, DollarOutlined, WarningOutlined, 
  QuestionCircleOutlined, FileTextOutlined, SearchOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;
const { TabPane } = Tabs;

const AdminGuiaUso = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="guia-container">
      <Card className="guia-card">
        <Title level={2}>Centro de Ayuda - Cuentas Claras</Title>
        
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={<span><QuestionCircleOutlined /> Guía rápida</span>} 
            key="1"
          >
            <Alert
              message="¡Bienvenido a Cuentas Claras!"
              description="Esta guía te ayudará a entender cómo usar nuestro sistema."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            
            <Steps current={current} onChange={setCurrent} direction="vertical">
              <Step 
                title="Gestión de Usuarios" 
                description="Administra residentes y administradores del condominio."
                icon={<UserOutlined />}
              />
              <Step 
                title="Gastos Comunes" 
                description="Genera y administra los gastos comunes mensuales."
                icon={<DollarOutlined />}
              />
              <Step 
                title="Sistema de Multas" 
                description="Gestiona las multas por infracciones."
                icon={<WarningOutlined />}
              />
            </Steps>
            
            <Divider />
            
            <div className="step-content">
              {current === 0 && (
                <div>
                  <Title level={4}>Gestión de Usuarios</Title>
                  <Paragraph>
                    <Text strong>Para agregar un nuevo usuario:</Text>
                    <ul>
                      <li>Ve a la sección "Usuarios" en el menú</li>
                      <li>Haz clic en "Registrar Usuario"</li>
                      <li>Completa todos los campos requeridos</li>
                      <li>Selecciona el rol apropiado (Residente o Administrador)</li>
                      <li>Guarda los cambios</li>
                    </ul>
                  </Paragraph>
                </div>
              )}
              {current === 1 && (
                <div>
                  <Title level={4}>Gastos Comunes</Title>
                  <Paragraph>
                    <Text strong>Para generar gastos comunes:</Text>
                    <ul>
                      <li>Accede a la sección "Gastos Comunes"</li>
                      <li>Haz clic en "Crear Gasto Común"</li>
                      <li>Selecciona al residente</li>
                      <li>Ingresa concepto, monto y fechas correspondientes</li>
                      <li>Confirma la creación</li>
                    </ul>
                  </Paragraph>
                </div>
              )}
              {current === 2 && (
                <div>
                  <Title level={4}>Sistema de Multas</Title>
                  <Paragraph>
                    <Text strong>Para registrar una multa:</Text>
                    <ul>
                      <li>Ve a la sección "Multas"</li>
                      <li>Selecciona "Crear Multa"</li>
                      <li>Selecciona al residente</li>
                      <li>Ingresa el motivo de la multa y el monto</li>
                      <li>Confirma la multa</li>
                    </ul>
                  </Paragraph>
                </div>
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span><FileTextOutlined /> Documentación</span>} 
            key="2"
          >
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Manual para Administradores" key="1">
                <Paragraph>
                  Como administrador del sistema, tienes acceso a todas las funcionalidades:
                  <ul>
                    <li>Gestión completa de usuarios</li>
                    <li>Creación y edición de gastos comunes</li>
                    <li>Registro de multas y sanciones</li>
                    <li>Visualización de reportes y estadísticas</li>
                  </ul>
                </Paragraph>
              </Panel>
              <Panel header="Manual para Residentes" key="2">
                <Paragraph>
                  Como residente, puedes acceder a:
                  <ul>
                    <li>Visualizar tus gastos comunes</li>
                    <li>Ver el estado de tus pagos</li>
                    <li>Revisar multas asociadas a tu vivienda</li>
                    <li>Actualizar tu información personal</li>
                  </ul>
                </Paragraph>
              </Panel>
              <Panel header="Preguntas Frecuentes" key="3">
                <Paragraph>
                  <Text strong>¿Cómo recupero mi contraseña?</Text><br/>
                  Contacta al administrador para restablecer tu contraseña.<br/><br/>
                  
                  <Text strong>¿Cómo actualizo mi información de contacto?</Text><br/>
                  Ve a tu perfil y haz clic en "Editar perfil".<br/><br/>
                  
                  <Text strong>¿Cómo reporto un problema técnico?</Text><br/>
                  Contacta al administrador mediante el formulario de contacto.
                </Paragraph>
              </Panel>
            </Collapse>
          </TabPane>
          
          <TabPane 
            tab={<span><SearchOutlined /> Buscador</span>} 
            key="3"
          >
            <div className="search-help">
              <Title level={4}>Buscar ayuda</Title>
              <Paragraph>
                Ingresa palabras clave para encontrar rápidamente la ayuda que necesitas.
              </Paragraph>
              <Input.Search 
                placeholder="Ej: gastos comunes, multas, usuarios..." 
                enterButton="Buscar"
                size="large" 
                onSearch={value => console.log(value)} 
              />
              
              <Divider>Resultados populares</Divider>
              
              <Button type="link">Cómo pagar un gasto común</Button><br/>
              <Button type="link">Cómo registrar un nuevo residente</Button><br/>
              <Button type="link">Cómo ver mis multas pendientes</Button><br/>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminGuiaUso;
