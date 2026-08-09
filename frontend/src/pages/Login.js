import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import { FaServer, FaDatabase, FaCode, FaNetworkWired, FaMicrochip, FaTerminal, FaCog, FaFolder, FaCloud, FaLaptopCode } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/mis-manuales');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #0b1d36 0%, #16324f 45%, #0d2138 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,184,255,0.15) 0%, rgba(77,184,255,0) 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-8%', width: '600px', height: '600px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,153,255,0.12) 0%, rgba(0,153,255,0) 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute', top: '18%', left: '12%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.12)', fontSize: '3.2rem'
      }}><FaServer /></div>
      <div style={{
        position: 'absolute', top: '12%', right: '14%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.12)', fontSize: '3rem'
      }}><FaCode /></div>
      <div style={{
        position: 'absolute', bottom: '20%', left: '10%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.12)', fontSize: '2.8rem'
      }}><FaDatabase /></div>
      <div style={{
        position: 'absolute', bottom: '14%', right: '12%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.12)', fontSize: '3rem'
      }}><FaMicrochip /></div>
      <div style={{
        position: 'absolute', top: '38%', left: '6%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.10)', fontSize: '2.2rem'
      }}><FaTerminal /></div>
      <div style={{
        position: 'absolute', top: '42%', right: '7%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.10)', fontSize: '2.4rem'
      }}><FaNetworkWired /></div>
      <div style={{
        position: 'absolute', top: '24%', left: '30%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.10)', fontSize: '2rem'
      }}><FaCog /></div>
      <div style={{
        position: 'absolute', bottom: '30%', right: '30%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.10)', fontSize: '2.2rem'
      }}><FaFolder /></div>
      <div style={{
        position: 'absolute', top: '10%', left: '45%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.08)', fontSize: '1.8rem'
      }}><FaCloud /></div>
      <div style={{
        position: 'absolute', bottom: '10%', left: '42%', pointerEvents: 'none',
        color: 'rgba(255,255,255,0.08)', fontSize: '2rem'
      }}><FaLaptopCode /></div>

      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/fibextelecom-transparente.png" alt="Fibex Telecom" style={{ height: '36px' }} />
        </div>
        <span style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px'
        }}>
          Departamento de Sistemas
        </span>
      </header>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', zIndex: 1
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(255,255,255,0.98)', borderRadius: '20px',
          boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
          padding: '40px 40px 28px'
        }}>
          <div className="text-center mb-4">
            <img src="/fibextelecom-transparente.png" alt="Fibex Telecom"
              style={{ width: '220px', display: 'block', margin: '0 auto 14px' }} />
            <h1 style={{ fontWeight: '800', color: '#0a1628', fontSize: '1.35rem', margin: 0 }}>
              Bienvenido
            </h1>
            <p style={{ color: '#8a94a6', fontSize: '0.88rem', margin: '5px 0 0' }}>
              Portal de Conocimiento y Recursos Tecnicos
            </p>
          </div>

          {error && <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#2b3442', fontSize: '0.9rem' }}>
                Correo electronico
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{
                  position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                  color: '#8a94a6', fontSize: '1.05rem', zIndex: 2
                }} />
                <Form.Control type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@fibextelecom.com" required
                  style={{
                    padding: '13px 15px 13px 44px', borderRadius: '10px',
                    border: '2px solid #e3e7ee', fontSize: '0.95rem', background: '#fafbfd'
                  }} />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#2b3442', fontSize: '0.9rem' }}>
                Contrasena
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{
                  position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                  color: '#8a94a6', fontSize: '1.05rem', zIndex: 2
                }} />
                <Form.Control type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena" required
                  style={{
                    padding: '13px 15px 13px 44px', borderRadius: '10px',
                    border: '2px solid #e3e7ee', fontSize: '0.95rem', background: '#fafbfd'
                  }} />
              </div>
            </Form.Group>

            <Button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #0066cc, #0099ff)',
              border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem',
              boxShadow: '0 10px 25px rgba(0,102,204,0.35)'
            }}>
              <FiShield className="me-2" />
              {loading ? 'Ingresando...' : 'Iniciar Sesion'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <small style={{ color: '#a6adbb', fontSize: '0.75rem' }}>
              Hecho por Paulimar Alvarado
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
