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
      background: 'linear-gradient(135deg, #0f2440 0%, #1c3d5a 50%, #132e45 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Container style={{ maxWidth: '420px' }}>
        <Card style={{
          background: 'rgba(255,255,255,0.97)', border: 'none',
          borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
        }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/logo-fibex.jpg" alt="Fibex Telecom"
                style={{ width: '220px', marginBottom: '15px', borderRadius: '8px' }} />
              <h3 style={{ fontWeight: '700', color: '#0a1628', fontSize: '1.25rem' }}>
                Biblioteca de Manuales
              </h3>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
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
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
