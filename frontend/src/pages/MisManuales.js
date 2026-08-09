import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import {
  FiFileText, FiDownload, FiSearch, FiUser, FiGrid,
  FiServer, FiWifi, FiShield, FiDatabase, FiCpu,
  FiMonitor, FiHardDrive, FiActivity, FiGlobe, FiZap,
  FiLogOut, FiEye, FiFolder
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const catIcons = {
  'Manuales': <FiFileText size={14} />,
  'Instructivo': <FiCpu size={14} />
};

const catColors = {
  'Manuales': '#0066cc',
  'Instructivo': '#00aa66'
};

const ManualCard = ({ manual, onPreview, onDownload, catColors, catIcons, getCategoriaColor }) => (
  <Col lg={4} md={6} key={manual.id} className="mb-4">
    <Card style={{
      height: '100%', border: 'none', borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}
    >
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, ' + (catColors[manual.categoria] || '#0066cc') + ', ' + (catColors[manual.categoria] || '#0066cc') + '99)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {catIcons[manual.categoria] || <FiFileText size={24} color="white" />}
          </div>
          <Badge bg={getCategoriaColor(manual.categoria)}
            style={{ fontSize: '0.7rem', padding: '5px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {catIcons[manual.categoria]} {manual.categoria}
          </Badge>
        </div>
        <h5 style={{ fontWeight: '700', color: '#0a1628' }}>{manual.titulo}</h5>
        <p style={{ color: '#666', fontSize: '0.85rem', flex: 1 }}>{manual.descripcion || 'Sin descripcion'}</p>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid #eee' }}>
          <small style={{ color: '#999' }}><FiActivity className="me-1" />{new Date(manual.created_at).toLocaleDateString('es-VE')}</small>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm"
              onClick={() => onPreview(manual.archivo)}
              style={{ borderRadius: '8px', padding: '6px 12px' }}>
              <FiEye className="me-1" /> Ver
            </Button>
            <Button variant="outline-primary" size="sm"
              onClick={() => onDownload(manual.archivo, manual.titulo)}
              style={{ borderRadius: '8px', padding: '6px 12px' }}>
              <FiDownload className="me-1" /> Descargar
            </Button>
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

  const categorias = ['Manuales', 'Instructivo'];

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" />
          <p style={{ color: '#666', marginTop: '15px' }}><FiServer className="me-1" /> Cargando manuales...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f2440, #1c3d5a)',
        padding: '22px 0'
      }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img src="/logo-fibex.jpg" alt="Fibex" style={{ height: '40px', marginRight: '15px', borderRadius: '8px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '700', margin: 0 }}>
                  <FiServer className="me-2" />Mis Manuales
                </h4>
                <small style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <FiShield className="me-1" />Departamento de Sistemas
                </small>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', marginTop: '2px' }}>
                  Elaborado por Paulimar
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(0,170,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiUser size={18} color="white" />
                </div>
                <div className="ms-2">
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user?.nombre}</div>
                  <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{user?.departamento}</small>
                </div>
              </div>
              <Button variant="outline-light" size="sm"
                onClick={() => { logout(); navigate('/login'); }}
                style={{ borderRadius: '8px', padding: '6px 12px' }}>
                <FiLogOut className="me-1" /> Salir
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <InputGroup className="mb-4" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <InputGroup.Text style={{ background: 'white', border: 'none', paddingLeft: '20px' }}>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control placeholder="Buscar manuales por titulo o descripcion..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', padding: '12px 15px', fontSize: '0.95rem' }} />
        </InputGroup>

        <Tabs activeKey={categoria} onSelect={(k) => setCategoria(k)} className="mb-4" style={{ fontWeight: '600' }}>
          {categorias.map(c => (
            <Tab key={c} eventKey={c} title={<span>{catIcons[c] || <FiFileText size={14} />} {c}</span>} />
          ))}
        </Tabs>

        <div className="mb-3 d-flex align-items-center gap-2">
          <FiFileText className="text-muted" />
          <small className="text-muted">{filtered.length} manual(es) disponibles para ti</small>
        </div>

        {filtered.length === 0 ? (
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center', padding: '60px 20px' }}>
            <FiServer size={60} color="#ccc" />
            <h4 className="mt-3" style={{ color: '#666' }}>
              No hay manuales {search ? 'con estos filtros' : 'en ' + categoria}
            </h4>
            <p style={{ color: '#999' }}>
              {search
                ? 'Intenta con otros criterios de busqueda'
                : 'Contacta al administrador para que te asigne manuales'}
            </p>
          </Card>
        ) : (
          <>
            {misCarpetas.map((folder) => {
              var folderManuals = filtered.filter(function(m) { return m.folder_id === folder.id; });
              if (folderManuals.length === 0) return null;
              return (
                <div key={folder.id} className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{
                      width: '36px', height: '36px',
                      background: 'linear-gradient(135deg, #ff6600, #ff9900)',
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <FiFolder size={20} color="white" />
                    </div>
                    <div>
                      <h5 style={{ fontWeight: '700', margin: 0, color: '#0a1628' }}>{folder.nombre}</h5>
                      <small style={{ color: '#888' }}>{folderManuals.length} manual(es)</small>
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
                <div className="d-flex align-items-center mb-3">
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <FiFileText size={20} color="white" />
                  </div>
                  <div>
                    <h5 style={{ fontWeight: '700', margin: 0, color: '#0a1628' }}>Sin carpeta</h5>
                    <small style={{ color: '#888' }}>
                      {filtered.filter(function(m) { return !m.folder_id; }).length} manual(es)
                    </small>
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
      </Container>

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
