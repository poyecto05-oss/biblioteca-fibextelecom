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
      background: 'linear-gradient(150deg, #0b1d36 0%, #16324f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Container style={{ maxWidth: '400px' }}>
        <Card style={{
          background: '#ffffff', border: 'none',
          borderRadius: '18px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
        }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/fibex-logo.jpeg" alt="Fibex Telecom"
                style={{ width: '190px', marginBottom: '16px' }} />
              <h4 style={{ fontWeight: '700', color: '#0a1628', margin: 0 }}>
                Biblioteca Digital
              </h4>
              <p style={{ color: '#8a94a6', fontSize: '0.85rem', margin: '4px 0 0' }}>
                Departamento de Sistemas
              </p>
            </div>

            {error && <Alert variant="danger" style={{ borderRadius: '10px' }}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                  Correo electronico
                </Form.Label>
                <Form.Control type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@fibextelecom.com" required
                  style={{ padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '0.95rem' }} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                  Contrasena
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
