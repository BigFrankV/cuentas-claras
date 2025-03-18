import React from 'react';
import { Typography, Card, Collapse, Divider, Button } from 'antd';
import { QuestionCircleOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import './ResidentAyuda.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ResidentAyuda = () => {
  return (
    <div className="ayuda-container">
      <Title level={2}>Centro de Ayuda</Title>
      
      <div className="ayuda-section">
        <Title level={4}>Preguntas Frecuentes</Title>
        <Collapse defaultActiveKey={['1']} className="faq-collapse">
          <Panel 
            header="¿Cómo puedo pagar mis gastos comunes?" 
            key="1"
            className="faq-panel"
          >
            <Paragraph>
              Para pagar sus gastos comunes, debe seguir estos pasos:
              <ol>
                <li>Ingresar a la sección "Gastos Comunes" desde el menú principal.</li>
                <li>Seleccionar el gasto común que desea pagar.</li>
                <li>Hacer clic en el botón "Pagar".</li>
                <li>Completar la información de pago solicitada.</li>
                <li>Confirmar el pago.</li>
              </ol>
              Una vez realizado el pago, el estado del gasto común cambiará a "Pagado" y se registrará la fecha de pago.
            </Paragraph>
          </Panel>
          
          <Panel 
            header="¿Cómo puedo ver mis multas pendientes?" 
            key="2"
            className="faq-panel"
          >
            <Paragraph>
              Para ver sus multas pendientes, debe seguir estos pasos:
              <ol>
                <li>Ingresar a la sección "Mis Multas" desde el menú principal.</li>
                <li>En esta sección podrá ver todas sus multas, tanto pendientes como pagadas.</li>
                <li>Las multas pendientes aparecerán con un estado "Pendiente" en color rojo.</li>
              </ol>
              Desde esta misma sección podrá realizar el pago de sus multas pendientes.
            </Paragraph>
          </Panel>
          
          <Panel 
            header="¿Cómo puedo actualizar mi información personal?" 
            key="3"
            className="faq-panel"
          >
            <Paragraph>
              Para actualizar su información personal, debe seguir estos pasos:
              <ol>
                <li>Ingresar a la sección "Mi Perfil" desde el menú principal.</li>
                <li>En esta sección podrá ver su información personal actual.</li>
                <li>Haga clic en el botón "Editar Perfil" para modificar su información.</li>
                <li>Actualice los campos que desee cambiar.</li>
                <li>Haga clic en "Guardar Cambios" para confirmar las modificaciones.</li>
              </ol>
              Recuerde que algunos datos solo pueden ser modificados por la administración.
            </Paragraph>
          </Panel>
          
          <Panel 
            header="¿Cómo puedo cambiar mi contraseña?" 
            key="4"
            className="faq-panel"
          >
            <Paragraph>
              Para cambiar su contraseña, debe seguir estos pasos:
              <ol>
                <li>Ingresar a la sección "Mi Perfil" desde el menú principal.</li>
                <li>Haga clic en el botón "Cambiar Contraseña".</li>
                <li>Ingrese su contraseña actual.</li>
                <li>Ingrese su nueva contraseña y confírmela.</li>
                <li>Haga clic en "Guardar Cambios" para confirmar la nueva contraseña.</li>
              </ol>
              Por seguridad, le recomendamos utilizar una contraseña segura que incluya letras, números y símbolos.
            </Paragraph>
          </Panel>
          
          <Panel 
            header="¿Qué debo hacer si tengo problemas para iniciar sesión?" 
            key="5"
            className="faq-panel"
          >
            <Paragraph>
              Si tiene problemas para iniciar sesión, le recomendamos lo siguiente:
              <ol>
                <li>Verificar que está ingresando correctamente su nombre de usuario y contraseña.</li>
                <li>Comprobar que las mayúsculas y minúsculas sean correctas.</li>
                <li>Si ha olvidado su contraseña, contacte a la administración para restablecerla.</li>
                <li>Si continúa teniendo problemas, contacte al soporte técnico mediante los datos de contacto que aparecen en esta página.</li>
              </ol>
            </Paragraph>
          </Panel>
        </Collapse>
      </div>
      
      <Divider />
      
      <div className="ayuda-section">
        <Title level={4}>Contacto</Title>
        <div className="contacto-cards">
          <Card className="contacto-card">
            <PhoneOutlined className="contacto-icon" />
            <Title level={5}>Teléfono</Title>
            <Paragraph>+56 2 2123 4567</Paragraph>
            <Paragraph className="horario">Lunes a Viernes: 9:00 - 18:00</Paragraph>
          </Card>
          
          <Card className="contacto-card">
            <MailOutlined className="contacto-icon" />
            <Title level={5}>Correo Electrónico</Title>
            <Paragraph>soporte@cuentasclaras.cl</Paragraph>
            <Paragraph className="horario">Respuesta en 24-48 horas hábiles</Paragraph>
          </Card>
        </div>
      </div>
      
      <Divider />
      
      <div className="ayuda-section">
        <Title level={4}>Soporte Técnico</Title>
        <Card className="soporte-card">
          <Paragraph>
            Si necesita ayuda técnica con la plataforma, puede contactar a nuestro equipo de soporte técnico mediante el siguiente formulario:
          </Paragraph>
          <Button type="primary" size="large" icon={<QuestionCircleOutlined />} className="soporte-button">
            Solicitar Soporte Técnico
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ResidentAyuda;
