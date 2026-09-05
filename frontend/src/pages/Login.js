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

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

    /* Orbes de fondo animados */
    .orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;animation:orbFloat 12s ease-in-out infinite}
    .orb-1{width:520px;height:520px;background:rgba(24,153,255,.16);top:-120px;right:-80px}
    .orb-2{width:460px;height:460px;background:rgba(0,200,150,.12);bottom:-120px;left:10%;animation-delay:3s}
    .orb-3{width:300px;height:300px;background:rgba(34,211,238,.10);top:40%;left:-100px;animation-delay:6s}
    .orb-4{width:280px;height:280px;background:rgba(163,230,53,.08);bottom:20%;right:-80px;animation-delay:9s}
    @keyframes orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-25px)}}

    /* Iconos flotantes del fondo */
    .float-icon{pointer-events:none;color:rgba(56,182,255,.18);font-size:3.2rem;animation:float 6s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(6deg)}}

    /* Card de login con entrada */
    .login-card{width:100%;max-width:420px;background:linear-gradient(180deg,#0f1b26,#120e24);border:1px solid #1e3549;border-radius:22px;box-shadow:0 40px 90px rgba(0,0,0,.55);padding:40px 40px 28px;position:relative;overflow:hidden;animation:cardIn .8s cubic-bezier(.22,1,.36,1) both}
    @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    .card-shine{position:absolute;top:-60%;left:-60%;width:80%;height:120%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.04) 50%,transparent 60%);transform:rotate(15deg);animation:shine 6s ease-in-out infinite;pointer-events:none}
    @keyframes shine{0%,100%{left:-60%}50%{left:120%}}

    /* Inputs con focus glow */
    .login-input{transition:all .3s ease!important}
    .login-input:focus{border-color:#1899ff!important;box-shadow:0 0 0 4px rgba(24,153,255,.15),0 4px 20px rgba(24,153,255,.15)!important;background:#0c151d!important;color:#e5f2ff!important}
    .login-input::placeholder{color:#5a7089!important}

    /* Boton con efecto */
    .login-btn{width:100%;padding:13px;background:linear-gradient(135deg,#1899ff,#00c896);border:none;border-radius:12px;font-weight:700;font-size:1rem;box-shadow:0 10px 30px rgba(24,153,255,.4);transition:all .3s ease!important;position:relative;overflow:hidden}
    .login-btn:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(24,153,255,.55);background:linear-gradient(135deg,#1899ff,#00c896)!important;border:none!important}
    .login-btn:active{transform:translateY(0) scale(.98)}
    .login-btn:disabled{opacity:.7;transform:none}

    h1,h2,h3,h4,p,label,small{font-family:'Space Grotesk',system-ui,sans-serif}
  `;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070d12',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden'
    }}>
      <style>{css}</style>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      <div className="float-icon" style={{ position: 'absolute', top: '18%', left: '12%' }}><FaServer /></div>
      <div className="float-icon" style={{ position: 'absolute', top: '12%', right: '14%', fontSize: '3rem', animationDelay: '1.2s' }}><FaCode /></div>
      <div className="float-icon" style={{ position: 'absolute', bottom: '20%', left: '10%', fontSize: '2.8rem', animationDelay: '0.6s' }}><FaDatabase /></div>
      <div className="float-icon" style={{ position: 'absolute', bottom: '14%', right: '12%', fontSize: '3rem', animationDelay: '1.8s' }}><FaMicrochip /></div>
      <div className="float-icon" style={{ position: 'absolute', top: '38%', left: '6%', fontSize: '2.2rem', animationDelay: '0.3s' }}><FaTerminal /></div>
      <div className="float-icon" style={{ position: 'absolute', top: '42%', right: '7%', fontSize: '2.4rem', animationDelay: '1.5s' }}><FaNetworkWired /></div>
      <div className="float-icon" style={{ position: 'absolute', top: '24%', left: '30%', fontSize: '2rem', animationDelay: '0.9s' }}><FaCog /></div>
      <div className="float-icon" style={{ position: 'absolute', bottom: '30%', right: '30%', fontSize: '2.2rem', animationDelay: '2.1s' }}><FaFolder /></div>
      <div className="float-icon" style={{ position: 'absolute', top: '10%', left: '45%', fontSize: '1.8rem', animationDelay: '1.7s' }}><FaCloud /></div>
      <div className="float-icon" style={{ position: 'absolute', bottom: '10%', left: '42%', fontSize: '2rem', animationDelay: '2.4s' }}><FaLaptopCode /></div>

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
        <div className="login-card">
          <div className="card-shine" />
          <div style={{
            position: 'absolute', top: '16px', right: '16px', pointerEvents: 'none',
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(24,153,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaServer style={{ color: '#38b6ff', fontSize: '1.6rem' }} />
          </div>
          <div style={{
            position: 'absolute', top: '74px', right: '22px', pointerEvents: 'none',
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(0,200,150,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaCode style={{ color: '#00c896', fontSize: '1.2rem' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: '14px', left: '16px', pointerEvents: 'none',
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(24,153,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaDatabase style={{ color: '#38b6ff', fontSize: '1.6rem' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: '72px', left: '22px', pointerEvents: 'none',
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(0,200,150,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FaMicrochip style={{ color: '#00c896', fontSize: '1.2rem' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-4">
            <img src="/fibextelecom-transparente.png" alt="Fibex Telecom"
              style={{ width: '220px', display: 'block', margin: '0 auto 14px', filter: 'brightness(0) invert(1)', opacity: '0.9' }} />
            <h1 style={{ fontWeight: '800', color: '#e5f2ff', fontSize: '1.35rem', margin: 0 }}>
              Bienvenido
            </h1>
            <p style={{ color: '#8ba3bd', fontSize: '0.88rem', margin: '5px 0 0' }}>
              Portal de Conocimiento y Recursos Tecnicos
            </p>
          </div>

          {error && <Alert variant="danger" style={{ borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600', color: '#e5f2ff', fontSize: '0.9rem' }}>
                Correo electronico
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{
                  position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                  color: '#5a7089', fontSize: '1.05rem', zIndex: 2
                }} />
                <Form.Control type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@fibextelecom.com" required
                  className="login-input"
                  style={{
                    padding: '13px 15px 13px 44px', borderRadius: '10px',
                    border: '2px solid #1e3549', fontSize: '0.95rem', background: '#0c151d',
                    color: '#e5f2ff'
                  }} />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#e5f2ff', fontSize: '0.9rem' }}>
                Contrasena
              </Form.Label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{
                  position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                  color: '#5a7089', fontSize: '1.05rem', zIndex: 2
                }} />
                <Form.Control type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena" required
                  className="login-input"
                  style={{
                    padding: '13px 15px 13px 44px', borderRadius: '10px',
                    border: '2px solid #1e3549', fontSize: '0.95rem', background: '#0c151d',
                    color: '#e5f2ff'
                  }} />
              </div>
            </Form.Group>

            <Button type="submit" disabled={loading} className="login-btn">
              <FiShield className="me-2" />
              {loading ? 'Ingresando...' : 'Iniciar Sesion'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <small style={{ color: '#5a7089', fontSize: '0.75rem' }}>
              Hecho por Paulimar Alvarado
            </small>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
