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
  FiPrinter, FiBook, FiLock, FiEye, FiClock, FiFolder, FiFolderPlus, FiX
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
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const categorias = [
    'Manuales', 'Instructivo'
  ];

  const categoriasExistentes = [...new Set(categorias.concat(manuals.map(function(m) { return m.categoria; })))];

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
    let categoriaFinal = manualForm.categoria;
    if (categoriaFinal === '__nueva__') {
      if (!nuevaCategoria.trim()) {
        toast.error('Escribe el nombre de la nueva categoria');
        return;
      }
      categoriaFinal = nuevaCategoria.trim();
    }
    const formData = new FormData();
    formData.append('titulo', manualForm.titulo);
    formData.append('descripcion', manualForm.descripcion);
    formData.append('categoria', categoriaFinal);
    if (manualForm.folder_id) formData.append('folder_id', manualForm.folder_id);
    if (manualForm.archivo) formData.append('archivo', manualForm.archivo);
    try {
      if (editingManual) {
        await API.put("/manuals/" + editingManual.id, {
          titulo: manualForm.titulo,
          descripcion: manualForm.descripcion,
          categoria: categoriaFinal,
          folder_id: manualForm.folder_id || null
        });
        toast.success('Manual actualizado');
      } else {
        await API.post('/manuals', formData);
        toast.success('Manual subido exitosamente');
      }
      setShowUploadModal(false);
      setEditingManual(null);
      setNuevaCategoria('');
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

  const conteoCat = {};
  manuals.forEach(function(m) { conteoCat[m.categoria] = (conteoCat[m.categoria] || 0) + 1; });
  const totalManuales = manuals.length;
  const totalInstructivos = conteoCat['Instructivo'] || 0;
  const totalUsuarios = users.filter(function(u) { return u.rol !== 'admin'; }).length;
  const totalCarpetas = folders.length;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
    
    :root{
      --bg:#070d12; --bg2:#0c151d; --surface:#0f1b26; --surface2:#16283a;
      --border:#1e3549; --border2:#2a4a66;
      --violet:#1899ff; --violet-light:#38b6ff; --magenta:#00c896;
      --cyan:#22d3ee; --lime:#a3e635;
      --ink:#e5f2ff; --muted:#8ba3bd; --faint:#5a7089;
      --green:#2dd4a7; --orange:#f59e0b; --red:#f05252; --amber:#f59e0b;
      --radius:16px; --radius-lg:22px;
      --shadow:0 12px 40px rgba(0,0,0,.45);
      --shadow-sm:0 2px 10px rgba(0,0,0,.3);
      --grad:linear-gradient(135deg,#1899ff,#00c896);
      --grad-soft:linear-gradient(135deg,rgba(24,153,255,.15),rgba(0,200,150,.15));
    }
    *{-webkit-font-smoothing:antialiased}
    .admin-dark{font-family:'Space Grotesk',system-ui,sans-serif;background:var(--bg)!important;color:var(--ink)!important;min-height:100vh}
    ::selection{background:var(--violet);color:#fff}
    ::-webkit-scrollbar{width:9px;height:9px}
    ::-webkit-scrollbar-track{background:var(--bg2)}
    ::-webkit-scrollbar-thumb{background:#3a2f6b;border-radius:9px}
    ::-webkit-scrollbar-thumb:hover{background:var(--violet)}
    
    .admin-app{display:flex;min-height:100vh;position:relative}
    .admin-app::before,.admin-app::after{content:'';position:fixed;border-radius:50%;filter:blur(90px);z-index:0;pointer-events:none}
    .admin-app::before{width:520px;height:520px;background:rgba(24,153,255,.16);top:-120px;right:-80px}
    .admin-app::after{width:460px;height:460px;background:rgba(0,200,150,.12);bottom:-120px;left:10%}
    .admin-sidebar,.admin-main{position:relative;z-index:1}
    
    .admin-sidebar{width:264px;flex-shrink:0;background:linear-gradient(180deg,#161130,#0f0b1f);color:#fff;position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column;border-right:1px solid var(--border)}
    .admin-brand{padding:24px 22px;display:flex;align-items:center;gap:13px;border-bottom:1px solid var(--border)}
    .admin-brand img{width:44px;height:44px;border-radius:13px;object-fit:cover;box-shadow:0 0 0 2px rgba(24,153,255,.4),0 8px 20px rgba(24,153,255,.35)}
    .admin-brand .bt{line-height:1.15}
    .admin-brand .bt strong{font-size:16px;font-weight:700;display:block}
    .admin-brand .bt small{font-size:11px;color:var(--muted)}
    .admin-nav{padding:18px 14px;flex:1}
    .admin-nav-label{font-size:10.5px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);padding:16px 12px 8px;font-weight:600}
    .admin-nav a{display:flex;align-items:center;gap:13px;color:#c9c2ea;text-decoration:none;padding:12px 13px;border-radius:12px;font-size:13.5px;font-weight:500;transition:.18s;margin-bottom:4px;cursor:pointer;border:1px solid transparent}
    .admin-nav a:hover{background:var(--surface);color:#fff;border-color:var(--border)}
    .admin-nav a.active{background:var(--grad);color:#fff;border-color:transparent;box-shadow:-4px 6px 24px rgba(24,153,255,.4)}
    .admin-nav a i{font-size:18px;width:22px;text-align:center}
    .admin-nav a .cnt{margin-left:auto;background:rgba(255,255,255,.14);font-size:11px;padding:2px 9px;border-radius:20px}
    .admin-sidebar .foot{padding:16px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--muted)}
    
    .admin-main{flex:1;min-width:0;display:flex;flex-direction:column}
    
    .admin-hero{padding:34px 32px 30px;position:relative;overflow:hidden;background:radial-gradient(circle at 80% 10%,rgba(24,153,255,.25),transparent 45%),radial-gradient(circle at 12% 110%,rgba(0,200,150,.2),transparent 50%),linear-gradient(180deg,#161130,#0f0b1f);border-bottom:1px solid var(--border)}
    .admin-hero .deco{position:absolute;font-size:90px;color:rgba(24,153,255,.12);top:0;right:8%;transform:rotate(-12deg);pointer-events:none}
    .admin-hero h2{margin:0 0 6px;font-weight:700;font-size:26px;display:flex;align-items:center;gap:12px}
    .admin-hero h2 .badge-icon{width:46px;height:46px;border-radius:14px;background:var(--grad);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(24,153,255,.45)}
    .admin-hero .sub{color:var(--muted);font-size:13.5px}
    .admin-hero .crumb{font-size:12px;color:var(--muted);letter-spacing:.4px;margin-bottom:10px}
    .admin-hero .crumb i{color:var(--violet)}
    .user-chip{display:flex;align-items:center;gap:13px}
    .user-chip .avatar{width:42px;height:42px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;box-shadow:0 0 0 3px rgba(24,153,255,.3),0 8px 20px rgba(0,0,0,.4)}
    .user-chip .nm{font-weight:600;font-size:13.5px}
    .user-chip .rl{font-size:11.5px;color:var(--muted)}
    .user-chip .btn{width:40px;height:40px;border-radius:11px;border:1px solid var(--border);background:var(--surface);color:#c9c2ea}
    .user-chip .btn:hover{color:#fff;border-color:var(--violet)}
    
    .admin-content{padding:28px 32px;flex:1}
    
    .kpi{background:linear-gradient(180deg,var(--surface),#120e24);border-radius:var(--radius-lg);border:1px solid var(--border);padding:22px;display:flex;align-items:center;gap:17px;transition:.22s;position:relative;overflow:hidden}
    .kpi::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);opacity:0;transition:.22s}
    .kpi:hover{transform:translateY(-4px);border-color:var(--border2);box-shadow:var(--shadow)}
    .kpi:hover::after{opacity:1}
    .kpi .ic{width:60px;height:60px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:26px}
    .kpi .ic.doc{background:rgba(24,153,255,.16);color:var(--violet-light)}
    .kpi .ic.instr{background:rgba(52,211,153,.13);color:var(--green)}
    .kpi .ic.usr{background:rgba(0,200,150,.15);color:var(--magenta)}
    .kpi .ic.fld{background:rgba(251,191,36,.13);color:var(--orange)}
    .kpi .val{font-size:30px;font-weight:700;line-height:1}
    .kpi .lbl{font-size:13px;color:var(--muted);font-weight:500;margin-top:2px}
    
    .panel{background:linear-gradient(180deg,var(--surface),#130e26);border-radius:var(--radius-lg);border:1px solid var(--border);box-shadow:var(--shadow-sm);overflow:hidden}
    .panel-head{padding:16px 22px;border-bottom:1px solid var(--border);background:rgba(24,153,255,.04)}
    .panel-head .tabs .nav-link{color:var(--muted)!important;font-weight:600;font-size:13.5px;border:none;border-radius:11px;padding:10px 18px;transition:.15s}
    .panel-head .tabs .nav-link:hover{background:var(--surface2);color:#fff!important}
    .panel-head .tabs .nav-link.active{background:var(--grad);color:#fff!important;box-shadow:0 6px 18px rgba(24,153,255,.35)}
    .panel-head .tabs .nav-link i{margin-right:8px}
    
    .toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:18px 22px;border-bottom:1px solid var(--border)}
    .search{flex:1;min-width:220px;position:relative}
    .search i{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--faint)}
    .search input{width:100%;padding:11px 15px 11px 40px;border:1px solid var(--border);border-radius:12px;font-size:13.5px;outline:none;transition:.15s;background:var(--bg2);color:var(--ink)}
    .search input::placeholder{color:var(--faint)}
    .search input:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(24,153,255,.2)}
    .select-cat{max-width:210px}
    .select-cat select{padding:11px 36px 11px 15px;border:1px solid var(--border);border-radius:12px;font-size:13.5px;background:var(--bg2);color:var(--ink);outline:none}
    .btn-tool{border-radius:11px;padding:10px 18px;font-size:13px;font-weight:600}
    .btn-excel{background:var(--bg2);border:1px solid var(--border);color:var(--green)}
    .btn-excel:hover{background:rgba(52,211,153,.12);border-color:var(--green);color:var(--green)}
    .btn-upload{background:var(--grad);color:#fff!important;border:none;box-shadow:0 6px 20px rgba(24,153,255,.4)}
    .btn-upload:hover{opacity:.9;color:#fff!important;transform:translateY(-1px)}
    
    .table-custom{width:100%;border-collapse:collapse;font-size:13.5px}
    .table-custom thead th{background:rgba(24,153,255,.05);color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:15px 20px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
    .table-custom tbody td{padding:15px 20px;border-bottom:1px solid #1e173c;vertical-align:middle}
    .table-custom tbody tr:last-child td{border-bottom:none}
    .table-custom tbody tr{transition:.12s}
    .table-custom tbody tr:hover{background:rgba(24,153,255,.06)}
    .doc-cell{display:flex;align-items:center;gap:13px}
    .doc-thumb{width:42px;height:42px;border-radius:12px;background:var(--grad);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0;box-shadow:0 6px 16px rgba(24,153,255,.4)}
    .doc-title{font-weight:600;color:var(--ink)}
    .doc-file{font-size:12px;color:var(--faint)}
    .badge-soft{border-radius:8px;padding:5px 11px;font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;border:1px solid transparent}
    .badge-instr{background:rgba(52,211,153,.13);color:var(--green);border-color:rgba(52,211,153,.3)}
    .badge-manual{background:rgba(24,153,255,.15);color:var(--violet-light);border-color:rgba(24,153,255,.35)}
    .badge-folder{background:rgba(251,191,36,.13);color:#fcd34d;border-color:rgba(251,191,36,.3)}
    .badge-none{background:rgba(107,99,144,.15);color:var(--muted)}
    .badge-users{background:rgba(0,200,150,.13);color:var(--magenta);border-color:rgba(0,200,150,.3)}
    .badge-admin{background:rgba(245,158,11,.13);color:var(--orange);border-color:rgba(245,158,11,.3)}
    .badge-soporte{background:rgba(24,153,255,.15);color:var(--violet-light);border-color:rgba(24,153,255,.35)}
    .badge-invitado{background:rgba(107,99,144,.15);color:var(--muted);border-color:rgba(107,99,144,.3)}
    .badge-activo{background:rgba(52,211,153,.13);color:var(--green);border-color:rgba(52,211,153,.3)}
    .badge-pendiente{background:rgba(245,158,11,.13);color:var(--orange);border-color:rgba(245,158,11,.3)}
    .date{color:var(--muted);font-size:13px;white-space:nowrap}
    .row-actions{display:flex;gap:7px;justify-content:flex-end}
    .row-actions button{width:34px;height:34px;border-radius:9px;border:1px solid var(--border);background:var(--bg2);color:var(--muted);display:inline-flex;align-items:center;justify-content:center;transition:.15s;font-size:14px}
    .row-actions button:hover{transform:translateY(-2px)}
    .row-actions .act-edit:hover{color:var(--violet-light);border-color:var(--violet)}
    .row-actions .act-dl:hover{color:var(--green);border-color:var(--green)}
    .row-actions .act-del:hover{color:var(--red);border-color:var(--red)}
    .row-actions .act-assign:hover{color:var(--cyan);border-color:var(--cyan)}
    .empty{padding:56px;text-align:center;color:var(--faint)}
    .empty i{font-size:46px;display:block;margin-bottom:14px;background:var(--grad-soft);width:80px;height:80px;border-radius:50%;margin-left:auto;margin-right:auto;align-items:center;justify-content:center;color:var(--violet-light)}
    
    .modal-content{background:var(--surface)!important;border:1px solid var(--border)!important;border-radius:var(--radius-lg)!important;color:var(--ink)!important}
    .modal-header{border-bottom:1px solid var(--border)!important;padding:20px 25px!important}
    .modal-title{font-weight:700!important;color:var(--ink)!important}
    .modal-body{padding:0 25px!important}
    .modal-footer{border-top:1px solid var(--border)!important;padding:15px 25px!important}
    .modal .btn-close{filter:invert(1)}
    .form-control,.form-select{background:var(--bg2)!important;border:1px solid var(--border)!important;color:var(--ink)!important;border-radius:10px!important;padding:10px 15px!important}
    .form-control:focus,.form-select:focus{border-color:var(--violet)!important;box-shadow:0 0 0 3px rgba(24,153,255,.2)!important;color:var(--ink)!important}
    .form-control::placeholder{color:var(--faint)!important}
    .form-label{font-weight:600;color:var(--ink)!important}
    .form-check-input:checked{background-color:var(--violet)!important;border-color:var(--violet)!important}
    .form-check-input:focus{box-shadow:0 0 0 3px rgba(24,153,255,.2)!important}
    
    .btn-cancel{background:var(--surface2)!important;border:1px solid var(--border)!important;color:var(--muted)!important;border-radius:8px!important}
    .btn-cancel:hover{background:var(--border)!important;color:var(--ink)!important}
    .btn-primary-grad{background:var(--grad)!important;border:none!important;border-radius:8px!important;color:#fff!important;box-shadow:0 6px 20px rgba(24,153,255,.4)!important}
    .btn-primary-grad:hover{opacity:.9!important;color:#fff!important}
    .btn-success-grad{background:linear-gradient(135deg,#00c896,#2dd4a7)!important;border:none!important;border-radius:8px!important;color:#fff!important;box-shadow:0 6px 20px rgba(0,200,150,.4)!important}
    .btn-success-grad:hover{opacity:.9!important;color:#fff!important}
    .btn-orange-grad{background:linear-gradient(135deg,#f59e0b,#f97316)!important;border:none!important;border-radius:8px!important;color:#fff!important;box-shadow:0 6px 20px rgba(245,158,11,.4)!important}
    .btn-orange-grad:hover{opacity:.9!important;color:#fff!important}
    
    .assign-list{border:1px solid var(--border);border-radius:12px;padding:10px;max-height:400px;overflow-y:auto;background:var(--bg2)}
    .assign-item{display:flex;align-items:center;padding:12px 15px;margin-bottom:8px;border-radius:10px;border:2px solid var(--border);background:var(--surface);cursor:pointer;transition:.2s}
    .assign-item:hover{border-color:var(--border2)}
    .assign-item.selected{border-color:var(--violet);background:rgba(24,153,255,.1)}
    .assign-item.selected-orange{border-color:var(--orange);background:rgba(245,158,11,.1)}
    .assign-item .item-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .assign-item .item-info{flex:1;margin-left:12px}
    .assign-item .item-info .title{font-weight:600}
    .assign-item .item-info .sub{font-size:12px;color:var(--faint)}
    
    @media(max-width:991px){.admin-sidebar{display:none}.admin-hero{padding:22px}.admin-content{padding:20px}}
  `;

  if (loading) {
    return (
      <div className="admin-dark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner-border" style={{ color: 'var(--violet)' }} role="status" />
      </div>
    );
  }

  return (
    <div className="admin-dark">
      <style>{css}</style>
      <div className="admin-app">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src="/logo-fibex.jpg" alt="Fibex" />
            <div className="bt"><strong>Biblioteca</strong><small>Fibex Telecom S.A.</small></div>
          </div>
          <nav className="admin-nav">
            <div className="admin-nav-label">Menu</div>
            <a className={activeTab === 'manuales' ? 'active' : ''} onClick={() => setActiveTab('manuales')}>
              <FiFolder size={18} /> Documentos <span className="cnt">{totalManuales}</span>
            </a>
            <a className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>
              <FiUsers size={18} /> Usuarios <span className="cnt">{totalUsuarios}</span>
            </a>
            <a className={activeTab === 'carpetas' ? 'active' : ''} onClick={() => setActiveTab('carpetas')}>
              <FiDatabase size={18} /> Carpetas <span className="cnt">{totalCarpetas}</span>
            </a>
            <a className={activeTab === 'actividad' ? 'active' : ''} onClick={() => setActiveTab('actividad')}>
              <FiActivity size={18} /> Actividad
            </a>
          </nav>
          <div className="foot">&copy; 2026 &middot; Departamento de Sistemas<br/>Elaborado por Paulimar</div>
        </aside>

        <div className="admin-main">
          {/* HERO */}
          <header className="admin-hero">
            <div className="deco"><FiGlobe size={90} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div className="crumb"><i className="bi bi-house me-1"></i> Inicio / Panel Administrativo</div>
                <h2>
                  <span className="badge-icon"><FiShield size={22} color="#fff" /></span>
                  Panel Administrativo
                </h2>
                <div className="sub"><FiCpu className="me-1" /> Departamento de Sistemas</div>
              </div>
              <div className="user-chip">
                <div style={{ textAlign: 'right' }} className="d-none d-sm-block">
                  <div className="nm">{user?.nombre}</div>
                  <div className="rl"><FiShield className="me-1" /> Administrador</div>
                </div>
                <div className="avatar">{user?.nombre?.charAt(0) || 'A'}</div>
                <button className="btn" title="Cerrar sesion" onClick={() => { logout(); navigate('/login'); }}>
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          </header>

          <div className="admin-content">
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="kpi">
                <div className="ic doc"><FiFileText size={28} /></div>
                <div>
                  <div className="val">{totalManuales}</div>
                  <div className="lbl"><i className="bi bi-dot me-1"></i> Documentos</div>
                </div>
              </div>
              <div className="kpi">
                <div className="ic instr"><FiCpu size={28} /></div>
                <div>
                  <div className="val">{totalInstructivos}</div>
                  <div className="lbl"><i className="bi bi-dot me-1"></i> Instructivo</div>
                </div>
              </div>
              <div className="kpi">
                <div className="ic usr"><FiUsers size={28} /></div>
                <div>
                  <div className="val">{totalUsuarios}</div>
                  <div className="lbl"><i className="bi bi-dot me-1"></i> Usuarios</div>
                </div>
              </div>
              <div className="kpi">
                <div className="ic fld"><FiDatabase size={28} /></div>
                <div>
                  <div className="val">{totalCarpetas}</div>
                  <div className="lbl"><i className="bi bi-dot me-1"></i> Carpetas</div>
                </div>
              </div>
            </div>

            {/* MAIN PANEL */}
            <div className="panel">
              <div className="panel-head">
                <ul className="nav tabs" role="tablist">
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'manuales' ? 'active' : ''}`} onClick={() => setActiveTab('manuales')}>
                      <FiFolder size={14} /> Documentos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'usuarios' ? 'active' : ''}`} onClick={() => setActiveTab('usuarios')}>
                      <FiUsers size={14} /> Usuarios
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'carpetas' ? 'active' : ''}`} onClick={() => setActiveTab('carpetas')}>
                      <FiDatabase size={14} /> Carpetas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'actividad' ? 'active' : ''}`} onClick={() => setActiveTab('actividad')}>
                      <FiActivity size={14} /> Actividad
                    </button>
                  </li>
                </ul>
              </div>

              {/* ============ DOCUMENTOS ============ */}
              {activeTab === 'manuales' && (
                <div>
                  <div className="toolbar">
                    <div className="search">
                      <FiSearch />
                      <input id="searchDoc" placeholder="Buscar documento..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="select-cat">
                      <select id="filterCat" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                        <option value="Todas">Todas las categorias</option>
                        {categoriasExistentes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-tool btn-excel" onClick={exportManualsToExcel}>
                      <FiDownload className="me-1" /> Excel
                    </button>
                    <button className="btn btn-tool btn-upload" onClick={() => {
                      setEditingManual(null);
                      setManualForm({ titulo: '', descripcion: '', categoria: 'Instructivo', archivo: null, folder_id: '' });
                      setShowUploadModal(true);
                    }}>
                      <FiUpload className="me-1" /> Subir Documento
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Documento</th>
                          <th>Categoria</th>
                          <th>Carpeta</th>
                          <th>Asignados</th>
                          <th>Fecha</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredManuals.map((manual) => (
                          <tr key={manual.id}>
                            <td>
                              <div className="doc-cell">
                                <div className="doc-thumb"><FiFileText size={18} /></div>
                                <div>
                                  <div className="doc-title">{manual.titulo}</div>
                                  <div className="doc-file">{manual.nombre_original}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge-soft ${manual.categoria === 'Manuales' ? 'badge-manual' : 'badge-instr'}`}>
                                {manual.categoria === 'Manuales' ? <FiFileText size={12} /> : <FiCpu size={12} />}
                                {manual.categoria}
                              </span>
                            </td>
                            <td>
                              {manual.folder_id ? (
                                (() => {
                                  var f = folders.find(function(folder) { return folder.id === manual.folder_id; });
                                  return f
                                    ? <span className="badge-soft badge-folder"><FiDatabase size={12} />{f.nombre}</span>
                                    : <span className="badge-soft badge-none"><FiDatabase size={12} />Sin carpeta</span>;
                                })()
                              ) : (
                                <span className="badge-soft badge-none"><FiDatabase size={12} />Sin carpeta</span>
                              )}
                            </td>
                            <td>
                              <span className="badge-soft badge-users">
                                <FiUser size={12} />{manual.asignados?.length || 0} usuario{manual.asignados?.length === 1 ? '' : 's'}
                              </span>
                            </td>
                            <td><span className="date">{new Date(manual.created_at).toLocaleDateString('es-VE')}</span></td>
                            <td>
                              <div className="row-actions">
                                <button className="act-edit" title="Editar" onClick={() => openEditManual(manual)}>
                                  <FiEdit2 size={14} />
                                </button>
                                <button className="act-dl" title="Descargar" onClick={() => handleDownload(manual.archivo, manual.titulo)}>
                                  <FiDownload size={14} />
                                </button>
                                <button className="act-del" title="Eliminar" onClick={() => handleDeleteManual(manual.id)}>
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredManuals.length === 0 && (
                          <tr>
                            <td colSpan="6">
                              <div className="empty">
                                <i className="bi bi-inbox"></i>
                                No se encontraron documentos
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ USUARIOS ============ */}
              {activeTab === 'usuarios' && (
                <div>
                  <div className="toolbar">
                    <div className="search">
                      <FiSearch />
                      <input id="searchUser" placeholder="Buscar usuario..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-tool btn-upload ms-auto" onClick={() => {
                      setEditingUser(null);
                      setUserForm({ nombre: '', email: '', password: '', rol: 'usuario', departamento: 'Sistemas' });
                      setUserFormManuals([]);
                      setShowUserModal(true);
                    }}>
                      <FiPlus className="me-1" /> Nuevo Usuario
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Correo</th>
                          <th>Rol</th>
                          <th>Estado</th>
                          <th>Registro</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div className="doc-cell">
                                <div className="doc-thumb" style={{ background: 'linear-gradient(135deg,#00c896,#1899ff)' }}>
                                  <FiUser size={18} />
                                </div>
                                <div>
                                  <div className="doc-title">{u.nombre}</div>
                                  <div className="doc-file">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="doc-file">{u.email}</span></td>
                            <td>
                              <span className={`badge-soft ${u.rol === 'admin' ? 'badge-admin' : u.rol === 'soporte' ? 'badge-soporte' : 'badge-invitado'}`}>
                                <FiShield size={12} />
                                {u.rol === 'admin' ? 'Administrador' : u.rol === 'soporte' ? 'Soporte' : 'Invitado'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge-soft ${u.activo ? 'badge-activo' : 'badge-pendiente'}`}>
                                {u.activo ? <i className="bi bi-circle-fill" style={{ fontSize: '8px' }}></i> : <FiClock size={12} />}
                                {u.activo ? 'Activo' : 'Pendiente'}
                              </span>
                            </td>
                            <td><span className="date">{new Date(u.created_at).toLocaleDateString('es-VE')}</span></td>
                            <td>
                              <div className="row-actions">
                                {u.rol !== 'admin' && (
                                  <button className="act-assign" title="Asignar manuales" onClick={() => openAssignToUser(u)}>
                                    <FiFileText size={14} />
                                  </button>
                                )}
                                <button className="act-edit" title="Editar" onClick={() => openEditUser(u)}>
                                  <FiEdit2 size={14} />
                                </button>
                                <button className="act-del" title="Eliminar" onClick={() => handleDeleteUser(u.id)}>
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan="6">
                              <div className="empty">
                                <i className="bi bi-person-x"></i>
                                No se encontraron usuarios
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ CARPETAS ============ */}
              {activeTab === 'carpetas' && (
                <div>
                  <div className="toolbar">
                    <div className="search">
                      <FiSearch />
                      <input id="searchFolder" placeholder="Buscar carpeta..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-tool btn-upload ms-auto" onClick={() => {
                      setEditingFolder(null);
                      setFolderForm({ nombre: '', descripcion: '' });
                      setShowFolderModal(true);
                    }}>
                      <FiFolderPlus className="me-1" /> Nueva Carpeta
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Carpeta</th>
                          <th>Documentos</th>
                          <th>Descripcion</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {folders.filter(f => !search || (f.nombre + ' ' + (f.descripcion || '')).toLowerCase().includes(search.toLowerCase())).map((f) => (
                          <tr key={f.id}>
                            <td>
                              <div className="doc-cell">
                                <div className="doc-thumb" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                                  <FiDatabase size={18} />
                                </div>
                                <div>
                                  <div className="doc-title">{f.nombre}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge-soft badge-users">
                                <FiFileText size={12} />{f.manuales?.length || 0} doc(s)
                              </span>
                            </td>
                            <td><span className="doc-file">{f.descripcion || '-'}</span></td>
                            <td>
                              <div className="row-actions">
                                <button className="act-assign" title="Asignar usuarios" onClick={() => openAssignFolder(f)}>
                                  <FiUsers size={14} />
                                </button>
                                <button className="act-edit" title="Editar" onClick={() => openEditFolder(f)}>
                                  <FiEdit2 size={14} />
                                </button>
                                <button className="act-del" title="Eliminar" onClick={() => handleDeleteFolder(f.id)}>
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {folders.length === 0 && (
                          <tr>
                            <td colSpan="4">
                              <div className="empty">
                                <i className="bi bi-collection"></i>
                                No se encontraron carpetas
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============ ACTIVIDAD ============ */}
              {activeTab === 'actividad' && (
                <div>
                  <div className="toolbar">
                    <div className="search">
                      <FiSearch />
                      <input id="searchAct" placeholder="Buscar actividad..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Manual</th>
                          <th>Accion</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.filter(log => !search || (log.user_nombre + ' ' + log.manual_titulo + ' ' + log.accion).toLowerCase().includes(search.toLowerCase())).map((log) => (
                          <tr key={log.id}>
                            <td>
                              <div className="doc-cell">
                                <div className="doc-thumb" style={{ background: 'linear-gradient(135deg,#00c896,#1899ff)' }}>
                                  <FiUser size={18} />
                                </div>
                                <div>
                                  <div className="doc-title">{log.user_nombre}</div>
                                  <div className="doc-file">{log.user_email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="doc-title" style={{ fontWeight: 500 }}>{log.manual_titulo}</span>
                              <br />
                              <span className={`badge-soft ${log.manual_categoria === 'Manuales' ? 'badge-manual' : 'badge-instr'}`} style={{ fontSize: '10px' }}>
                                {log.manual_categoria}
                              </span>
                            </td>
                            <td>
                              <span className={`badge-soft ${log.accion === 'preview' ? 'badge-manual' : 'badge-instr'}`}>
                                {log.accion === 'preview' ? <FiEye size={12} /> : <FiDownload size={12} />}
                                {log.accion === 'preview' ? 'Vista previa' : 'Descarga'}
                              </span>
                            </td>
                            <td><span className="date">{new Date(log.created_at).toLocaleString('es-VE')}</span></td>
                          </tr>
                        ))}
                        {activityLogs.length === 0 && (
                          <tr>
                            <td colSpan="4">
                              <div className="empty">
                                <i className="bi bi-activity"></i>
                                Sin actividad registrada
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ MODALS ============ */}

      {/* Upload/Edit Manual Modal */}
      <Modal show={showUploadModal} onHide={() => { setShowUploadModal(false); setEditingManual(null); }}
        size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><FiUpload className="me-2" />{editingManual ? 'Editar Documento' : 'Subir Nuevo Documento'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUploadManual}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label><FiFileText className="me-1" /> Titulo del documento</Form.Label>
              <Form.Control value={manualForm.titulo}
                onChange={(e) => setManualForm({ ...manualForm, titulo: e.target.value })}
                placeholder="Ej: Configuracion de Router MikroTik"
                required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><FiBook className="me-1" /> Descripcion</Form.Label>
              <Form.Control as="textarea" rows={3} value={manualForm.descripcion}
                onChange={(e) => setManualForm({ ...manualForm, descripcion: e.target.value })}
                placeholder="Breve descripcion del contenido..." />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FiGrid className="me-1" /> Categoria</Form.Label>
                  {manualForm.categoria === '__nueva__' ? (
                    <div className="d-flex gap-2">
                      <Form.Control value={nuevaCategoria}
                        onChange={(e) => setNuevaCategoria(e.target.value)}
                        placeholder="Nombre de la nueva categoria"
                        required />
                      <Button variant="outline-secondary" onClick={() => {
                        setManualForm({ ...manualForm, categoria: 'Instructivo' });
                        setNuevaCategoria('');
                      }} title="Cancelar nueva categoria"><FiX /></Button>
                    </div>
                  ) : (
                    <Form.Select value={manualForm.categoria}
                      onChange={(e) => {
                        setManualForm({ ...manualForm, categoria: e.target.value });
                        if (e.target.value === '__nueva__') setNuevaCategoria('');
                      }}>
                      {categoriasExistentes.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__nueva__">+ Nueva categoria...</option>
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FiFolder className="me-1" /> Carpeta (opcional)</Form.Label>
                  <Form.Select value={manualForm.folder_id}
                    onChange={(e) => setManualForm({ ...manualForm, folder_id: e.target.value })}>
                    <option value="">Sin carpeta</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              {!editingManual && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label><FiHardDrive className="me-1" /> Archivo PDF</Form.Label>
                    <Form.Control type="file" accept=".pdf"
                      onChange={(e) => setManualForm({ ...manualForm, archivo: e.target.files[0] })}
                      required />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-cancel" onClick={() => { setShowUploadModal(false); setEditingManual(null); }}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary-grad">
              <FiUpload className="me-1" /> {editingManual ? 'Guardar Cambios' : 'Subir Documento'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => { setShowUserModal(false); setEditingUser(null); setUserFormManuals([]); }} centered>
        <Modal.Header closeButton>
          <Modal.Title><FiUsers className="me-2" />{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label><FiUser className="me-1" /> Nombre completo</Form.Label>
              <Form.Control value={userForm.nombre}
                onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                placeholder="Nombre del empleado" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><FiGlobe className="me-1" /> Correo electronico</Form.Label>
              <Form.Control type="email" value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="usuario@fibextelecom.com" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><FiLock className="me-1" /> Contrasena {editingUser && '(dejar vacio para no cambiar)'}</Form.Label>
              <Form.Control type="password" value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder={editingUser ? 'Dejar vacio para mantener' : 'Contrasena'}
                required={!editingUser} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FiShield className="me-1" /> Rol</Form.Label>
                  <Form.Select value={userForm.rol}
                    onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FiGlobe className="me-1" /> Departamento</Form.Label>
                  <Form.Control value={userForm.departamento}
                    onChange={(e) => setUserForm({ ...userForm, departamento: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            {userForm.rol !== 'admin' && (
              <Form.Group className="mb-3">
                <Form.Label><FiFileText className="me-1" /> Manuales asignados</Form.Label>
                <div className="assign-list">
                  {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).map((m) => (
                    <div key={m.id} onClick={() => {
                      setUserFormManuals(function(prev) {
                        return prev.includes(m.id) ? prev.filter(function(id) { return id !== m.id; }) : prev.concat([m.id]);
                      });
                    }} className={`assign-item ${userFormManuals.includes(m.id) ? 'selected' : ''}`}>
                      <div className="item-icon" style={{ background: 'var(--grad)' }}>
                        <FiFileText size={20} color="#fff" />
                      </div>
                      <div className="item-info">
                        <div className="title">{m.titulo}</div>
                        <div className="sub">
                          <span className={`badge-soft ${m.categoria === 'Manuales' ? 'badge-manual' : 'badge-instr'}`} style={{ fontSize: '10px' }}>
                            {m.categoria}
                          </span>
                        </div>
                      </div>
                      {userFormManuals.includes(m.id) && <FiCheck size={22} color="var(--violet)" />}
                    </div>
                  ))}
                  {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).length === 0 && (
                    <p style={{ color: 'var(--faint)', textAlign: 'center', margin: 0 }}>No hay manuales disponibles</p>
                  )}
                </div>
                <small style={{ color: 'var(--faint)' }}>{userFormManuals.length} manual(es) seleccionado(s)</small>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-cancel" onClick={() => { setShowUserModal(false); setEditingUser(null); setUserFormManuals([]); }}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-success-grad">
              <FiUser className="me-1" /> {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Assign Manuals Modal */}
      <Modal show={showAssignModal} onHide={() => { setShowAssignModal(false); setSelectedUser(null); setSelectedManuals([]); }}
        size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><FiFileText className="me-2" />Asignar manuales a: {selectedUser?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: 'var(--faint)' }}>Selecciona los manuales que <strong>{selectedUser?.nombre}</strong> podra ver:</p>
          <div className="assign-list">
            {manuals.filter(function(m) { return m.activo === 1 || m.activo === true; }).map((m) => (
              <div key={m.id} onClick={() => toggleManualSelection(m.id)}
                className={`assign-item ${selectedManuals.includes(m.id) ? 'selected' : ''}`}>
                <div className="item-icon" style={{ background: 'var(--grad)' }}>
                  <FiFileText size={20} color="#fff" />
                </div>
                <div className="item-info">
                  <div className="title">{m.titulo}</div>
                  <div className="sub">
                    <span className={`badge-soft ${m.categoria === 'Manuales' ? 'badge-manual' : 'badge-instr'}`} style={{ fontSize: '10px' }}>
                      {m.categoria}
                    </span>
                    <span style={{ marginLeft: '8px' }}>{m.asignados?.length || 0} usuario(s)</span>
                  </div>
                </div>
                {selectedManuals.includes(m.id) && <FiCheck size={22} color="var(--violet)" />}
              </div>
            ))}
          </div>
          <div className="mt-3" style={{ color: 'var(--faint)' }}>
            <small><FiFileText className="me-1" />{selectedManuals.length} manual(es) seleccionado(s)</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => { setShowAssignModal(false); setSelectedManuals([]); }}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} className="btn-primary-grad">
            <FiCheck className="me-1" /> Guardar Asignacion
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Folder Modal */}
      <Modal show={showFolderModal} onHide={() => { setShowFolderModal(false); setEditingFolder(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title><FiFolder className="me-2" />{editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveFolder}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label><FiFolder className="me-1" /> Nombre de la carpeta</Form.Label>
              <Form.Control value={folderForm.nombre}
                onChange={(e) => setFolderForm({ ...folderForm, nombre: e.target.value })}
                placeholder="Ej: SAE, Instructivos SAE, Manuales Tecnicos"
                required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><FiBook className="me-1" /> Descripcion (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={folderForm.descripcion}
                onChange={(e) => setFolderForm({ ...folderForm, descripcion: e.target.value })}
                placeholder="Para que sirve esta carpeta?" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-cancel" onClick={() => { setShowFolderModal(false); setEditingFolder(null); }}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-orange-grad">
              <FiCheck className="me-1" /> {editingFolder ? 'Guardar Cambios' : 'Crear Carpeta'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Folder Assign Modal */}
      <Modal show={showFolderAssignModal} onHide={() => { setShowFolderAssignModal(false); setSelectedFolder(null); setSelectedFolderUsers([]); }}
        size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><FiUsers className="me-2" />Asignar carpeta: {selectedFolder?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: 'var(--faint)' }}>Selecciona los usuarios que podran ver los manuales de esta carpeta:</p>
          <div className="assign-list">
            {users.filter(function(u) { return u.rol !== 'admin'; }).map((u) => (
              <div key={u.id} onClick={() => toggleFolderUser(u.id)}
                className={`assign-item ${selectedFolderUsers.includes(u.id) ? 'selected-orange' : ''}`}>
                <div className="item-icon" style={{ background: 'linear-gradient(135deg,#00c896,#1899ff)' }}>
                  <FiUser size={20} color="#fff" />
                </div>
                <div className="item-info">
                  <div className="title">{u.nombre}</div>
                  <div className="sub">{u.email}</div>
                </div>
                {selectedFolderUsers.includes(u.id) && <FiCheck size={22} color="var(--orange)" />}
              </div>
            ))}
          </div>
          <div className="mt-3" style={{ color: 'var(--faint)' }}>
            <small><FiUsers className="me-1" />{selectedFolderUsers.length} usuario(s) seleccionado(s)</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => { setShowFolderAssignModal(false); setSelectedFolderUsers([]); }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveFolderAssign} className="btn-orange-grad">
            <FiCheck className="me-1" /> Guardar Asignacion
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Admin;
