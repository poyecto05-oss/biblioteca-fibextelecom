import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import {
  FiFileText, FiDownload, FiSearch, FiUser, FiGrid,
  FiServer, FiWifi, FiShield, FiDatabase, FiCpu,
  FiMonitor, FiHardDrive, FiActivity, FiGlobe, FiZap,
  FiLogOut, FiEye, FiFolder, FiBook
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const catIcons = {
  'Manuales': <FiFileText size={14} />,
  'Instructivo': <FiCpu size={14} />
};

const catColors = {
  'Manuales': '#1899ff',
  'Instructivo': '#00c896'
};

const ManualCard = ({ manual, onPreview, onDownload, catColors, catIcons, getCategoriaColor }) => (
  <Col lg={4} md={6} key={manual.id} className="mb-4">
    <Card style={{
      height: '100%', border: '1px solid #1e3549', borderRadius: '18px',
      background: 'linear-gradient(180deg,#0f1b26,#130e26)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
    }}
      className="mis-card"
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(24,153,255,0.2)'; e.currentTarget.style.borderColor = '#2a4a66'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = '#1e3549'; }}
    >
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, ' + (catColors[manual.categoria] || '#1899ff') + ', ' + (catColors[manual.categoria] || '#1899ff') + '99)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(24,153,255,.3)'
          }}>
            {catIcons[manual.categoria] || <FiFileText size={24} color="white" />}
          </div>
          <span className={`badge-soft ${manual.categoria === 'Manuales' ? 'badge-manual' : 'badge-instr'}`}>
            {catIcons[manual.categoria] || <FiFileText size={12} />} {manual.categoria}
          </span>
        </div>
        <h5 style={{ fontWeight: '700', color: '#e5f2ff' }}>{manual.titulo}</h5>
        <p style={{ color: '#8ba3bd', fontSize: '0.85rem', flex: 1 }}>{manual.descripcion || 'Sin descripcion'}</p>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid #1e173c' }}>
          <small style={{ color: '#5a7089' }}><FiActivity className="me-1" />{new Date(manual.created_at).toLocaleDateString('es-VE')}</small>
          <div className="d-flex gap-2">
            <button className="btn-sm-card preview-btn"
              onClick={() => onPreview(manual.archivo)}>
              <FiEye className="me-1" /> Ver
            </button>
            <button className="btn-sm-card download-btn"
              onClick={() => onDownload(manual.archivo, manual.titulo)}>
              <FiDownload className="me-1" /> Descargar
            </button>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const MisManuales = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [manuals, setManuals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [misCarpetas, setMisCarpetas] = useState([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Manuales');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const categorias = [...new Set(manuals.map(function(m) { return m.categoria; }))];
  const tabActiva = categorias.includes(categoria) ? categoria : (categorias[0] || 'Manuales');

  useEffect(() => { fetchManuals(); }, []);

  useEffect(() => {
    let result = manuals;
    if (search) {
      result = result.filter(m =>
        m.titulo.toLowerCase().includes(search.toLowerCase()) ||
        m.descripcion?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoria !== 'Todas') {
      result = result.filter(m => m.categoria === categoria);
    }
    setFiltered(result);
  }, [search, categoria, manuals]);

  const fetchManuals = async () => {
    try {
      const [res, carpetasRes] = await Promise.all([
        API.get('/manuals'),
        API.get('/folders/mis-carpetas')
      ]);
      setManuals(res.data);
      setFiltered(res.data);
      setMisCarpetas(carpetasRes.data || []);
    } catch (error) {
      toast.error('Error al cargar manuales');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filename, titulo) => {
    const token = localStorage.getItem('token');
    var baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    fetch(baseUrl + "/api/manuals/download/" + filename, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = titulo + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Error al descargar'));
  };

  const handlePreview = (filename) => {
    const token = localStorage.getItem('token');
    var baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    setPreviewUrl(baseUrl + "/api/manuals/preview/" + filename + "?token=" + token);
    setShowPreview(true);
  };

  const getCategoriaColor = (cat) => {
    const colors = {
      'Manuales': 'primary', 'Instructivo': 'success'
    };
    return colors[cat] || 'secondary';
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    :root{
      --bg:#070d12; --bg2:#0c151d; --surface:#0f1b26; --surface2:#16283a;
      --border:#1e3549; --border2:#2a4a66;
      --violet:#1899ff; --violet-light:#38b6ff; --magenta:#00c896;
      --ink:#e5f2ff; --muted:#8ba3bd; --faint:#5a7089;
      --green:#2dd4a7; --orange:#f59e0b; --red:#f05252;
      --grad:linear-gradient(135deg,#1899ff,#00c896);
      --grad-soft:linear-gradient(135deg,rgba(24,153,255,.15),rgba(0,200,150,.15));
    }
    *{-webkit-font-smoothing:antialiased}
    .mis-oscuro{font-family:'Space Grotesk',system-ui,sans-serif;background:var(--bg)!important;color:var(--ink)!important;min-height:100vh;position:relative;overflow:hidden}
    ::-webkit-scrollbar{width:9px;height:9px}
    ::-webkit-scrollbar-track{background:var(--bg2)}
    ::-webkit-scrollbar-thumb{background:#3a2f6b;border-radius:9px}
    ::-webkit-scrollbar-thumb:hover{background:var(--violet)}

    .mis-oscuro::before,.mis-oscuro::after{content:'';position:fixed;border-radius:50%;filter:blur(90px);z-index:0;pointer-events:none}
    .mis-oscuro::before{width:520px;height:520px;background:rgba(24,153,255,.16);top:-120px;right:-80px}
    .mis-oscuro::after{width:460px;height:460px;background:rgba(0,200,150,.12);bottom:-120px;left:10%}

    .mis-hero{padding:28px 32px;position:relative;overflow:hidden;background:radial-gradient(circle at 80% 10%,rgba(24,153,255,.25),transparent 45%),radial-gradient(circle at 12% 110%,rgba(0,200,150,.2),transparent 50%),linear-gradient(180deg,#161130,#0f0b1f);border-bottom:1px solid var(--border);z-index:1}
    .mis-hero .deco{position:absolute;font-size:80px;color:rgba(24,153,255,.12);top:0;right:8%;transform:rotate(-12deg);pointer-events:none}
    .mis-hero h4{margin:0;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:12px}
    .mis-hero h4 .badge-icon{width:44px;height:44px;border-radius:13px;background:var(--grad);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(24,153,255,.45)}
    .mis-hero .sub{color:var(--muted);font-size:13px}
    .mis-hero .crumb{font-size:12px;color:var(--muted);letter-spacing:.4px;margin-bottom:8px}
    .mis-hero .crumb i{color:var(--violet)}
    .user-chip{display:flex;align-items:center;gap:13px}
    .user-chip .avatar{width:42px;height:42px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;box-shadow:0 0 0 3px rgba(24,153,255,.3),0 8px 20px rgba(0,0,0,.4)}
    .user-chip .nm{font-weight:600;font-size:13.5px;color:var(--ink)}
    .user-chip .rl{font-size:11.5px;color:var(--muted)}
    .user-chip .btn{width:40px;height:40px;border-radius:11px;border:1px solid var(--border);background:var(--surface);color:#c9c2ea}
    .user-chip .btn:hover{color:#fff;border-color:var(--violet)}

    .mis-content{padding:28px 32px;position:relative;z-index:1}

    .search-box{position:relative;flex:1;min-width:220px}
    .search-box i{position:absolute;left:17px;top:50%;transform:translateY(-50%);color:var(--faint);z-index:2}
    .search-box input{width:100%;padding:13px 18px 13px 46px;border:1px solid var(--border);border-radius:14px;font-size:14px;outline:none;transition:.15s;background:var(--bg2);color:var(--ink)}
    .search-box input::placeholder{color:var(--faint)}
    .search-box input:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(24,153,255,.2)}

    .mis-tabs{display:flex;gap:10px;flex-wrap:wrap;border:none!important;margin-bottom:24px!important}
    .mis-tabs .nav-item{background:transparent!important}
    .mis-tabs .nav-link{color:var(--muted)!important;font-weight:600;font-size:13.5px;border:none!important;border-radius:11px!important;padding:10px 18px!important;transition:.15s;background:transparent!important}
    .mis-tabs .nav-link:hover{background:var(--surface2);color:#fff!important}
    .mis-tabs .nav-link.active{background:var(--grad)!important;color:#fff!important;box-shadow:0 6px 18px rgba(24,153,255,.35)}

    .badge-soft{border-radius:8px;padding:5px 11px;font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;border:1px solid transparent}
    .badge-instr{background:rgba(52,211,153,.13);color:var(--green);border-color:rgba(52,211,153,.3)}
    .badge-manual{background:rgba(24,153,255,.15);color:var(--violet-light);border-color:rgba(24,153,255,.35)}

    .btn-sm-card{border-radius:9px;padding:7px 13px;font-size:12.5px;font-weight:600;border:1px solid var(--border);background:var(--bg2);transition:.15s;cursor:pointer}
    .preview-btn{color:var(--violet-light)}
    .preview-btn:hover{background:rgba(24,153,255,.12);border-color:var(--violet);color:var(--violet-light)}
    .download-btn{color:var(--green)}
    .download-btn:hover{background:rgba(52,211,153,.12);border-color:var(--green);color:var(--green)}

    .folder-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
    .folder-head .ficon{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .folder-head .fname{font-weight:700;margin:0;color:var(--ink)}
    .folder-head .fcount{color:var(--faint);font-size:12px}

    .mis-count{color:var(--muted);font-size:13px}

    .empty-state{background:linear-gradient(180deg,var(--surface),#120e24);border:1px solid var(--border);border-radius:var(--radius-lg,20px);text-align:center;padding:60px 20px}
    .empty-state i{font-size:46px;display:flex;width:80px;height:80px;border-radius:50%;margin:0 auto 14px;background:var(--grad-soft);align-items:center;justify-content:center;color:var(--violet-light)}
    .empty-state h4{color:var(--ink);font-weight:700;margin-top:10px}
    .empty-state p{color:var(--faint)}

    .modal-content{background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:18px!important;color:var(--ink)!important}
    .modal-header{border-bottom:1px solid var(--border)!important}
    .modal-title{font-weight:700!important;color:var(--ink)!important}
    .modal .btn-close{filter:invert(1)}
  `;

  if (loading) {
    return (
      <div className="mis-oscuro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{css}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border" style={{ color: '#1899ff' }} role="status" />
          <p style={{ color: '#8ba3bd', marginTop: '15px' }}><FiServer className="me-1" /> Cargando manuales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-oscuro">
      <style>{css}</style>

      <header className="mis-hero">
        <div className="deco"><FiGlobe size={80} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div className="d-flex align-items-center">
            <img src="/logo-fibex.jpg" alt="Fibex" style={{ height: '42px', marginRight: '18px', borderRadius: '10px', boxShadow: '0 0 0 2px rgba(24,153,255,.4)' }} />
            <div>
              <div className="crumb"><i className="bi bi-house me-1"></i> Inicio / Mis Manuales</div>
              <h4><span className="badge-icon"><FiBook size={20} color="#fff" /></span>Mis Manuales</h4>
              <div className="sub"><FiShield className="me-1" />Departamento de Sistemas</div>
            </div>
          </div>
          <div className="user-chip">
            <div style={{ textAlign: 'right' }} className="d-none d-sm-block">
              <div className="nm">{user?.nombre}</div>
              <div className="rl"><FiUser className="me-1" />{user?.departamento}</div>
            </div>
            <div className="avatar">{user?.nombre?.charAt(0) || 'U'}</div>
            <button className="btn" title="Cerrar sesion" onClick={() => { logout(); navigate('/login'); }}>
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mis-content">
        <div style={{ maxWidth: '700px', marginBottom: '24px' }}>
          <div className="search-box">
            <FiSearch />
            <input placeholder="Buscar manuales por titulo o descripcion..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Tabs activeKey={tabActiva} onSelect={(k) => setCategoria(k)} className="mis-tabs">
          {categorias.map(c => (
            <Tab key={c} eventKey={c} title={<span>{catIcons[c] || <FiFileText size={14} />} {c}</span>} />
          ))}
        </Tabs>

        <div className="mb-3 mis-count">
          <FiFileText className="me-1" />
          {filtered.length} manual(es) disponibles para ti
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h4>No hay manuales {search ? 'con estos filtros' : 'en ' + categoria}</h4>
            <p>
              {search
                ? 'Intenta con otros criterios de busqueda'
                : 'Contacta al administrador para que te asigne manuales'}
            </p>
          </div>
        ) : (
          <>
            {misCarpetas.map((folder) => {
              var folderManuals = filtered.filter(function(m) { return m.folder_id === folder.id; });
              if (folderManuals.length === 0) return null;
              return (
                <div key={folder.id} className="mb-4">
                  <div className="folder-head">
                    <div className="ficon" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                      <FiFolder size={20} color="white" />
                    </div>
                    <div>
                      <h5 className="fname">{folder.nombre}</h5>
                      <div className="fcount">{folderManuals.length} manual(es)</div>
                    </div>
                  </div>
                  <Row>
                    {folderManuals.map((manual) => (
                      <ManualCard key={manual.id} manual={manual} onPreview={handlePreview} onDownload={handleDownload}
                        catColors={catColors} catIcons={catIcons} getCategoriaColor={getCategoriaColor} />
                    ))}
                  </Row>
                </div>
              );
            })}

            {filtered.some(function(m) { return !m.folder_id; }) && (
              <div className="mb-4">
                <div className="folder-head">
                  <div className="ficon" style={{ background: 'var(--grad)' }}>
                    <FiFileText size={20} color="white" />
                  </div>
                  <div>
                    <h5 className="fname">Sin carpeta</h5>
                    <div className="fcount">
                      {filtered.filter(function(m) { return !m.folder_id; }).length} manual(es)
                    </div>
                  </div>
                </div>
                <Row>
                  {filtered.filter(function(m) { return !m.folder_id; }).map((manual) => (
                    <ManualCard key={manual.id} manual={manual} onPreview={handlePreview} onDownload={handleDownload}
                      catColors={catColors} catIcons={catIcons} getCategoriaColor={getCategoriaColor} />
                  ))}
                </Row>
              </div>
            )}
          </>
        )}
      </div>

      <Modal show={showPreview} onHide={() => { setShowPreview(false); setPreviewUrl(''); }}
        size="xl" centered style={{ maxHeight: '90vh' }}>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '15px 20px' }}>
          <Modal.Title style={{ fontWeight: '700', fontSize: '1rem' }}>
            <FiEye className="me-2" />Vista Previa del Documento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: '75vh' }}>
          {previewUrl && (
            <iframe src={previewUrl} title="Vista Previa"
              style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default MisManuales;