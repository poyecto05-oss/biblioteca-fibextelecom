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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#ffffff' }}>
      <div style={{
        flex: 1.2,
        backgroundImage: 'url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />

      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2440 0%, #1c3d5a 100%)',
        padding: '40px 20px'
      }}>
        <Card style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(255,255,255,0.98)', border: 'none',
          borderRadius: '20px', boxShadow: '0 30px 70px rgba(0,0,0,0.35)'
        }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/fibex-logo.jpeg" alt="Fibex Telecom"
                style={{ width: '200px', marginBottom: '10px' }} />
              <h2 style={{
                fontWeight: '800', color: '#0a1628', fontSize: '1.35rem',
                letterSpacing: '1px'
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
      </div>
    </div>
  );
};

export default Login;
