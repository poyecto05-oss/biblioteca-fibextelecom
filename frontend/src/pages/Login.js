import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
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
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url(/fibex-logo.jpeg)',
        backgroundSize: '80%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        opacity: 0.06, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(0,170,255,0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <Container style={{ maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <Card style={{
          background: 'rgba(255,255,255,0.98)', border: 'none',
          borderRadius: '20px', boxShadow: '0 30px 70px rgba(0,0,0,0.45)'
        }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/fibex-logo.jpeg" alt="Fibex Telecom"
                style={{ width: '220px', marginBottom: '8px' }} />
              <h2 style={{
                fontWeight: '800', color: '#0a1628', fontSize: '1.5rem',
                letterSpacing: '1px', marginTop: '4px'
              }}>
                Biblioteca Digital
              </h2>
              <p style={{ color: '#8a94a6', fontSize: '0.85rem', margin: 0 }}>
                Departamento de Sistemas
              </p>
            </div>

            {error && <Alert variant="danger" style={{ borderRadius: '10px' }}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                  <FiUser className="me-1" /> Correo electronico
                </Form.Label>
                <Form.Control type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@fibextelecom.com" required
                  style={{ padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '0.95rem' }} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                  <FiLock className="me-1" /> Contrasena
                </Form.Label>
                <Form.Control type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena" required
                  style={{ padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '0.95rem' }} />
              </Form.Group>

              <Button type="submit" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '1rem'
              }}>
                <FiShield className="me-2" />
                {loading ? 'Ingresando...' : 'Iniciar Sesion'}
              </Button>
            </Form>

            <div className="text-center mt-4">
              <small style={{ color: '#aaa' }}>
                Fibextelecom - Valencia, Venezuela
              </small>
              <p style={{ color: '#999', fontSize: '0.75rem', margin: '8px 0 0' }}>
                Elaborado por Paulimar
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
