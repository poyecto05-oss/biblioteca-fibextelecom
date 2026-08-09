import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import * as XLSX from 'xlsx';
import {
  Container, Row, Col, Card, Button, Form, Modal, Badge,
  Table, Tabs, Tab, InputGroup, ButtonGroup
} from 'react-bootstrap';
import {
  FiFileText, FiUsers, FiUpload, FiDownload, FiEdit2, FiTrash2,
  FiSearch, FiPlus, FiCheck, FiLogOut, FiGrid,
  FiUser, FiShield, FiServer, FiWifi, FiDatabase,
  FiCpu, FiMonitor, FiHardDrive, FiActivity, FiGlobe, FiZap,
  FiPrinter, FiBook, FiLock, FiEye, FiClock, FiFolder, FiFolderPlus
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [manuals, setManuals] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('manuales');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingManual, setEditingManual] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedManuals, setSelectedManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualForm, setManualForm] = useState({
    titulo: '', descripcion: '', categoria: 'Instructivo', archivo: null, folder_id: ''
  });
  const [userForm, setUserForm] = useState({
    nombre: '', email: '', password: '', rol: 'usuario', departamento: 'Sistemas'
  });
  const [userFormManuals, setUserFormManuals] = useState([]);
  const [activityStats, setActivityStats] = useState({ porUsuario: [], porManual: [] });
  const [activityLogs, setActivityLogs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({ nombre: '', descripcion: '' });
  const [showFolderAssignModal, setShowFolderAssignModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFolderUsers, setSelectedFolderUsers] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const categorias = [
    'Manuales', 'Instructivo'
  ];

  const catIcons = {
    'Manuales': <FiFileText size={18} />,
    'Instructivo': <FiCpu size={18} />
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [manualsRes, usersRes, statsRes, logsRes, foldersRes] = await Promise.all([
        API.get('/manuals/all'),
        API.get('/auth/users'),
        API.get('/activity/stats'),
        API.get('/activity/logs'),
        API.get('/folders')
      ]);
      setManuals(manualsRes.data);
      setUsers(usersRes.data);
      setActivityStats(statsRes.data);
      setActivityLogs(logsRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadManual = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', manualForm.titulo);
    formData.append('descripcion', manualForm.descripcion);
    formData.append('categoria', manualForm.categoria);
    if (manualForm.folder_id) formData.append('folder_id', manualForm.folder_id);
    if (manualForm.archivo) formData.append('archivo', manualForm.archivo);
    try {
      if (editingManual) {
        await API.put("/manuals/" + editingManual.id, {
          titulo: manualForm.titulo,
          descripcion: manualForm.descripcion,
          categoria: manualForm.categoria,
          folder_id: manualForm.folder_id || null
        });
        toast.success('Manual actualizado');
      } else {
        await API.post('/manuals', formData);
        toast.success('Manual subido exitosamente');
      }
      setShowUploadModal(false);
      setEditingManual(null);
      setManualForm({ titulo: '', descripcion: '', categoria: 'Instructivo', archivo: null, folder_id: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error al guardar manual');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      var savedUserId;
      if (editingUser) {
        const updateData = { ...userForm };
        if (!updateData.password) delete updateData.password;
        await API.put("/auth/users/" + editingUser.id, updateData);
        savedUserId = editingUser.id;
        toast.success('Usuario actualizado');
      } else {
        const res = await API.post('/auth/users', userForm);
        savedUserId = res.data.user?.id;
        toast.success('Usuario creado exitosamente');
      }

      if (savedUserId && userForm.rol !== 'admin') {
        for (const manual of manuals) {
          var wasAssigned = manual.asignados && manual.asignados.some(function(a) { return a.id === savedUserId; });
          var shouldAssign = userFormManuals.includes(manual.id);
          if (wasAssigned !== shouldAssign) {
            var updatedAsignados = shouldAssign
              ? (manual.asignados || []).map(function(a) { return a.id; }).concat([savedUserId])
              : (manual.asignados || []).filter(function(a) { return a.id !== savedUserId; });
            await API.put("/manuals/" + manual.id, {
              titulo: manual.titulo,
              descripcion: manual.descripcion,
              categoria: manual.categoria,
              asignados: JSON.stringify(updatedAsignados)
            });
          }
        }
      }

      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ nombre: '', email: '', password: '', rol: 'usuario', departamento: 'Sistemas' });
      setUserFormManuals([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error al guardar usuario');
    }
  };

  const handleAssign = async () => {
    try {
      for (const manual of manuals) {
        const wasAssigned = manual.asignados?.some(function(a) { return a.id === selectedUser.id; });
        const shouldAssign = selectedManuals.includes(manual.id);
        if (wasAssigned !== shouldAssign) {
          const updatedAsignados = shouldAssign
            ? (manual.asignados || []).map(function(a) { return a.id; }).concat([selectedUser.id])
            : (manual.asignados || []).filter(function(a) { return a.id !== selectedUser.id; });
          await API.put("/manuals/" + manual.id, {
            titulo: manual.titulo,
            descripcion: manual.descripcion,
            categoria: manual.categoria,
            asignados: JSON.stringify(updatedAsignados)
          });
        }
      }
      toast.success("Manuales asignados a " + selectedUser.nombre);
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedManuals([]);
      fetchData();
    } catch (error) {
      toast.error('Error al asignar');
    }
  };

  const handleDeleteManual = async (id) => {
    if (window.confirm('Eliminar este manual permanentemente?')) {
      try {
        await API.delete("/manuals/" + id);
        toast.success('Manual eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Eliminar este usuario permanentemente?')) {
      try {
        await API.delete("/auth/users/" + id);
        toast.success('Usuario eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    try {
      if (editingFolder) {
        await API.put("/folders/" + editingFolder.id, folderForm);
        toast.success('Carpeta actualizada');
      } else {
        await API.post('/folders', folderForm);
        toast.success('Carpeta creada');
      }
      setShowFolderModal(false);
      setEditingFolder(null);
      setFolderForm({ nombre: '', descripcion: '' });
      fetchData();
    } catch (error) {
      toast.error('Error al guardar carpeta');
    }
  };

  const openEditFolder = (f) => {
    setEditingFolder(f);
    setFolderForm({ nombre: f.nombre, descripcion: f.descripcion || '' });
    setShowFolderModal(true);
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm('Eliminar esta carpeta? Los manuales dentro se mantendran pero quedaran sin carpeta.')) {
      try {
        await API.delete("/folders/" + id);
        toast.success('Carpeta eliminada');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const openAssignFolder = (f) => {
    setSelectedFolder(f);
    var assignedIds = (f.usuarios || []).map(function(u) { return u.id; });
    setSelectedFolderUsers(assignedIds);
    setShowFolderAssignModal(true);
  };

  const toggleFolderUser = (userId) => {
    setSelectedFolderUsers(function(prev) {
      return prev.includes(userId) ? prev.filter(function(id) { return id !== userId; }) : prev.concat([userId]);
    });
  };

  const handleSaveFolderAssign = async () => {
    try {
      await API.post("/folders/" + selectedFolder.id + "/usuarios", { usuarios: selectedFolderUsers });
      toast.success('Carpeta asignada correctamente');
      setShowFolderAssignModal(false);
      setSelectedFolder(null);
      setSelectedFolderUsers([]);
      fetchData();
    } catch (error) {
      toast.error('Error al asignar carpeta');
    }
  };

  const exportUsersToExcel = () => {
    const data = users.filter(function(u) { return u.rol !== 'admin'; }).map(function(u) {
      const assigned = manuals.filter(function(m) {
        return m.asignados && m.asignados.some(function(a) { return a.id === u.id; });
      });
      return {
        'Nombre': u.nombre,
        'Email': u.email,
        'Departamento': u.departamento,
        'Estado': u.activo ? 'Activo' : 'Inactivo',
        'Manuales Asignados': assigned.length,
        'Titulos de Manuales': assigned.map(function(m) { return m.titulo; }).join(', ')
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    ws['!cols'] = [
      { wch: 30 }, { wch: 35 }, { wch: 20 }, { wch: 10 }, { wch: 18 }, { wch: 50 }
    ];
    XLSX.writeFile(wb, 'Usuarios_Fibextelecom.xlsx');
    toast.success('Archivo Excel descargado');
  };

  const exportManualsToExcel = () => {
    const data = manuals.map(function(m) {
      return {
        'Manual': m.titulo,
        'Categoria': m.categoria,
        'Descripcion': m.descripcion || '',
        'Usuarios Asignados': (m.asignados || []).length,
        'Nombres': (m.asignados || []).map(function(a) { return a.nombre; }).join(', '),
        'Subido por': m.subidoPorUser ? m.subidoPorUser.nombre : '',
        'Fecha': new Date(m.created_at).toLocaleDateString('es-VE')
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manuales');
    ws['!cols'] = [
      { wch: 35 }, { wch: 18 }, { wch: 40 }, { wch: 20 }, { wch: 40 }, { wch: 25 }, { wch: 12 }
    ];
    XLSX.writeFile(wb, 'Manuales_Fibextelecom.xlsx');
    toast.success('Archivo Excel descargado');
  };

  const openEditManual = (manual) => {
    setEditingManual(manual);
    setManualForm({
      titulo: manual.titulo,
      descripcion: manual.descripcion,
      categoria: manual.categoria,
      archivo: null,
      folder_id: manual.folder_id || ''
    });
    setShowUploadModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      nombre: u.nombre, email: u.email, password: '',
      rol: u.rol, departamento: u.departamento
    });
    var assignedIds = manuals
      .filter(function(m) { return m.asignados && m.asignados.some(function(a) { return a.id === u.id; }); })
      .map(function(m) { return m.id; });
    setUserFormManuals(assignedIds);
    setShowUserModal(true);
  };

  const openAssignToUser = (u) => {
    setSelectedUser(u);
    var assignedIds = manuals
      .filter(function(m) { return m.asignados && m.asignados.some(function(a) { return a.id === u.id; }); })
      .map(function(m) { return m.id; });
    setSelectedManuals(assignedIds);
    setShowAssignModal(true);
  };

  const toggleManualSelection = (manualId) => {
    setSelectedManuals(function(prev) {
      return prev.includes(manualId) ? prev.filter(function(id) { return id !== manualId; }) : prev.concat([manualId]);
    });
  };

  const filteredManuals = manuals.filter(function(m) {
    if (categoriaFiltro !== 'Todas' && m.categoria !== categoriaFiltro) return false;
    return m.titulo.toLowerCase().includes(search.toLowerCase());
  });

  const filteredUsers = users.filter(function(u) {
    return u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
  });

  const handleDownload = (filename, titulo) => {
    var token = localStorage.getItem('token');
    var baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
    fetch(baseUrl + "/api/manuals/download/" + filename, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function(res) { return res.blob(); })
      .then(function(blob) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = titulo + '.pdf';
        a.click();
      });
  };

  const getCategoriaColor = (cat) => {
    var colors = {
      'Manuales': 'primary', 'Instructivo': 'success'
    };
    return colors[cat] || 'secondary';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', position: 'relative' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f2440, #1c3d5a)', padding: '20px 0' }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img src="/logo-fibex.jpg" alt="Fibex Telecom"
                style={{ height: '45px', marginRight: '15px', borderRadius: '8px' }} />
              <div>
                <h4 style={{ color: 'white', fontWeight: '700', margin: 0 }}>
                  <FiShield className="me-2" />Panel Administrativo
                </h4>
                <small style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <FiCpu className="me-1" />Departamento de Sistemas
                </small>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', marginTop: '2px' }}>
                  Elaborado por Paulimar
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="text-white text-end d-none d-md-block">
                <div style={{ fontWeight: '600' }}>{user?.nombre}</div>
                <small style={{ opacity: 0.7 }}><FiUser className="me-1" />Administrador</small>
              </div>
              <Button variant="outline-light" size="sm"
                onClick={() => { logout(); navigate('/login'); }}
                style={{ borderRadius: '8px' }}>
                <FiLogOut />
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {(() => {
          var conteoCat = {};
          manuals.forEach(function(m) { conteoCat[m.categoria] = (conteoCat[m.categoria] || 0) + 1; });
          var categoriasUsadas = Object.keys(conteoCat);
          var tarjetas = categoriasUsadas.map(function(c) {
            return { icon: c === 'Instructivo' ? <FiCpu size={28} /> : <FiFileText size={28} />, label: c, value: conteoCat[c], color: c === 'Instructivo' ? '#00aa66' : '#0066cc' };
          });
          tarjetas.push({ icon: <FiUsers size={28} />, label: 'Usuarios', value: users.filter(function(u) { return u.rol !== 'admin'; }).length, color: '#ff6600' });
          return (
            <Row className="mb-4">
              {tarjetas.map((stat, i) => (
                <Col md={4} key={i} className="mb-3">
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Card.Body className="d-flex align-items-center">
                      <div style={{
                        width: '60px', height: '60px', background: stat.color + '15',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: stat.color
                      }}>
                        {stat.icon}
                      </div>
                      <div className="ms-3">
                        <h3 style={{ fontWeight: '700', margin: 0, color: '#0a1628' }}>{stat.value}</h3>
                        <small style={{ color: '#888' }}>{stat.label}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          );
        })()}

        <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <Card.Body className="p-4">
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
              <Tab eventKey="manuales" title={<span><FiFileText className="me-1" /> Documentos</span>} />
              <Tab eventKey="usuarios" title={<span><FiUsers className="me-1" /> Usuarios</span>} />
              <Tab eventKey="carpetas" title={<span><FiFolder className="me-1" /> Carpetas</span>} />
              <Tab eventKey="actividad" title={<span><FiActivity className="me-1" /> Actividad</span>} />
            </Tabs>

            {activeTab === 'manuales' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <InputGroup style={{ maxWidth: '400px', borderRadius: '10px', overflow: 'hidden' }}>
                    <InputGroup.Text style={{ background: 'white', border: 'none' }}><FiSearch /></InputGroup.Text>
                    <Form.Control placeholder="Buscar manual..." value={search}
                      onChange={(e) => setSearch(e.target.value)} style={{ border: 'none' }} />
                  </InputGroup>
                  <Form.Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}
                    style={{ maxWidth: '200px', borderRadius: '10px', padding: '8px 15px' }}>
                    <option value="Todas">Todas las categorias</option>
                    <option value="Manuales">Manuales</option>
                    <option value="Instructivo">Instructivo</option>
                  </Form.Select>
                  <div className="d-flex gap-2">
                    <Button onClick={exportManualsToExcel} variant="outline-success"
                      style={{ borderRadius: '10px', padding: '8px 15px' }}>
                      <FiDownload className="me-1" /> Excel
                    </Button>
                    <Button onClick={() => {
                      setEditingManual(null);
                      setManualForm({ titulo: '', descripcion: '', categoria: 'Instructivo', archivo: null, folder_id: '' });
                      setShowUploadModal(true);
                    }} style={{
                      background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                      border: 'none', borderRadius: '10px', padding: '8px 20px'
                    }}>
                      <FiUpload className="me-1" /> Subir Manual
                    </Button>
                  </div>
                </div>

                <Table responsive hover style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th><FiFileText className="me-1" /> Manual</th>
                      <th><FiGrid className="me-1" /> Categoria</th>
                      <th><FiFolder className="me-1" /> Carpeta</th>
                      <th><FiUsers className="me-1" /> Asignados</th>
                      <th>Fecha</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManuals.map((manual) => (
                      <tr key={manual.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div style={{
                              width: '36px', height: '36px',
                              background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <FiFileText size={18} color="white" />
                            </div>
                            <div className="ms-2">
                              <div style={{ fontWeight: '600' }}>{manual.titulo}</div>
                              <small style={{ color: '#888' }}>{manual.nombre_original}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getCategoriaColor(manual.categoria)} style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            {catIcons[manual.categoria]} {manual.categoria}
                          </Badge>
                        </td>
                        <td>
                          {manual.folder_id ? (
                            (function() {
                              var f = folders.find(function(folder) { return folder.id === manual.folder_id; });
                              return f
                                ? <Badge bg="warning" text="dark" style={{ borderRadius: '6px' }}><FiFolder className="me-1" />{f.nombre}</Badge>
                                : <small style={{ color: '#aaa' }}>-</small>;
                            })()
                          ) : (
                            <small style={{ color: '#aaa' }}>Sin carpeta</small>
                          )}
                        </td>
                        <td><Badge bg="info" style={{ borderRadius: '6px' }}>{manual.asignados?.length || 0} usuario(s)</Badge></td>
                        <td><small>{new Date(manual.created_at).toLocaleDateString('es-VE')}</small></td>
                        <td>
                          <ButtonGroup size="sm" className="float-end">
                            <Button variant="outline-primary" onClick={() => openEditManual(manual)} title="Editar"><FiEdit2 /></Button>
                            <Button variant="outline-success" onClick={() => handleDownload(manual.archivo, manual.titulo)} title="Descargar"><FiDownload /></Button>
                            <Button variant="outline-danger" onClick={() => handleDeleteManual(manual.id)} title="Eliminar"><FiTrash2 /></Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            {activeTab === 'usuarios' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <InputGroup style={{ maxWidth: '400px', borderRadius: '10px', overflow: 'hidden' }}>
                    <InputGroup.Text style={{ background: 'white', border: 'none' }}><FiSearch /></InputGroup.Text>
                    <Form.Control placeholder="Buscar usuario..." value={search}
                      onChange={(e) => setSearch(e.target.value)} style={{ border: 'none' }} />
                  </InputGroup>
                  <div className="d-flex gap-2">
                    <Button onClick={exportUsersToExcel} variant="outline-success"
                      style={{ borderRadius: '10px', padding: '8px 15px' }}>
                      <FiDownload className="me-1" /> Excel
                    </Button>
                    <Button onClick={() => {
                      setEditingUser(null);
                      setUserForm({ nombre: '', email: '', password: '', rol: 'usuario', departamento: 'Sistemas' });
                      setUserFormManuals([]);
                      setShowUserModal(true);
                    }} style={{
                      background: 'linear-gradient(135deg, #00aa66, #00cc88)',
                      border: 'none', borderRadius: '10px', padding: '8px 20px'
                    }}>
                      <FiPlus className="me-1" /> Crear Usuario
                    </Button>
                  </div>
                </div>

                <Table responsive hover style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th><FiUser className="me-1" /> Usuario</th>
                      <th>Rol</th>
                      <th><FiGlobe className="me-1" /> Departamento</th>
                      <th><FiFileText className="me-1" /> Manuales</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      var assignedCount = manuals.filter(function(m) {
                        return m.asignados && m.asignados.some(function(a) { return a.id === u.id; });
                      }).length;
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div style={{
                                width: '36px', height: '36px',
                                background: u.rol === 'admin' ? '#ff6600' : '#00aa66',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <FiUser size={18} color="white" />
                              </div>
                              <div className="ms-2">
                                <div style={{ fontWeight: '600' }}>{u.nombre}</div>
                                <small style={{ color: '#888' }}>{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={u.rol === 'admin' ? 'warning' : 'secondary'}
                              text={u.rol === 'admin' ? 'dark' : 'white'}
                              style={{ borderRadius: '6px' }}>
                              {u.rol === 'admin' ? <><FiShield className="me-1" />Admin</> : <><FiUser className="me-1" />Usuario</>}
                            </Badge>
                          </td>
                          <td>{u.departamento}</td>
                          <td>
                            {u.rol !== 'admin' && (
                              <Badge bg={assignedCount > 0 ? 'success' : 'secondary'}
                                style={{ borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => openAssignToUser(u)}>
                                <FiFileText className="me-1" />{assignedCount} manual(es)
                              </Badge>
                            )}
                          </td>
                          <td>
                            <ButtonGroup size="sm" className="float-end">
                              {u.rol !== 'admin' && (
                                <Button variant="outline-info" onClick={() => openAssignToUser(u)}
                                  title="Asignar manuales">
                                  <FiFileText />
                                </Button>
                              )}
                              <Button variant="outline-primary" onClick={() => openEditUser(u)} title="Editar"><FiEdit2 /></Button>
                              <Button variant="outline-danger" onClick={() => handleDeleteUser(u.id)} title="Eliminar"><FiTrash2 /></Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            )}

            {activeTab === 'carpetas' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 style={{ fontWeight: '700', color: '#0a1628', margin: 0 }}>
                    <FiFolder className="me-1" /> Carpetas de manuales
                  </h6>
                  <Button onClick={() => {
                    setEditingFolder(null);
                    setFolderForm({ nombre: '', descripcion: '' });
                    setShowFolderModal(true);
                  }} style={{
                    background: 'linear-gradient(135deg, #ff6600, #ff9900)',
                    border: 'none', borderRadius: '10px', padding: '8px 20px'
                  }}>
                    <FiFolderPlus className="me-1" /> Nueva Carpeta
                  </Button>
                </div>

                {folders.length === 0 ? (
                  <Card style={{ border: 'none', borderRadius: '16px', textAlign: 'center', padding: '50px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <FiFolder size={50} color="#ccc" />
                    <h5 className="mt-3" style={{ color: '#666' }}>No hay carpetas creadas</h5>
                    <p style={{ color: '#999' }}>
                      Crea carpetas (ej: "SAE", "Instructivos SAE") y asignalas a los usuarios
                    </p>
                  </Card>
                ) : (
                  <Row>
                    {folders.map((f) => (
                      <Col lg={4} md={6} key={f.id} className="mb-4">
                        <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', height: '100%' }}>
                          <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                              <div style={{
                                width: '48px', height: '48px',
                                background: 'linear-gradient(135deg, #ff6600, #ff9900)',
                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <FiFolder size={24} color="white" />
                              </div>
                              <div className="ms-3">
                                <h6 style={{ fontWeight: '700', margin: 0, color: '#0a1628' }}>{f.nombre}</h6>
                                <small style={{ color: '#888' }}>{f.manuales?.length || 0} manual(es)</small>
                              </div>
                            </div>
                            {f.descripcion && <p style={{ color: '#666', fontSize: '0.85rem' }}>{f.descripcion}</p>}
                            <div className="mb-3">
                              <Badge bg={f.usuarios?.length > 0 ? 'success' : 'secondary'}
                                style={{ cursor: 'pointer', borderRadius: '6px' }}
                                onClick={() => openAssignFolder(f)}>
                                <FiUsers className="me-1" />{f.usuarios?.length || 0} usuario(s)
                              </Badge>
                            </div>
                            {f.manuales && f.manuales.length > 0 && (
                              <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
                                {f.manuales.map(function(m) {
                                  return (
                                    <div key={m.id} style={{ fontSize: '0.8rem', color: '#666', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                                      <FiFileText className="me-1" style={{ color: '#0066cc' }} />{m.titulo}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div className="d-flex gap-2">
                              <Button variant="outline-info" size="sm" onClick={() => openAssignFolder(f)}
                                style={{ borderRadius: '8px' }}><FiUsers className="me-1" />Asignar</Button>
                              <Button variant="outline-primary" size="sm" onClick={() => openEditFolder(f)}
                                style={{ borderRadius: '8px' }}><FiEdit2 className="me-1" />Editar</Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFolder(f.id)}
                                style={{ borderRadius: '8px' }}><FiTrash2 className="me-1" /></Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {activeTab === 'actividad' && (
              <>
                <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>
                  <FiActivity className="me-2" />Actividad de Usuarios
                </h5>

                <Row className="mb-4">
                  <Col md={6}>
                    <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                      <Card.Body>
                        <h6 style={{ fontWeight: '700', color: '#0a1628' }}>
                          <FiUsers className="me-1" /> Por Usuario
                        </h6>
                        {activityStats.porUsuario.length === 0 ? (
                          <p style={{ color: '#999' }}>Sin actividad aun</p>
                        ) : (
                          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {activityStats.porUsuario.map((u) => (
                              <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px', borderBottom: '1px solid #f0f0f0'
                              }}>
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{u.nombre}</div>
                                  <small style={{ color: '#888' }}>{u.email}</small>
                                </div>
                                <div className="text-end">
                                  <Badge bg="info" style={{ borderRadius: '6px', marginRight: '4px' }}>
                                    <FiEye className="me-1" />{u.previews} vista(s)
                                  </Badge>
                                  <Badge bg="success" style={{ borderRadius: '6px' }}>
                                    <FiDownload className="me-1" />{u.descargas} desc.
                                  </Badge>
                                  {u.ultimo_acceso && (
                                    <div><small style={{ color: '#aaa' }}><FiClock className="me-1" />{new Date(u.ultimo_acceso).toLocaleString('es-VE')}</small></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                      <Card.Body>
                        <h6 style={{ fontWeight: '700', color: '#0a1628' }}>
                          <FiFileText className="me-1" /> Por Manual
                        </h6>
                        {activityStats.porManual.length === 0 ? (
                          <p style={{ color: '#999' }}>Sin actividad aun</p>
                        ) : (
                          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {activityStats.porManual.map((m) => (
                              <div key={m.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px', borderBottom: '1px solid #f0f0f0'
                              }}>
                                <div>
                                  <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.titulo}</div>
                                  <Badge bg={getCategoriaColor(m.categoria)} style={{ fontSize: '0.65rem' }}>
                                    {m.categoria}
                                  </Badge>
                                </div>
                                <div className="text-end">
                                  <Badge bg="info" style={{ borderRadius: '6px', marginRight: '4px' }}>
                                    <FiEye className="me-1" />{m.previews}
                                  </Badge>
                                  <Badge bg="success" style={{ borderRadius: '6px' }}>
                                    <FiDownload className="me-1" />{m.descargas}
                                  </Badge>
                                  <div><small style={{ color: '#aaa' }}>{m.usuarios_unicos} usuario(s) unico(s)</small></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <Card.Body>
                    <h6 style={{ fontWeight: '700', color: '#0a1628', marginBottom: '15px' }}>
                      <FiClock className="me-1" /> Historial Reciente
                    </h6>
                    {activityLogs.length === 0 ? (
                      <p style={{ color: '#999' }}>Sin registros de actividad</p>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Table hover size="sm">
                          <thead>
                            <tr>
                              <th>Usuario</th>
                              <th>Manual</th>
                              <th>Accion</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activityLogs.map((log) => (
                              <tr key={log.id}>
                                <td>
                                  <span style={{ fontWeight: '500' }}>{log.user_nombre}</span>
                                  <br /><small style={{ color: '#888' }}>{log.user_email}</small>
                                </td>
                                <td>{log.manual_titulo} <Badge bg={getCategoriaColor(log.manual_categoria)} style={{ fontSize: '0.6rem' }}>{log.manual_categoria}</Badge></td>
                                <td>
                                  {log.accion === 'preview' ? (
                                    <Badge bg="info"><FiEye className="me-1" />Vista previa</Badge>
                                  ) : (
                                    <Badge bg="success"><FiDownload className="me-1" />Descarga</Badge>
                                  )}
                                </td>
                                <td><small>{new Date(log.created_at).toLocaleString('es-VE')}</small></td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showUploadModal} onHide={() => { setShowUploadModal(false); setEditingManual(null); }}
        size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '20px 25px' }}>
          <Modal.Title style={{ fontWeight: '700' }}>
            <FiUpload className="me-2" />
            {editingManual ? 'Editar Manual' : 'Subir Nuevo Manual'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUploadManual}>
          <Modal.Body style={{ padding: '0 25px' }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiFileText className="me-1" /> Titulo del manual</Form.Label>
              <Form.Control value={manualForm.titulo}
                onChange={(e) => setManualForm({ ...manualForm, titulo: e.target.value })}
                placeholder="Ej: Configuracion de Router MikroTik"
                required style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiBook className="me-1" /> Descripcion</Form.Label>
              <Form.Control as="textarea" rows={3} value={manualForm.descripcion}
                onChange={(e) => setManualForm({ ...manualForm, descripcion: e.target.value })}
                placeholder="Breve descripcion del contenido..."
                style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600' }}><FiGrid className="me-1" /> Categoria</Form.Label>
                  <Form.Select value={manualForm.categoria}
                    onChange={(e) => setManualForm({ ...manualForm, categoria: e.target.value })}
                    style={{ borderRadius: '10px', padding: '10px 15px' }}>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600' }}><FiFolder className="me-1" /> Carpeta (opcional)</Form.Label>
                  <Form.Select value={manualForm.folder_id}
                    onChange={(e) => setManualForm({ ...manualForm, folder_id: e.target.value })}
                    style={{ borderRadius: '10px', padding: '10px 15px' }}>
                    <option value="">Sin carpeta</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              {!editingManual && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600' }}><FiHardDrive className="me-1" /> Archivo PDF</Form.Label>
                    <Form.Control type="file" accept=".pdf"
                      onChange={(e) => setManualForm({ ...manualForm, archivo: e.target.files[0] })}
                      required style={{ borderRadius: '10px', padding: '10px 15px' }} />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: 'none', padding: '15px 25px' }}>
            <Button variant="secondary" onClick={() => { setShowUploadModal(false); setEditingManual(null); }}
              style={{ borderRadius: '8px' }}>Cancelar</Button>
            <Button type="submit" style={{
              background: 'linear-gradient(135deg, #0066cc, #00aaff)',
              border: 'none', borderRadius: '8px'
            }}><FiUpload className="me-1" /> {editingManual ? 'Guardar Cambios' : 'Subir Manual'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showUserModal} onHide={() => { setShowUserModal(false); setEditingUser(null); setUserFormManuals([]); }} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '20px 25px' }}>
          <Modal.Title style={{ fontWeight: '700' }}>
            <FiUsers className="me-2" />
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveUser}>
          <Modal.Body style={{ padding: '0 25px' }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiUser className="me-1" /> Nombre completo</Form.Label>
              <Form.Control value={userForm.nombre}
                onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                placeholder="Nombre del empleado" required
                style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiGlobe className="me-1" /> Correo electronico</Form.Label>
              <Form.Control type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="usuario@fibextelecom.com" required
                style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}>
                <FiLock className="me-1" /> Contrasena {editingUser && '(dejar vacio para no cambiar)'}
              </Form.Label>
              <Form.Control type="password" value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder={editingUser ? 'Dejar vacio para mantener' : 'Contrasena'}
                required={!editingUser}
                style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600' }}><FiShield className="me-1" /> Rol</Form.Label>
                  <Form.Select value={userForm.rol}
                    onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                    style={{ borderRadius: '10px', padding: '10px 15px' }}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '600' }}><FiGlobe className="me-1" /> Departamento</Form.Label>
                  <Form.Control value={userForm.departamento}
                    onChange={(e) => setUserForm({ ...userForm, departamento: e.target.value })}
                    style={{ borderRadius: '10px', padding: '10px 15px' }} />
                </Form.Group>
              </Col>
            </Row>
            {userForm.rol !== 'admin' && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '600' }}>
                  <FiFileText className="me-1" /> Manuales asignados
                </Form.Label>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                  {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).map((m) => (
                    <div key={m.id} onClick={() => {
                      setUserFormManuals(function(prev) {
                        return prev.includes(m.id) ? prev.filter(function(id) { return id !== m.id; }) : prev.concat([m.id]);
                      });
                    }} style={{
                      display: 'flex', alignItems: 'center', padding: '8px 10px',
                      marginBottom: '4px', borderRadius: '8px',
                      border: userFormManuals.includes(m.id) ? '2px solid #0066cc' : '1px solid #eee',
                      background: userFormManuals.includes(m.id) ? '#f0f7ff' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      <input type="checkbox" checked={userFormManuals.includes(m.id)} readOnly style={{ marginRight: '10px' }} />
                      <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{m.titulo}</span>
                      <Badge bg={getCategoriaColor(m.categoria)} style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                        {m.categoria}
                      </Badge>
                    </div>
                  ))}
                  {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).length === 0 && (
                    <p style={{ color: '#999', textAlign: 'center', margin: 0 }}>No hay manuales disponibles</p>
                  )}
                </div>
                <small style={{ color: '#888' }}>{userFormManuals.length} manual(es) seleccionado(s)</small>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: 'none', padding: '15px 25px' }}>
            <Button variant="secondary" onClick={() => { setShowUserModal(false); setEditingUser(null); setUserFormManuals([]); }}
              style={{ borderRadius: '8px' }}>Cancelar</Button>
            <Button type="submit" style={{
              background: 'linear-gradient(135deg, #00aa66, #00cc88)',
              border: 'none', borderRadius: '8px'
            }}><FiUser className="me-1" /> {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showAssignModal} onHide={() => { setShowAssignModal(false); setSelectedUser(null); setSelectedManuals([]); }}
        size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '20px 25px' }}>
          <Modal.Title style={{ fontWeight: '700' }}>
            <FiFileText className="me-2" />
            Asignar manuales a: {selectedUser?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0 25px' }}>
          <p style={{ color: '#666' }}>Selecciona los manuales que <strong>{selectedUser?.nombre}</strong> podra ver:</p>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).map((m) => (
              <div key={m.id} onClick={() => toggleManualSelection(m.id)} style={{
                display: 'flex', alignItems: 'center', padding: '12px 15px',
                marginBottom: '8px', borderRadius: '10px',
                border: selectedManuals.includes(m.id) ? '2px solid #0066cc' : '2px solid #e0e0e0',
                background: selectedManuals.includes(m.id) ? '#f0f7ff' : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'linear-gradient(135deg, #0066cc, #00aaff)',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiFileText size={20} color="white" />
                </div>
                <div className="ms-3" style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{m.titulo}</div>
                  <small style={{ color: '#888' }}>
                    <Badge bg={getCategoriaColor(m.categoria)} style={{ fontSize: '0.7rem', marginRight: '8px' }}>
                      {catIcons[m.categoria]} {m.categoria}
                    </Badge>
                    {m.asignados?.length || 0} usuario(s)
                  </small>
                </div>
                {selectedManuals.includes(m.id) && <FiCheck size={22} color="#0066cc" />}
              </div>
            ))}
          </div>
          <div className="mt-3 text-muted">
            <small><FiFileText className="me-1" />{selectedManuals.length} manual(es) seleccionado(s)</small>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none', padding: '15px 25px' }}>
          <Button variant="secondary" onClick={() => { setShowAssignModal(false); setSelectedManuals([]); }}
            style={{ borderRadius: '8px' }}>Cancelar</Button>
          <Button onClick={handleAssign} style={{
            background: 'linear-gradient(135deg, #0066cc, #00aaff)',
            border: 'none', borderRadius: '8px'
          }}>
            <FiCheck className="me-1" /> Guardar Asignacion
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFolderModal} onHide={() => { setShowFolderModal(false); setEditingFolder(null); }} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '20px 25px' }}>
          <Modal.Title style={{ fontWeight: '700' }}>
            <FiFolder className="me-2" />
            {editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveFolder}>
          <Modal.Body style={{ padding: '0 25px' }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiFolder className="me-1" /> Nombre de la carpeta</Form.Label>
              <Form.Control value={folderForm.nombre}
                onChange={(e) => setFolderForm({ ...folderForm, nombre: e.target.value })}
                placeholder="Ej: SAE, Instructivos SAE, Manuales Tecnicos"
                required style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '600' }}><FiBook className="me-1" /> Descripcion (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={folderForm.descripcion}
                onChange={(e) => setFolderForm({ ...folderForm, descripcion: e.target.value })}
                placeholder="Para que sirve esta carpeta?"
                style={{ borderRadius: '10px', padding: '10px 15px' }} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: 'none', padding: '15px 25px' }}>
            <Button variant="secondary" onClick={() => { setShowFolderModal(false); setEditingFolder(null); }}
              style={{ borderRadius: '8px' }}>Cancelar</Button>
            <Button type="submit" style={{
              background: 'linear-gradient(135deg, #ff6600, #ff9900)',
              border: 'none', borderRadius: '8px'
            }}><FiCheck className="me-1" /> {editingFolder ? 'Guardar Cambios' : 'Crear Carpeta'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showFolderAssignModal} onHide={() => { setShowFolderAssignModal(false); setSelectedFolder(null); setSelectedFolderUsers([]); }}
        size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: 'none', padding: '20px 25px' }}>
          <Modal.Title style={{ fontWeight: '700' }}>
            <FiUsers className="me-2" />
            Asignar carpeta: {selectedFolder?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0 25px' }}>
          <p style={{ color: '#666' }}>Selecciona los usuarios que podran ver los manuales de esta carpeta:</p>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {users.filter(function(u) { return u.rol !== 'admin'; }).map((u) => (
              <div key={u.id} onClick={() => toggleFolderUser(u.id)} style={{
                display: 'flex', alignItems: 'center', padding: '12px 15px',
                marginBottom: '8px', borderRadius: '10px',
                border: selectedFolderUsers.includes(u.id) ? '2px solid #ff6600' : '2px solid #e0e0e0',
                background: selectedFolderUsers.includes(u.id) ? '#fff7f0' : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '40px', height: '40px', background: '#00aa66',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FiUser size={20} color="white" />
                </div>
                <div className="ms-3" style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{u.nombre}</div>
                  <small style={{ color: '#888' }}>{u.email}</small>
                </div>
                {selectedFolderUsers.includes(u.id) && <FiCheck size={22} color="#ff6600" />}
              </div>
            ))}
          </div>
          <div className="mt-3 text-muted">
            <small><FiUsers className="me-1" />{selectedFolderUsers.length} usuario(s) seleccionado(s)</small>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none', padding: '15px 25px' }}>
          <Button variant="secondary" onClick={() => { setShowFolderAssignModal(false); setSelectedFolderUsers([]); }}
            style={{ borderRadius: '8px' }}>Cancelar</Button>
          <Button onClick={handleSaveFolderAssign} style={{
            background: 'linear-gradient(135deg, #ff6600, #ff9900)',
            border: 'none', borderRadius: '8px'
          }}>
            <FiCheck className="me-1" /> Guardar Asignacion
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Admin;
