import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { FiUser, FiLock, FiShield } from 'react-icons/fi';
import {
  FaBookOpen, FaServer, FaMicrochip, FaDatabase, FaFolderOpen,
  FaFilePdf, FaSearch, FaNetworkWired, FaLayerGroup
} from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const Bubble = ({ style, children }) => (
    <div style={{
      position: 'absolute', pointerEvents: 'none', zIndex: 1,
      background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      backdropFilter: 'blur(2px)',
      ...style
    }}>
      {children}
    </div>
  );

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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid #b6c2d4', display: 'inline-block' }} />
                <span style={{ color: '#6b7686', fontSize: '0.72rem', fontWeight: '500' }}>
                  https://fibextelecom-biblioteca.vercel.app
                </span>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(160deg, #0f2440 0%, #1c3d5a 60%, #16324f 100%)',
              padding: '48px 30px', minHeight: '62vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '0', left: '0', right: '0',
                height: '120px',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(77,184,255,0.18) 0%, rgba(77,184,255,0) 70%)',
                pointerEvents: 'none'
              }} />

              <Bubble style={{ top: '28px', left: '6%', width: '110px', height: '110px' }}>
                <FaBookOpen style={{ color: 'rgba(160,220,255,0.9)', fontSize: '2.9rem' }} />
              </Bubble>
              <Bubble style={{ bottom: '30px', right: '5%', width: '130px', height: '130px' }}>
                <FaServer style={{ color: 'rgba(160,220,255,0.9)', fontSize: '3.4rem' }} />
              </Bubble>
              <Bubble style={{ top: '24px', right: '10%', width: '80px', height: '80px' }}>
                <FaMicrochip style={{ color: 'rgba(190,235,255,0.85)', fontSize: '2rem' }} />
              </Bubble>
              <Bubble style={{ bottom: '44px', left: '12%', width: '92px', height: '92px' }}>
                <FaDatabase style={{ color: 'rgba(170,225,255,0.85)', fontSize: '2.4rem' }} />
              </Bubble>
              <Bubble style={{ top: '46%', left: '4%', width: '70px', height: '70px' }}>
                <FaLayerGroup style={{ color: 'rgba(150,210,255,0.8)', fontSize: '1.7rem' }} />
              </Bubble>
              <Bubble style={{ top: '48%', right: '7%', width: '76px', height: '76px' }}>
                <FaSearch style={{ color: 'rgba(150,210,255,0.8)', fontSize: '1.8rem' }} />
              </Bubble>
              <Bubble style={{ top: '10%', left: '36%', width: '64px', height: '64px' }}>
                <FaFolderOpen style={{ color: 'rgba(150,210,255,0.8)', fontSize: '1.6rem' }} />
              </Bubble>
              <Bubble style={{ bottom: '12%', right: '30%', width: '72px', height: '72px' }}>
                <FaFilePdf style={{ color: 'rgba(150,210,255,0.8)', fontSize: '1.8rem' }} />
              </Bubble>
              <Bubble style={{ top: '26%', left: '30%', width: '56px', height: '56px' }}>
                <FaNetworkWired style={{ color: 'rgba(150,210,255,0.75)', fontSize: '1.4rem' }} />
              </Bubble>

              <div style={{
                position: 'relative', zIndex: 1, width: '100%', maxWidth: '430px',
                background: 'rgba(255,255,255,0.98)', borderRadius: '16px',
                boxShadow: '0 30px 70px rgba(0,0,0,0.45)', padding: '40px 40px 30px'
              }}>
                <div className="text-center mb-4">
                  <div style={{
                    display: 'inline-block', background: '#343434',
                    borderRadius: '12px', padding: '10px 24px', marginBottom: '12px'
                  }}>
                    <img src="/fibextelecom-transparente.png" alt="Fibex Telecom"
                      style={{ width: '230px', display: 'block' }} />
                  </div>
                  <h3 style={{ fontWeight: '800', color: '#0a1628', fontSize: '1.15rem', margin: 0 }}>
                    Biblioteca Digital
                  </h3>
                  <p style={{ color: '#8a94a6', fontSize: '0.85rem', margin: '5px 0 0' }}>
                    Departamento de Sistemas
                  </p>
                </div>

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
