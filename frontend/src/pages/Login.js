import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';

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
      background: 'linear-gradient(160deg, #0a1830 0%, #16324f 55%, #0d2138 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '40px 20px'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        opacity: 0.08, pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            fontWeight: '800', color: '#ffffff', fontSize: '1.6rem',
            letterSpacing: '2px', textShadow: '0 4px 20px rgba(0,0,0,0.4)', margin: 0
          }}>
            Biblioteca Digital Fibextelecom
          </h2>
          <small style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '1px' }}>
            Sistema de Manuales e Instructivos
          </small>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, #2a2d35 0%, #1c1f26 100%)',
          borderRadius: '22px 22px 12px 12px',
          padding: '12px 12px 22px',
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px 10px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
            <div style={{
              flex: 1, marginLeft: '12px', height: '22px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', padding: '0 10px'
            }}>
              <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                https://fibextelecom-biblioteca.vercel.app
              </small>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(160deg, #0f2440 0%, #1c3d5a 100%)',
            borderRadius: '10px',
            padding: '45px 30px',
            minHeight: '430px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '100%', maxWidth: '400px',
              background: 'rgba(255,255,255,0.97)', border: 'none',
              borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              padding: '35px 35px 25px'
            }}>
              <div className="text-center mb-4">
                <img src="/fibex-logo.jpeg" alt="Fibex Telecom"
                  style={{ width: '180px', marginBottom: '8px' }} />
                <h3 style={{ fontWeight: '700', color: '#0a1628', fontSize: '1.05rem', margin: 0 }}>
                  Biblioteca Digital
                </h3>
                <p style={{ color: '#8a94a6', fontSize: '0.78rem', margin: '4px 0 0' }}>
                  Departamento de Sistemas - Fibextelecom
                </p>
              </div>

              {error && <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '0.85rem' }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>
                    <FiUser className="me-1" /> Correo electronico
                  </Form.Label>
                  <Form.Control type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@fibextelecom.com" required
                    style={{ padding: '11px 14px', borderRadius: '9px', border: '2px solid #e0e0e0', fontSize: '0.9rem' }} />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>
                    <FiLock className="me-1" /> Contrasena
                  </Form.Label>
                  <Form.Control type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contrasena" required
                    style={{ padding: '11px 14px', borderRadius: '9px', border: '2px solid #e0e0e0', fontSize: '0.9rem' }} />
                </Form.Group>

                <Button type="submit" disabled={loading} style={{
                  width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                  border: 'none', borderRadius: '9px', fontWeight: '600', fontSize: '0.95rem'
                }}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesion'}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p style={{ color: '#999', fontSize: '0.72rem', margin: 0 }}>
                  Elaborado por Paulimar
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          width: '46%', height: '14px', margin: '0 auto',
          background: 'linear-gradient(180deg, #2a2d35 0%, #181a20 100%)',
          borderRadius: '0 0 14px 14px'
        }} />
      </div>
    </div>
  );
};

export default Login;
