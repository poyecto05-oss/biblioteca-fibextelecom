import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiLock, FiShield, FiSearch, FiBookOpen, FiServer, FiDatabase, FiFileText } from 'react-icons/fi';

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
      background: 'radial-gradient(ellipse at 50% 0%, #1d3f66 0%, #0b1d36 55%, #071020 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', overflow: 'hidden'
    }}>

      <div style={{ textAlign: 'center', marginBottom: '26px' }}>
        <h1 style={{
          fontWeight: '800', color: '#ffffff', fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
          letterSpacing: '1px', textShadow: '0 6px 30px rgba(0,0,0,0.45)', margin: 0
        }}>
          Biblioteca Digital Fibextelecom
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', margin: '6px 0 0', letterSpacing: '0.5px' }}>
          Sistema de Manuales e Instructivos
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '1040px' }}>

        <div style={{
          background: 'linear-gradient(180deg, #343842 0%, #232630 100%)',
          borderRadius: '24px 24px 8px 8px',
          padding: '22px 22px 16px',
          boxShadow: '0 50px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#0c0e14', border: '1px solid #3a3f4b'
            }} />
          </div>

          <div style={{
            background: '#ffffff', borderRadius: '10px', overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 20px 60px rgba(0,0,0,0.35)'
          }}>
            <div style={{
              background: '#eef1f6', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #dde3ec'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
              <div style={{
                flex: 1, marginLeft: '10px', height: '26px', borderRadius: '7px',
                background: '#ffffff', border: '1px solid #dfe4ec',
                display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px'
              }}>
                <FiSearch style={{ color: '#8a94a6', fontSize: '0.8rem' }} />
                <span style={{ color: '#8a94a6', fontSize: '0.72rem', fontWeight: '500' }}>
                  Buscar manuales e instructivos...
                </span>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(160deg, #0f2440 0%, #1c3d5a 60%, #16324f 100%)',
              padding: '34px 30px', minHeight: '62vh',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '0', left: '0', right: '0',
                height: '120px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(77,184,255,0.18) 0%, rgba(77,184,255,0) 70%)',
                pointerEvents: 'none'
              }} />

              <FiBookOpen style={{
                position: 'absolute', top: '30px', left: '7%', pointerEvents: 'none',
                color: 'rgba(120,200,255,0.5)', fontSize: '4.2rem'
              }} />
              <FiServer style={{
                position: 'absolute', bottom: '26px', right: '6%', pointerEvents: 'none',
                color: 'rgba(120,200,255,0.5)', fontSize: '4.6rem'
              }} />
              <FiDatabase style={{
                position: 'absolute', bottom: '50px', left: '10%', pointerEvents: 'none',
                color: 'rgba(120,200,255,0.4)', fontSize: '3.2rem'
              }} />
              <FiFileText style={{
                position: 'absolute', top: '90px', right: '12%', pointerEvents: 'none',
                color: 'rgba(120,200,255,0.4)', fontSize: '2.8rem'
              }} />

              <div style={{ textAlign: 'center', marginBottom: '22px', position: 'relative', zIndex: 1 }}>
                <img src="/fibextelecom-transparente.png" alt="Fibex Telecom"
                  style={{ width: '250px', display: 'block', margin: '0 auto 6px' }} />
                <h3 style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.1rem', margin: 0 }}>
                  Portal de Conocimiento y Recursos Tecnicos
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Departamento de Sistemas
                </p>
              </div>

              <div style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: '430px',
                background: 'rgba(255,255,255,0.98)', borderRadius: '16px',
                boxShadow: '0 30px 70px rgba(0,0,0,0.45)', padding: '32px 40px 26px'
              }}>
                {error && <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2b3442', fontSize: '0.92rem' }}>
                      Correo electronico
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <FiUser style={{
                        position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                        color: '#8a94a6', fontSize: '1.1rem', zIndex: 2
                      }} />
                      <Form.Control type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@fibextelecom.com" required
                        style={{
                          padding: '14px 15px 14px 45px', borderRadius: '10px',
                          border: '2px solid #e3e7ee', fontSize: '1rem', background: '#fafbfd'
                        }} />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#2b3442', fontSize: '0.92rem' }}>
                      Contrasena
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <FiLock style={{
                        position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                        color: '#8a94a6', fontSize: '1.1rem', zIndex: 2
                      }} />
                      <Form.Control type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tu contrasena" required
                        style={{
                          padding: '14px 15px 14px 45px', borderRadius: '10px',
                          border: '2px solid #e3e7ee', fontSize: '1rem', background: '#fafbfd'
                        }} />
                    </div>
                  </Form.Group>

                  <Button type="submit" disabled={loading} style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #0066cc, #0099ff)',
                    border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1.05rem',
                    boxShadow: '0 10px 25px rgba(0,102,204,0.35)'
                  }}>
                    <FiShield className="me-2" style={{ fontSize: '1.1rem' }} />
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
        </div>

        <div style={{
          width: '102%', height: '20px', margin: '0 -1%',
          background: 'linear-gradient(180deg, #343842 0%, #1e2129 100%)',
          borderRadius: '0 0 18px 18px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }} />
        <div style={{
          width: '34%', height: '12px', margin: '8px auto 0',
          background: 'linear-gradient(180deg, #23262e 0%, #1a1d24 100%)',
          borderRadius: '8px'
        }} />
      </div>
    </div>
  );
};

export default Login;
