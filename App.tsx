/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BookOpen, 
  Wallet, 
  GraduationCap, 
  FileText, 
  LogOut, 
  Bell,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Briefcase,
  Lock,
  Settings2,
  Camera,
  Upload,
  User,
  Printer,
  DollarSign,
  Save,
  ClipboardCheck,
  CalendarDays,
  TrendingUp,
  ChevronLeft,
  BarChart2,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
type Role = 'admin' | 'teacher' | 'student' | 'finance';

interface User {
  username: string;
  role: Role;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

// --- Components ---

// --- Components ---

const PhotoCapture = ({ onCapture }: { onCapture: (base64: string) => void }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCapturing(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setPreview(base64);
      onCapture(base64);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCapturing(false);
  };

  React.useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : isCapturing ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <User size={48} className="text-gray-300" />
        )}
      </div>
      <div className="flex justify-center gap-2">
        {!isCapturing ? (
          <>
            <button type="button" onClick={startCamera} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
              <Camera size={20} />
            </button>
            <label className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 cursor-pointer">
              <Upload size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </>
        ) : (
          <button type="button" onClick={capture} className="px-4 py-1 bg-impagme-red text-white rounded-full text-sm font-bold">
            Capturar
          </button>
        )}
        {preview && (
          <button type="button" onClick={() => { setPreview(null); onCapture(''); }} className="p-2 bg-red-50 rounded-full hover:bg-red-100 text-red-600">
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

const IDCard = ({ data, role }: { data: any, role: string }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const year = new Date().getFullYear();
    const expiry = `${String(new Date().getMonth() + 1).padStart(2,'0')}/${year + 1}`;
    const photoBlock = data.photo
      ? `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc;">
           <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
           </svg>
         </div>`;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Passe — IMPAGME</title>
  <style>
    @page { size: 54mm 86mm; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .card { width: 54mm; height: 86mm; background: #fff; overflow: hidden; position: relative; border: 1px solid #e5e7eb; }
    .header { background: #1a1a1a; padding: 6mm 5mm 5mm; text-align: center; position: relative; }
    .header::after { content: ''; display: block; height: 1.5mm; background: #C8261E; position: absolute; bottom: 0; left: 0; right: 0; }
    .logo-name { color: #fff; font-size: 14pt; font-weight: 900; letter-spacing: -0.5px; line-height: 1; }
    .logo-sub { color: rgba(255,255,255,0.55); font-size: 4.5pt; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1mm; }
    .body { padding: 4mm 5mm 3mm; text-align: center; }
    .photo { width: 22mm; height: 28mm; border-radius: 2mm; overflow: hidden; margin: 0 auto 3mm; border: 1px solid #e5e7eb; background: #f9fafb; }
    .name { font-size: 8.5pt; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.2; }
    .role { font-size: 5.5pt; font-weight: 700; color: #C8261E; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 1mm; }
    .divider { height: 0.3mm; background: #f0f0f0; margin: 3mm 0 2.5mm; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 1mm 0; border-bottom: 0.3mm solid #f5f5f5; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 5pt; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 6pt; font-weight: 700; color: #111; font-family: monospace; letter-spacing: 0.3px; }
    .footer-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 5mm; background: #1a1a1a; display: flex; align-items: center; justify-content: center; }
    .footer-bar span { font-size: 4pt; color: rgba(255,255,255,0.4); letter-spacing: 0.8px; text-transform: uppercase; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="logo-name">IMPAGME</div>
    <div class="logo-sub">Instituto Mundo do Ensino</div>
  </div>
  <div class="body">
    <div class="photo">${photoBlock}</div>
    <div class="name">${data.name}</div>
    <div class="role">${role}</div>
    <div class="divider"></div>
    <div class="info-row">
      <span class="info-label">BI / ID</span>
      <span class="info-value">${data.bi || data.registration_no || '—'}</span>
    </div>
    ${data.registration_no ? `<div class="info-row"><span class="info-label">Matricula</span><span class="info-value">${data.registration_no}</span></div>` : ''}
    <div class="info-row">
      <span class="info-label">Emissao</span>
      <span class="info-value">${new Date().toLocaleDateString('pt-PT')}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Validade</span>
      <span class="info-value">${expiry}</span>
    </div>
  </div>
  <div class="footer-bar"><span>impagme.edu.ao</span></div>
</div>
<script>window.onload=()=>{window.print();}</script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={cardRef} className="w-[280px] h-[400px] bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-impagme-red relative">
        <div className="bg-impagme-dark text-white p-4 text-center">
          <h1 className="text-lg font-bold tracking-tighter leading-none">IMPAGME</h1>
          <p className="text-[8px] opacity-60 uppercase tracking-widest">Mundo do Ensino</p>
        </div>
        <div className="p-6 text-center">
          <div className="w-24 h-32 bg-gray-100 rounded-lg mx-auto mb-4 border border-gray-200 overflow-hidden">
            {data.photo ? (
              <img src={data.photo} alt="Pass" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <User size={32} />
              </div>
            )}
          </div>
          <h2 className="text-sm font-bold text-gray-900 uppercase truncate">{data.name}</h2>
          <p className="text-impagme-red font-bold uppercase tracking-widest text-[10px] mt-1">{role}</p>
          <div className="mt-4 space-y-1 text-left text-[10px]">
            <div className="flex justify-between border-b border-gray-50 pb-0.5">
              <span className="text-gray-400">ID:</span>
              <span className="font-mono font-bold">{data.bi || data.registration_no}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-0.5">
              <span className="text-gray-400">Validade:</span>
              <span className="font-bold">Dez/{new Date().getFullYear() + 1}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-impagme-red"></div>
      </div>
      <button onClick={handlePrint} className="btn-primary flex items-center gap-2 text-sm py-2">
        <Printer size={16} /> Imprimir Passe
      </button>
    </div>
  );
};

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-impagme-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const NotificationDropdown = ({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onClose 
}: { 
  notifications: Notification[], 
  onMarkRead: (id: number) => void, 
  onMarkAllRead: () => void,
  onClose: () => void
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-50 flex justify-between items-center">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notificações</h4>
        <button onClick={onMarkAllRead} className="text-[10px] text-impagme-red hover:underline font-bold">Marcar todas como lidas</button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${n.is_read ? 'opacity-60' : 'bg-red-50/30'}`}
              onClick={() => onMarkRead(n.id)}
            >
              <div className="flex gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-impagme-red'}`}></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const LoginPage = ({ onLogin, sessionExpired }: { onLogin: (token: string, user: User) => void, sessionExpired?: boolean }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-impagme-red p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center bg-impagme-dark text-white">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-impagme-red rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <GraduationCap size={40} />
            </div>
          </div>
          <h1 className="text-xl font-bold">IMPAGME</h1>
          <p className="text-gray-400 text-sm mt-1">Portal do Mundo do Ensino</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {sessionExpired && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <span>A sua sessão expirou. Por favor faça login novamente.</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário / BI</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-impagme-red transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-3 text-lg">
            Entrar no Sistema
          </button>
          <div className="text-center">
            <button 
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-gray-500 hover:text-impagme-red"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Recuperação de Senha</h3>
                <button onClick={() => setShowForgotModal(false)}><X size={24} /></button>
              </div>
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-impagme-red rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold">Contacte a Secretaria</h4>
                  <p className="text-gray-500">
                    Por motivos de segurança e por ser um sistema offline, a redefinição de senha deve ser feita presencialmente na secretaria da instituição.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-left space-y-2">
                  <p><strong>O que levar:</strong></p>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Bilhete de Identidade (BI)</li>
                    <li>Cartão de Estudante/Professor</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="w-full btn-primary py-3"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ stats, onNavigate, role, token, selectedCycle }: { stats: any, onNavigate: (module: string) => void, role: Role, token: string, selectedCycle: string }) => {
  const canSeeRevenue = role === 'admin' || role === 'finance';
  const canSeeTeachers = role === 'admin';
  const canSeeClasses = role === 'admin' || role === 'finance' || role === 'teacher';
  const [cycleStats, setCycleStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats/cycles', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setCycleStats(d));
  }, [token]);

  // Use cycle-specific numbers for the main cards
  const cs = cycleStats?.[selectedCycle];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => onNavigate('students')}
          className="card flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 text-left w-full cursor-pointer group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alunos · {selectedCycle}</p>
            <p className="text-2xl font-bold">{cs ? cs.students : (stats?.students || 0)}</p>
          </div>
        </button>

        {canSeeTeachers && (
          <button 
            onClick={() => onNavigate('teachers')}
            className="card flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 text-left w-full cursor-pointer group"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <UserSquare2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Professores · {selectedCycle}</p>
              <p className="text-2xl font-bold">{cs ? cs.teachers : (stats?.teachers || 0)}</p>
            </div>
          </button>
        )}

        {canSeeClasses && (
          <button 
            onClick={() => onNavigate('classes')}
            className="card flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 text-left w-full cursor-pointer group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Turmas · {selectedCycle}</p>
              <p className="text-2xl font-bold">{cs ? cs.classes : (stats?.classes || 0)}</p>
            </div>
          </button>
        )}

        {canSeeRevenue && (
          <button 
            onClick={() => onNavigate('financial')}
            className="card flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 text-left w-full cursor-pointer group"
          >
            <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold">{stats?.revenue?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || '0,00 Kz'}</p>
            </div>
          </button>
        )}
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Visão Geral do Sistema</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{new Date().toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate('students')}
            className="w-full text-left flex gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 hover:bg-blue-100 transition-all group"
          >
            <Users className="text-blue-500 shrink-0" size={20} />
            <div>
              <p className="font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">
                {stats?.students || 0} aluno{stats?.students !== 1 ? 's' : ''} matriculado{stats?.students !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-blue-600">Clique para ver a lista completa de alunos</p>
            </div>
          </button>

          {canSeeRevenue && stats?.pending > 0 && (
            <button
              onClick={() => onNavigate('financial')}
              className="w-full text-left flex gap-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400 hover:bg-amber-100 transition-all group"
            >
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-amber-800 group-hover:text-amber-600 transition-colors">
                  {stats.pending.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} em pagamentos pendentes
                </p>
                <p className="text-sm text-amber-600">Existem propinas por liquidar — clique para gerir</p>
              </div>
            </button>
          )}

          {canSeeRevenue && (
            <button
              onClick={() => onNavigate('financial')}
              className="w-full text-left flex gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-400 hover:bg-green-100 transition-all group"
            >
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-800 group-hover:text-green-600 transition-colors">
                  {(stats?.revenue || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} em receitas confirmadas
                </p>
                <p className="text-sm text-green-600">Total de pagamentos registados como pagos</p>
              </div>
            </button>
          )}

          <button
            onClick={() => onNavigate('attendance')}
            className="w-full text-left flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-impagme-red hover:bg-white hover:shadow-md transition-all group"
          >
            <ClipboardCheck className="text-impagme-red shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-impagme-red transition-colors">Registar presenças de hoje</p>
              <p className="text-sm text-gray-500">Marque as presenças da sua turma para {new Date().toLocaleDateString('pt-AO', { day: 'numeric', month: 'long' })}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Ano Letivo {new Date().getFullYear()}</h2>
        <div className="space-y-3">
          {[
            { label: '1º Trimestre', periodo: 'Jan – Mar', status: new Date().getMonth() < 3 ? 'Em curso' : 'Concluído', color: new Date().getMonth() < 3 ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50' },
            { label: '2º Trimestre', periodo: 'Abr – Jun', status: new Date().getMonth() >= 3 && new Date().getMonth() < 6 ? 'Em curso' : new Date().getMonth() < 3 ? 'A iniciar' : 'Concluído', color: new Date().getMonth() >= 3 && new Date().getMonth() < 6 ? 'text-green-600 bg-green-50' : new Date().getMonth() < 3 ? 'text-blue-500 bg-blue-50' : 'text-gray-400 bg-gray-50' },
            { label: '3º Trimestre', periodo: 'Jul – Set', status: new Date().getMonth() >= 6 && new Date().getMonth() < 9 ? 'Em curso' : new Date().getMonth() < 6 ? 'A iniciar' : 'Concluído', color: new Date().getMonth() >= 6 && new Date().getMonth() < 9 ? 'text-green-600 bg-green-50' : new Date().getMonth() < 6 ? 'text-blue-500 bg-blue-50' : 'text-gray-400 bg-gray-50' },
            { label: 'Exames Finais', periodo: 'Out – Nov', status: new Date().getMonth() >= 9 && new Date().getMonth() < 11 ? 'Em curso' : new Date().getMonth() < 9 ? 'A iniciar' : 'Concluído', color: new Date().getMonth() >= 9 && new Date().getMonth() < 11 ? 'text-impagme-red bg-red-50' : new Date().getMonth() < 9 ? 'text-blue-500 bg-blue-50' : 'text-gray-400 bg-gray-50' },
            { label: 'Férias Escolares', periodo: 'Dez', status: new Date().getMonth() === 11 ? 'Em curso' : 'A iniciar', color: new Date().getMonth() === 11 ? 'text-purple-600 bg-purple-50' : 'text-blue-500 bg-blue-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.periodo}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => onNavigate('reports')} className="text-sm text-impagme-red font-medium hover:underline flex items-center gap-1">
            <FileText size={14} /> Ver Relatórios
          </button>
        </div>
      </div>
    </div>

    {/* Per-cycle stats panel */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(['1º Ciclo', '2º Ciclo'] as const).map(cycle => {
        const cs = cycleStats?.[cycle];
        const isMedio = cycle === '2º Ciclo';
        return (
          <div key={cycle} className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isMedio ? 'bg-impagme-red' : 'bg-blue-500'}`}>
                  {isMedio ? 'M' : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{cycle}</h3>
                  <p className="text-xs text-gray-400">{isMedio ? 'Ensino Médio · 10ª–13ª' : 'Iniciação · 1ª–9ª classe'}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isMedio ? 'bg-red-50 text-impagme-red' : 'bg-blue-50 text-blue-600'}`}>
                {cs ? `${cs.classes} turma${cs.classes !== 1 ? 's' : ''}` : '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Alunos</p>
                <p className="text-xl font-bold text-gray-800">{cs ? cs.students : '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Taxa de Presença</p>
                {cs && cs.attendanceRate !== null ? (
                  <div>
                    <p className="text-xl font-bold text-gray-800">{cs.attendanceRate}%</p>
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${cs.attendanceRate >= 75 ? 'bg-green-500' : 'bg-amber-400'}`}
                        style={{ width: `${cs.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sem dados</p>
                )}
              </div>
            </div>

            {canSeeRevenue && cs && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700 mb-1">Receitas pagas</p>
                  <p className="text-sm font-bold text-green-800">
                    {(cs.revenue ?? 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-700 mb-1">Pendentes</p>
                  <p className="text-sm font-bold text-amber-800">
                    {(cs.pending ?? 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => onNavigate('students')}
              className={`w-full text-xs font-semibold py-2 rounded-lg transition-all ${isMedio ? 'bg-red-50 text-impagme-red hover:bg-impagme-red hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white'}`}
            >
              Ver alunos do {cycle}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);
};

const StudentManagement = ({ token, onViewProfile, cycle }: { token: string, onViewProfile: (id: number) => void, cycle: string }) => {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const cycleClassIds = new Set(classes.filter((c: any) => (c.cycle || '2º Ciclo') === cycle).map((c: any) => c.id));
  const students = allStudents.filter(s => {
    if (!s.class_id) return cycle === '2º Ciclo'; // sem turma → aparecem só no 2º Ciclo por defeito
    return cycleClassIds.has(s.class_id);
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [formData, setFormData] = useState({
    registration_no: '', name: '', bi: '', dob: '', guardian: '', contact: '', address: '', photo: '', class_id: ''
  });
  const [showPassModal, setShowPassModal] = useState<{ isOpen: boolean, student: any }>({ isOpen: false, student: null });
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 20;

  const fetchStudents = async () => {
    const res = await fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setAllStudents(data);
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setClasses(data);
  };

  useEffect(() => { fetchStudents(); fetchClasses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/students/${editingId}` : '/api/students';
    
    const { class_id, ...studentData } = formData;

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentData)
    });
    if (res.ok) {
      const result = await res.json();
      if (!isEditing && class_id) {
        const newStudentId = result.id;
        await fetch(`/api/classes/${class_id}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ student_id: newStudentId })
        });
      }
      setShowModal(false);
      fetchStudents();
      if (!isEditing) {
        setShowPassModal({ isOpen: true, student: studentData });
      }
      setFormData({ registration_no: '', name: '', bi: '', dob: '', guardian: '', contact: '', address: '', photo: '', class_id: '' });
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleEdit = (student: any) => {
    setFormData({
      registration_no: student.registration_no,
      name: student.name,
      bi: student.bi,
      dob: student.dob || '',
      guardian: student.guardian || '',
      contact: student.contact || '',
      address: student.address || '',
      photo: student.photo || '',
      class_id: student.class_id ? String(student.class_id) : ''
    });
    setEditingId(student.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    const res = await fetch(`/api/students/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.bi?.toLowerCase().includes(q) || s.registration_no?.toLowerCase().includes(q) || s.contact?.toLowerCase().includes(q);
  });
  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const pagedStudents = filteredStudents.slice((studentPage - 1) * STUDENTS_PER_PAGE, studentPage * STUDENTS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Alunos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filteredStudents.length} de {students.length} alunos</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ registration_no: '', name: '', bi: '', dob: '', guardian: '', contact: '', address: '', photo: '', class_id: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Novo Aluno
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, BI ou nº de matrícula…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
              value={studentSearch}
              onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }}
            />
            {studentSearch && (
              <button onClick={() => { setStudentSearch(''); setStudentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nº Matrícula</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">BI</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Search size={32} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 font-medium">Nenhum aluno encontrado</p>
                    <p className="text-sm text-gray-300 mt-1">Tente outro termo de pesquisa</p>
                  </td>
                </tr>
              ) : pagedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-impagme-red">{student.registration_no}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onViewProfile(student.id)}
                      className="font-bold text-gray-900 hover:text-impagme-red transition-colors text-left"
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.bi}</td>
                  <td className="px-6 py-4 text-sm">{student.contact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {student.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="text-gray-400 hover:text-impagme-red transition-colors"
                        title="Editar"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => setShowPassModal({ isOpen: true, student: student })}
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        <Printer size={14} /> Passe
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: student.id })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalStudentPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {(studentPage - 1) * STUDENTS_PER_PAGE + 1}–{Math.min(studentPage * STUDENTS_PER_PAGE, filteredStudents.length)} de {filteredStudents.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                disabled={studentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              {Array.from({ length: totalStudentPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalStudentPages || Math.abs(p - studentPage) <= 1)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '…'
                  ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  : <button
                      key={p}
                      onClick={() => setStudentPage(p as number)}
                      className={`w-8 h-8 text-sm rounded-lg font-medium ${studentPage === p ? 'bg-impagme-red text-white' : 'text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    >{p}</button>
                )
              }
              <button
                onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                disabled={studentPage === totalStudentPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Excluir Aluno"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita e removerá também o acesso do aluno ao portal."
      />

      <AnimatePresence>
        {showPassModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Passe do Aluno</h3>
                <button onClick={() => setShowPassModal({ isOpen: false, student: null })}><X size={24} /></button>
              </div>
              <div className="p-8">
                <IDCard data={showPassModal.student} role="ALUNO" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h3>
                <button onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <PhotoCapture onCapture={(photo) => setFormData({...formData, photo})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Matrícula</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.registration_no} onChange={e => setFormData({...formData, registration_no: e.target.value})}
                    placeholder="Ex: 2024/001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº do BI</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.bi} onChange={e => setFormData({...formData, bi: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" className="input-field" required
                    value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Encarregado</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.guardian} onChange={e => setFormData({...formData, guardian: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <textarea 
                    className="input-field" rows={2}
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                {!isEditing && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turma <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <select
                      className="input-field"
                      value={formData.class_id}
                      onChange={e => setFormData({...formData, class_id: e.target.value})}
                    >
                      <option value="">Selecionar Turma (pode fazer depois)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.year} ({c.shift})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">{isEditing ? 'Atualizar Aluno' : 'Salvar Aluno'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FinancialManagement = ({ token, cycle, schoolYear }: { token: string, cycle: string, schoolYear?: string }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [view, setView] = useState<'payments' | 'expenses'>('payments');
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null; type: 'payment' | 'expense' }>({ isOpen: false, id: null, type: 'payment' });
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [error, setError] = useState<string | null>(null);
  const [fees, setFees] = useState<Record<string, number>>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', amount: '', date: new Date().toISOString().split('T')[0], month: '', type: 'Propina', receipt_no: '', status: 'Pago'
  });
  const [expenseData, setExpenseData] = useState({
    description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Outros'
  });

  const feeMap: Record<string, string> = cycle === '1º Ciclo' ? {
    'Propina': 'fee_propina_1ciclo',
    'Matrícula': 'fee_matricula_1ciclo',
    'Multa': 'fee_multa_1ciclo',
    'Prova': 'fee_prova_1ciclo'
  } : {
    'Propina': 'fee_propina',
    'Matrícula': 'fee_matricula',
    'Multa': 'fee_multa',
    'Prova': 'fee_prova'
  };

  const fetchData = async () => {
    const [payRes, expRes, statsRes, feesRes] = await Promise.all([
      fetch(`/api/payments?cycle=${encodeURIComponent(cycle)}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/settings/fees', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    setPayments(await payRes.json());
    setExpenses(await expRes.json());
    setStats(await statsRes.json());
    setFees(await feesRes.json());
  };

  useEffect(() => { fetchData(); }, [cycle]);

  useEffect(() => {
    if (!studentSearch.trim()) { setStudentResults([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/students/search?q=${encodeURIComponent(studentSearch)}&cycle=${encodeURIComponent(cycle)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStudentResults(await res.json());
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const openNewPaymentModal = async () => {
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSelectedStudent(null);
    setStudentSearch('');
    setStudentResults([]);
    const receiptRes = await fetch('/api/payments/next-receipt', { headers: { 'Authorization': `Bearer ${token}` } });
    const { receipt_no } = await receiptRes.json();
    const feeKey = feeMap['Propina'];
    setFormData({
      student_id: '', amount: String(fees[feeKey] ?? ''), date: new Date().toISOString().split('T')[0],
      month: '', type: 'Propina', receipt_no, status: 'Pago'
    });
    setShowModal(true);
  };

  const selectStudent = (s: any) => {
    setSelectedStudent(s);
    setFormData(prev => ({ ...prev, student_id: String(s.id) }));
    setStudentSearch(s.name);
    setStudentResults([]);
  };

  const handleTypeChange = (type: string) => {
    const feeKey = feeMap[type];
    const amount = feeKey && fees[feeKey] ? String(fees[feeKey]) : formData.amount;
    setFormData(prev => ({ ...prev, type, amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/payments/${editingId}` : '/api/payments';
    
    try {
      const isDuplicate = payments.some(p => 
        p.receipt_no === formData.receipt_no && (!isEditing || p.id !== editingId)
      );
      if (isDuplicate) {
        setError("Este número de recibo já está em uso na listagem local.");
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          student_id: parseInt(formData.student_id),
          amount: parseFloat(formData.amount)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchData();
        setFormData({ student_id: '', amount: '', date: new Date().toISOString().split('T')[0], month: '', type: 'Propina', receipt_no: '', status: 'Pago' });
        setSelectedStudent(null);
        setStudentSearch('');
        setIsEditing(false);
        setEditingId(null);
      } else {
        setError(data.error || 'Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/expenses/${editingId}` : '/api/expenses';
    
    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expenseData)
    });
    if (res.ok) {
      setShowExpenseModal(false);
      fetchData();
      setExpenseData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Outros' });
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleEditPayment = (p: any) => {
    setError(null);
    setFormData({
      student_id: p.student_id.toString(),
      amount: p.amount.toString(),
      date: p.date,
      month: p.month,
      type: p.type,
      receipt_no: p.receipt_no,
      status: p.status || 'Pago'
    });
    setSelectedStudent({ id: p.student_id, name: p.student_name, class_name: null });
    setStudentSearch(p.student_name);
    setStudentResults([]);
    setEditingId(p.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditExpense = (e: any) => {
    setExpenseData({
      description: e.description,
      amount: e.amount.toString(),
      date: e.date,
      category: e.category
    });
    setEditingId(e.id);
    setIsEditing(true);
    setShowExpenseModal(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    const endpoint = confirmDelete.type === 'payment' ? `/api/payments/${confirmDelete.id}` : `/api/expenses/${confirmDelete.id}`;
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchData();
    }
  };

  const filteredPayments = statusFilter === 'Todos' 
    ? payments 
    : payments.filter(p => p.status === statusFilter);

  const generateReceiptPDF = (p: any) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;

    // ── HEADER ──────────────────────────────────────────
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, W, 44, 'F');
    doc.setFillColor(200, 38, 30);
    doc.rect(0, 44, W, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text('IMPAGME', 18, 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text('INSTITUTO MUNDO DO ENSINO', 18, 29);
    doc.setFillColor(200, 38, 30);
    doc.rect(18, 32, 52, 0.8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(170, 170, 170);
    doc.text('RECIBO DE PAGAMENTO', W - 18, 16, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text(p.receipt_no, W - 18, 27, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(`Ano Lectivo: ${schoolYear ?? '2026/2027'}`, W - 18, 35, { align: 'right' });
    doc.text(`Emissao: ${new Date().toLocaleDateString('pt-PT')}`, W - 18, 40, { align: 'right' });

    let y = 58;

    // ── STUDENT SECTION ─────────────────────────────────
    doc.setFillColor(242, 242, 242);
    doc.rect(18, y, W - 36, 8, 'F');
    doc.setFillColor(200, 38, 30);
    doc.rect(18, y, 3, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text('DADOS DO ALUNO', 25, y + 5.5);
    y += 13;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Nome do Aluno', 18, y);
    doc.text('N. do Recibo', 120, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(26, 26, 26);
    doc.text(p.student_name || '-', 18, y);
    doc.text(p.receipt_no, 120, y);
    y += 12;

    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.3);
    doc.line(18, y, W - 18, y);
    y += 12;

    // ── PAYMENT SECTION ─────────────────────────────────
    doc.setFillColor(242, 242, 242);
    doc.rect(18, y, W - 36, 8, 'F');
    doc.setFillColor(200, 38, 30);
    doc.rect(18, y, 3, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text('DETALHES DO PAGAMENTO', 25, y + 5.5);
    y += 13;

    const isPago = (p.status || 'Pago') === 'Pago';

    autoTable(doc, {
      startY: y,
      margin: { left: 18, right: 18 },
      tableWidth: W - 36,
      head: [['Descricao', 'Informacao']],
      body: [
        ['Tipo de Pagamento', p.type],
        ['Mes de Referencia', p.month || '-'],
        ['Data do Pagamento', new Date(p.date + 'T00:00:00').toLocaleDateString('pt-PT')],
        ['Status', isPago ? 'PAGO' : 'PENDENTE'],
      ],
      headStyles: {
        fillColor: [30, 30, 30], textColor: [255, 255, 255],
        fontStyle: 'bold', fontSize: 8,
        cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
      },
      bodyStyles: { fontSize: 9, cellPadding: { top: 6, bottom: 6, left: 8, right: 8 } },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [80, 80, 80], cellWidth: 80 },
        1: { textColor: [30, 30, 30] },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1 && data.row.index === 3) {
          data.cell.styles.textColor = isPago ? [22, 163, 74] : [220, 100, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ── TOTAL BOX ───────────────────────────────────────
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(18, y, W - 36, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text('VALOR TOTAL', 26, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(`${Number(p.amount).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz`, W - 26, y + 13, { align: 'right' });
    y += 28;

    // ── SIGNATURES ──────────────────────────────────────
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(18, y + 14, 88, y + 14);
    doc.line(W - 88, y + 14, W - 18, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('Assinatura e Carimbo da Instituicao', 53, y + 19, { align: 'center' });
    doc.text('Assinatura do Recebedor', W - 53, y + 19, { align: 'center' });
    y += 30;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Obrigado pela sua preferencia!', W / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text('Este documento e valido como comprovante de pagamento.', W / 2, y + 6, { align: 'center' });

    // ── FOOTER ──────────────────────────────────────────
    doc.setFillColor(200, 38, 30);
    doc.rect(0, H - 18, W, 1.5, 'F');
    doc.setFillColor(26, 26, 26);
    doc.rect(0, H - 16.5, W, 16.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(210, 210, 210);
    doc.text('IMPAGME - Instituto Mundo do Ensino', W / 2, H - 9, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 18, H - 4);
    doc.text('Pag. 1 / 1', W - 18, H - 4, { align: 'right' });

    doc.save(`Recibo_${p.receipt_no}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão Financeira</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('payments')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'payments' ? 'bg-white shadow-sm text-impagme-red' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Receitas
          </button>
          <button 
            onClick={() => setView('expenses')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'expenses' ? 'bg-white shadow-sm text-impagme-red' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Despesas
          </button>
        </div>
      </div>

      {/* Financial Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Receita Total (Paga)</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.revenue?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || '0,00 Kz'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-white border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <LogOut size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Despesas Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.expenses?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || '0,00 Kz'}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-white border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Saldos Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pending?.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) || '0,00 Kz'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {view === 'payments' ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Listagem de Receitas</h3>
            <div className="flex gap-4">
              <select 
                className="input-field py-1 text-sm w-40"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos">Todos Status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>
              <button onClick={openNewPaymentModal} className="btn-primary flex items-center gap-2">
                <Plus size={20} /> Novo Pagamento
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Recibo</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aluno</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mês</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Valor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{p.receipt_no}</td>
                      <td className="px-6 py-4">{p.student_name}</td>
                      <td className="px-6 py-4">{p.month}</td>
                      <td className="px-6 py-4 font-bold">{p.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status || 'Pago'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleEditPayment(p)}
                            className="text-gray-400 hover:text-impagme-red transition-colors"
                            title="Editar"
                          >
                            <Settings2 size={18} />
                          </button>
                          <button 
                            onClick={() => generateReceiptPDF(p)}
                            className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                          >
                            <Download size={14} /> Recibo
                          </button>
                          <button 
                            onClick={() => setConfirmDelete({ isOpen: true, id: p.id, type: 'payment' })}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Listagem de Despesas</h3>
            <button onClick={() => { setIsEditing(false); setExpenseData({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Outros' }); setShowExpenseModal(true); }} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Nova Despesa
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Descrição</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Categoria</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Valor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{e.description}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-red-600">-{e.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleEditExpense(e)}
                            className="text-gray-400 hover:text-impagme-red transition-colors"
                            title="Editar"
                          >
                            <Settings2 size={18} />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete({ isOpen: true, id: e.id, type: 'expense' })}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ConfirmationDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false, id: null })}
        onConfirm={handleDelete}
        title={confirmDelete.type === 'payment' ? "Excluir Registro de Receita" : "Excluir Registro de Despesa"}
        message="Tem certeza que deseja excluir este registro financeiro? Esta ação é irreversível."
      />

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Pagamento' : 'Registrar Pagamento'}</h3>
                <button onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                {/* Student Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aluno</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Pesquisar por nome, BI ou nº de matrícula..."
                    value={studentSearch}
                    onChange={e => { setStudentSearch(e.target.value); setSelectedStudent(null); setFormData(prev => ({ ...prev, student_id: '' })); }}
                    autoComplete="off"
                    required={!formData.student_id}
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-9 text-gray-400 text-xs">A pesquisar...</div>
                  )}
                  {studentResults.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {studentResults.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => selectStudent(s)}
                          className="w-full text-left px-4 py-3 hover:bg-impagme-red/5 flex items-center justify-between border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.registration_no} · BI: {s.bi}</p>
                          </div>
                          {s.class_name && (
                            <span className="text-xs bg-impagme-red/10 text-impagme-red px-2 py-0.5 rounded-full font-medium">{s.class_name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Selected student info */}
                {selectedStudent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{selectedStudent.name}</p>
                      {selectedStudent.class_name && (
                        <p className="text-xs text-gray-500">Turma: <span className="font-medium">{selectedStudent.class_name}</span></p>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      className="input-field" required
                      value={formData.type} onChange={e => handleTypeChange(e.target.value)}
                    >
                      <option value="Propina">Propina</option>
                      <option value="Matrícula">Matrícula</option>
                      <option value="Multa">Multa</option>
                      <option value="Prova">Prova</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (Kz)</label>
                    <input
                      type="number" className="input-field" required min="0"
                      value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                    <select
                      className="input-field" required
                      value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}
                    >
                      <option value="">Selecionar</option>
                      {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date" className="input-field" required
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº do Recibo</label>
                    <input
                      type="text" className="input-field font-mono" required
                      value={formData.receipt_no} onChange={e => setFormData({...formData, receipt_no: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="input-field" required
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Pago">Pago</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" disabled={!formData.student_id} className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed">{isEditing ? 'Atualizar' : 'Confirmar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Despesa' : 'Registrar Despesa'}</h3>
                <button onClick={() => setShowExpenseModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleExpenseSubmit} className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input 
                    type="text" className="input-field" required
                    value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})}
                    placeholder="Ex: Pagamento de Energia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="input-field" required
                    value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})}
                  >
                    <option value="Salários">Salários</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Material">Material</option>
                    <option value="Energia/Água">Energia/Água</option>
                    <option value="Renda">Renda</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input 
                      type="date" className="input-field" required
                      value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (Kz)</label>
                    <input 
                      type="number" className="input-field" required
                      value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">{isEditing ? 'Atualizar' : 'Salvar Despesa'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeacherManagement = ({ token, cycle }: { token: string, cycle: string }) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [formData, setFormData] = useState({ name: '', bi: '', contact: '', degree: '', photo: '' });
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [showPassModal, setShowPassModal] = useState<{ isOpen: boolean, teacher: any }>({ isOpen: false, teacher: null });
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);
  const TEACHERS_PER_PAGE = 15;

  const fetchTeachers = async () => {
    const res = await fetch(`/api/teachers?cycle=${encodeURIComponent(cycle)}`, { headers: { 'Authorization': `Bearer ${token}` } });
    setTeachers(await res.json());
  };

  useEffect(() => {
    fetchTeachers();
    fetch(`/api/subjects/all?cycle=${encodeURIComponent(cycle)}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(setAllSubjects);
  }, [cycle]);

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/teachers/${editingId}` : '/api/teachers';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...formData, subject_ids: selectedSubjectIds, cycle })
    });
    if (res.ok) {
      setShowModal(false);
      fetchTeachers();
      if (!isEditing) {
        setShowPassModal({ isOpen: true, teacher: formData });
      }
      setFormData({ name: '', bi: '', contact: '', degree: '', photo: '' });
      setSelectedSubjectIds([]);
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleEdit = (teacher: any) => {
    setFormData({
      name: teacher.name,
      bi: teacher.bi,
      contact: teacher.contact,
      degree: teacher.degree,
      photo: teacher.photo || ''
    });
    setSelectedSubjectIds((teacher.subjects || []).map((s: any) => s.id));
    setEditingId(teacher.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    const res = await fetch(`/api/teachers/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTeachers();
  };

  const filteredTeachers = teachers.filter(t => {
    const q = teacherSearch.toLowerCase();
    return !q || t.name?.toLowerCase().includes(q) || t.bi?.toLowerCase().includes(q) || t.degree?.toLowerCase().includes(q) ||
      (t.subjects || []).some((s: any) => s.name?.toLowerCase().includes(q));
  });
  const totalTeacherPages = Math.max(1, Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE));
  const pagedTeachers = filteredTeachers.slice((teacherPage - 1) * TEACHERS_PER_PAGE, teacherPage * TEACHERS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Professores</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filteredTeachers.length} de {teachers.length} professores</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ name: '', bi: '', contact: '', degree: '', photo: '' }); setSelectedSubjectIds([]); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Novo Professor
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, BI, grau ou disciplina…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
              value={teacherSearch}
              onChange={e => { setTeacherSearch(e.target.value); setTeacherPage(1); }}
            />
            {teacherSearch && (
              <button onClick={() => { setTeacherSearch(''); setTeacherPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">BI</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Grau</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Disciplinas</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Search size={32} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 font-medium">Nenhum professor encontrado</p>
                    <p className="text-sm text-gray-300 mt-1">Tente outro termo de pesquisa</p>
                  </td>
                </tr>
              ) : pagedTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{t.name}</td>
                  <td className="px-6 py-4 text-sm">{t.bi}</td>
                  <td className="px-6 py-4 text-sm">{t.degree}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(t.subjects || []).length === 0
                        ? <span className="text-xs text-gray-400">Nenhuma</span>
                        : (t.subjects || []).map((s: any) => (
                            <span key={s.id} className="px-2 py-0.5 bg-impagme-red/10 text-impagme-red text-xs font-medium rounded-full">{s.name}</span>
                          ))
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="text-gray-400 hover:text-impagme-red transition-colors"
                        title="Editar"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => setShowPassModal({ isOpen: true, teacher: t })}
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        <Printer size={14} /> Passe
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: t.id })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalTeacherPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {(teacherPage - 1) * TEACHERS_PER_PAGE + 1}–{Math.min(teacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} de {filteredTeachers.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTeacherPage(p => Math.max(1, p - 1))}
                disabled={teacherPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              {Array.from({ length: totalTeacherPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalTeacherPages || Math.abs(p - teacherPage) <= 1)
                .reduce((acc: (number | string)[], p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '…'
                  ? <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  : <button
                      key={p}
                      onClick={() => setTeacherPage(p as number)}
                      className={`w-8 h-8 text-sm rounded-lg font-medium ${teacherPage === p ? 'bg-impagme-red text-white' : 'text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    >{p}</button>
                )
              }
              <button
                onClick={() => setTeacherPage(p => Math.min(totalTeacherPages, p + 1))}
                disabled={teacherPage === totalTeacherPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmationDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Excluir Professor"
        message="Tem certeza que deseja excluir este professor? O acesso dele ao sistema será removido."
      />
      <AnimatePresence>
        {showPassModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Passe do Professor</h3>
                <button onClick={() => setShowPassModal({ isOpen: false, teacher: null })}><X size={24} /></button>
              </div>
              <div className="p-8">
                <IDCard data={showPassModal.teacher} role="PROFESSOR" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Professor' : 'Cadastrar Professor'}</h3>
                <button onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <PhotoCapture onCapture={(photo) => setFormData({...formData, photo})} />
                <input type="text" placeholder="Nome Completo" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="BI" className="input-field" required value={formData.bi} onChange={e => setFormData({...formData, bi: e.target.value})} />
                <input type="text" placeholder="Contacto" className="input-field" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                <input type="text" placeholder="Grau Acadêmico" className="input-field" required value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disciplinas que leciona</label>
                  {allSubjects.length === 0
                    ? <p className="text-xs text-gray-400">Carregando disciplinas...</p>
                    : <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {allSubjects.map(s => (
                          <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
                            <input
                              type="checkbox"
                              checked={selectedSubjectIds.includes(s.id)}
                              onChange={() => toggleSubject(s.id)}
                              className="rounded border-gray-300 text-impagme-red focus:ring-impagme-red"
                            />
                            <span className="text-sm text-gray-700">{s.name}</span>
                          </label>
                        ))}
                      </div>
                  }
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">{isEditing ? 'Atualizar' : 'Salvar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClassStudentManagement = ({ token, classId, className, onBack, onViewProfile }: { token: string, classId: number, className: string, onBack: () => void, onViewProfile: (id: number) => void }) => {
  const [tab, setTab] = useState<'students' | 'teachers'>('students');

  // Students
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Teachers
  const [classTeachers, setClassTeachers] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({ teacher_id: '', subject_id: '' });
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const [classRes, allRes] = await Promise.all([
        fetch(`/api/classes/${classId}/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setClassStudents(await classRes.json());
      setAllStudents(await allRes.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const fetchTeacherData = async () => {
    const [ctRes, tRes] = await Promise.all([
      fetch(`/api/classes/${classId}/teachers`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/teachers', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    const ctData = await ctRes.json();
    const tData = await tRes.json();
    setClassTeachers(Array.isArray(ctData) ? ctData : []);
    setAllTeachers(Array.isArray(tData) ? tData : []);
  };

  useEffect(() => { fetchStudentData(); fetchTeacherData(); }, [classId]);

  useEffect(() => {
    if (!assignForm.teacher_id) { setTeacherSubjects([]); setAssignForm(f => ({ ...f, subject_id: '' })); return; }
    const t = allTeachers.find((t: any) => String(t.id) === assignForm.teacher_id);
    setTeacherSubjects(t?.subjects || []);
    setAssignForm(f => ({ ...f, subject_id: '' }));
  }, [assignForm.teacher_id, allTeachers]);

  const handleAddStudent = async (studentId: number) => {
    const res = await fetch(`/api/classes/${classId}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ student_id: studentId })
    });
    if (res.ok) fetchStudentData();
  };

  const handleRemoveStudent = async (studentId: number) => {
    const res = await fetch(`/api/classes/${classId}/students/${studentId}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchStudentData();
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.teacher_id || !assignForm.subject_id) return;
    const res = await fetch(`/api/classes/${classId}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ teacher_id: parseInt(assignForm.teacher_id), subject_id: parseInt(assignForm.subject_id) })
    });
    if (res.ok) { fetchTeacherData(); setAssignForm({ teacher_id: '', subject_id: '' }); }
  };

  const handleRemoveTeacher = async (assignmentId: number) => {
    const res = await fetch(`/api/classes/${classId}/teachers/${assignmentId}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTeacherData();
  };

  const availableStudents = allStudents.filter(s =>
    !classStudents.some(cs => cs.id === s.id) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.registration_no.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Gerir Turma — {className}</h2>
          <p className="text-sm text-gray-500">Alunos e Professores desta turma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['students', 'teachers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-impagme-red' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'students' ? `Alunos (${classStudents.length})` : `Professores (${classTeachers.length})`}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-impagme-red" />Alunos na Turma ({classStudents.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {isLoading ? <p className="text-center py-8 text-gray-400">Carregando...</p>
                : classStudents.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Users size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-gray-400 text-sm">Nenhum aluno nesta turma</p>
                  </div>
                ) : classStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-impagme-red/10 text-impagme-red rounded-full flex items-center justify-center font-bold text-xs">
                        {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <button onClick={() => onViewProfile(student.id)} className="text-sm font-bold text-gray-900 hover:text-impagme-red transition-colors text-left">{student.name}</button>
                        <p className="text-[10px] font-mono text-gray-400">{student.registration_no}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveStudent(student.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Adicionar Alunos</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Pesquisar por nome ou matrícula..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-2 max-h-[430px] overflow-y-auto pr-2">
              {availableStudents.length === 0 ? <p className="text-center py-8 text-gray-400 text-sm">Nenhum aluno disponível</p>
                : availableStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-impagme-red/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-xs">
                        {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div><p className="text-sm font-bold text-gray-900">{student.name}</p><p className="text-[10px] font-mono text-gray-400">{student.registration_no}</p></div>
                    </div>
                    <button onClick={() => handleAddStudent(student.id)} className="p-2 text-impagme-red hover:bg-red-50 rounded-lg transition-all"><Plus size={20} /></button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><UserSquare2 size={20} className="text-impagme-red" />Professores Atribuídos ({classTeachers.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {classTeachers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <UserSquare2 size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-gray-400 text-sm">Nenhum professor atribuído</p>
                </div>
              ) : classTeachers.map((ct: any) => (
                <div key={ct.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                      {ct.teacher_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ct.teacher_name}</p>
                      <p className="text-xs text-impagme-red font-medium">{ct.subject_name}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveTeacher(ct.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Atribuir Professor</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <select className="input-field" value={assignForm.teacher_id} onChange={e => setAssignForm(f => ({ ...f, teacher_id: e.target.value }))} required>
                  <option value="">Selecionar Professor</option>
                  {allTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}{t.degree ? ` (${t.degree})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                <select className="input-field" value={assignForm.subject_id} onChange={e => setAssignForm(f => ({ ...f, subject_id: e.target.value }))} required disabled={!assignForm.teacher_id}>
                  <option value="">{assignForm.teacher_id ? 'Selecionar Disciplina' : 'Primeiro selecione um professor'}</option>
                  {teacherSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {assignForm.teacher_id && teacherSubjects.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Este professor não tem disciplinas no perfil. Edite-o primeiro.</p>
                )}
              </div>
              <button type="submit" disabled={!assignForm.teacher_id || !assignForm.subject_id} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Plus size={18} /> Atribuir à Turma
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CYCLE_YEARS: Record<string, string[]> = {
  '1º Ciclo': ['Iniciação', '1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª', '9ª'],
  '2º Ciclo': ['10ª', '11ª', '12ª', '13ª'],
};

const ClassManagement = ({ token, onViewProfile, cycle, schoolYear }: { token: string, onViewProfile: (id: number) => void, cycle: string, schoolYear?: string }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [formData, setFormData] = useState({ name: '', year: '', shift: 'Manhã', room_number: '', cycle, academic_year: schoolYear ?? '2026/2027' });
  const [selectedClass, setSelectedClass] = useState<{ id: number, name: string } | null>(null);

  const [allClasses, setAllClasses] = useState<any[]>([]);
  const filteredClasses = allClasses.filter((c: any) => (c.cycle || '2º Ciclo') === cycle);

  const fetchClasses = async () => {
    const res = await fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    setAllClasses(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchClasses(); }, []);

  if (selectedClass) {
    return (
      <ClassStudentManagement 
        token={token} 
        classId={selectedClass.id} 
        className={selectedClass.name}
        onBack={() => {
          setSelectedClass(null);
          fetchClasses();
        }}
        onViewProfile={onViewProfile}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/classes/${editingId}` : '/api/classes';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowModal(false);
      fetchClasses();
      setFormData({ name: '', year: '', shift: 'Manhã', room_number: '', cycle, academic_year: schoolYear ?? '2026/2027' });
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleEdit = (c: any) => {
    setFormData({
      name: c.name,
      year: c.year,
      shift: c.shift,
      room_number: c.room_number || '',
      cycle: c.cycle || cycle,
      academic_year: c.academic_year || schoolYear || '2026/2027'
    });
    setEditingId(c.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    const res = await fetch(`/api/classes/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Turmas</h2>
          <p className="text-sm text-gray-500 mt-1">A mostrar turmas do <span className="font-semibold text-impagme-red">{cycle}</span></p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ name: '', year: '', shift: 'Manhã', room_number: '', cycle, academic_year: schoolYear ?? '2026/2027' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Nova Turma
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Turma</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Classe</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ano Lectivo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Período</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Sala</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">IDs Alunos</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold">{c.name}</td>
                  <td className="px-6 py-4">{c.year}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{c.academic_year || '2025/2026'}</span>
                  </td>
                  <td className="px-6 py-4">{c.shift}</td>
                  <td className="px-6 py-4">{c.room_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-[150px] truncate text-xs font-mono text-gray-400" title={c.student_ids || 'Nenhum aluno'}>
                      {c.student_ids || '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                      {c.student_count || 0} Alunos
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="text-gray-400 hover:text-impagme-red transition-colors"
                        title="Editar"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedClass({ id: c.id, name: c.name })}
                        className="text-impagme-red text-sm font-bold flex items-center gap-1"
                      >
                        Gerir <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: c.id })}
                        className="text-gray-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Excluir Turma"
        message="Tem certeza que deseja excluir esta turma? Todos os vínculos de alunos e professores serão removidos."
      />
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Turma' : 'Criar Nova Turma'}</h3>
                <button onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <input type="text" placeholder="Nome da Turma (Ex: 10ª A - Gestão)" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <select className="input-field" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                  <option value="">Seleccionar Classe</option>
                  {(CYCLE_YEARS[formData.cycle] || CYCLE_YEARS['2º Ciclo']).map(y => (
                    <option key={y} value={y}>{y} Classe</option>
                  ))}
                </select>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ano Lectivo</label>
                  <input type="text" className="input-field" required pattern="\d{4}/\d{4}" title="Formato: AAAA/AAAA"
                    value={formData.academic_year}
                    onChange={e => setFormData({...formData, academic_year: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select className="input-field" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                  <input type="text" placeholder="Sala" className="input-field" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">{isEditing ? 'Atualizar' : 'Salvar Turma'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffManagement = ({ token }: { token: string }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [formData, setFormData] = useState({ name: '', bi: '', role: 'Secretário(a)', contact: '', photo: '' });
  const [showPassModal, setShowPassModal] = useState<{ isOpen: boolean, staff: any }>({ isOpen: false, staff: null });

  const fetchStaff = async () => {
    const res = await fetch('/api/staff', { headers: { 'Authorization': `Bearer ${token}` } });
    setStaff(await res.json());
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/staff/${editingId}` : '/api/staff';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowModal(false);
      fetchStaff();
      if (!isEditing) {
        setShowPassModal({ isOpen: true, staff: formData });
      }
      setFormData({ name: '', bi: '', role: 'Secretário(a)', contact: '', photo: '' });
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleEdit = (s: any) => {
    setFormData({
      name: s.name,
      bi: s.bi,
      role: s.role,
      contact: s.contact,
      photo: s.photo || ''
    });
    setEditingId(s.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    const res = await fetch(`/api/staff/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchStaff();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Funcionários</h2>
        <button onClick={() => { setIsEditing(false); setFormData({ name: '', bi: '', role: 'Secretário(a)', contact: '', photo: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Novo Funcionário
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Função</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">BI</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{s.bi}</td>
                  <td className="px-6 py-4">{s.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(s)}
                        className="text-gray-400 hover:text-impagme-red transition-colors"
                        title="Editar"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => setShowPassModal({ isOpen: true, staff: s })}
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        <Printer size={14} /> Passe
                      </button>
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: s.id })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Excluir Funcionário"
        message="Tem certeza que deseja excluir este funcionário? Se for um secretário, o acesso ao sistema também será removido."
      />
      <AnimatePresence>
        {showPassModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Passe do Funcionário</h3>
                <button onClick={() => setShowPassModal({ isOpen: false, staff: null })}><X size={24} /></button>
              </div>
              <div className="p-8">
                <IDCard data={showPassModal.staff} role={showPassModal.staff?.role?.toUpperCase() || 'FUNCIONÁRIO'} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h3>
                <button onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <PhotoCapture onCapture={(photo) => setFormData({...formData, photo})} />
                <input type="text" placeholder="Nome Completo" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="BI" className="input-field" required value={formData.bi} onChange={e => setFormData({...formData, bi: e.target.value})} />
                <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Diretor(a) Pedagógico(a)">Diretor(a) Pedagógico(a)</option>
                  <option value="Secretário(a)">Secretário(a)</option>
                  <option value="Tesoureiro(a)">Tesoureiro(a)</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Outro">Outro</option>
                </select>
                <input type="text" placeholder="Contacto" className="input-field" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">{isEditing ? 'Atualizar' : 'Salvar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Settings = ({ token, user, schoolYear, onSchoolYearChange }: { token: string, user: User, schoolYear?: string, onSchoolYearChange?: (y: string) => void }) => {
  const [yearInput, setYearInput] = useState(schoolYear ?? '2026/2027');
  const [yearStatus, setYearStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [yearSaving, setYearSaving] = useState(false);

  const handleYearSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setYearSaving(true); setYearStatus(null);
    const res = await fetch('/api/settings/general', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ school_year: yearInput })
    });
    setYearSaving(false);
    if (res.ok) { onSchoolYearChange?.(yearInput); setYearStatus({ type: 'success', msg: 'Ano lectivo actualizado!' }); }
    else setYearStatus({ type: 'error', msg: 'Erro ao guardar.' });
  };
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const emptyFees = { fee_propina: '', fee_matricula: '', fee_multa: '', fee_prova: '', fee_propina_1ciclo: '', fee_matricula_1ciclo: '', fee_multa_1ciclo: '', fee_prova_1ciclo: '' };
  const [fees, setFees] = useState(emptyFees);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [feeStatus, setFeeStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [feesSaving, setFeesSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/fees', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setFees({
          fee_propina: String(data.fee_propina ?? ''),
          fee_matricula: String(data.fee_matricula ?? ''),
          fee_multa: String(data.fee_multa ?? ''),
          fee_prova: String(data.fee_prova ?? ''),
          fee_propina_1ciclo: String(data.fee_propina_1ciclo ?? ''),
          fee_matricula_1ciclo: String(data.fee_matricula_1ciclo ?? ''),
          fee_multa_1ciclo: String(data.fee_multa_1ciclo ?? ''),
          fee_prova_1ciclo: String(data.fee_prova_1ciclo ?? ''),
        });
        setFeesLoaded(true);
      });
  }, [token]);

  const handleFeesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeesSaving(true);
    setFeeStatus(null);
    const body: Record<string, number> = {};
    for (const [k, v] of Object.entries(fees)) { body[k] = parseFloat(v); }
    if (Object.values(body).some(v => isNaN(v) || v < 0)) {
      setFeeStatus({ type: 'error', msg: 'Todos os valores devem ser números positivos.' });
      setFeesSaving(false);
      return;
    }
    const res = await fetch('/api/settings/fees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    setFeesSaving(false);
    if (res.ok) setFeeStatus({ type: 'success', msg: 'Propinas actualizadas com sucesso!' });
    else setFeeStatus({ type: 'error', msg: 'Erro ao guardar as propinas.' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setStatus({ type: 'error', msg: 'As novas senhas não coincidem' });
    }

    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
    });

    if (res.ok) {
      setStatus({ type: 'success', msg: 'Senha alterada com sucesso!' });
      setPasswords({ current: '', new: '', confirm: '' });
    } else {
      const data = await res.json();
      setStatus({ type: 'error', msg: data.error || 'Erro ao alterar senha' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Configurações</h2>

      {user.role === 'admin' && (
        <div className="card">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <CalendarDays size={20} className="text-impagme-red" /> Ano Lectivo
          </h3>
          <p className="text-sm text-gray-500 mb-4">Defina o ano lectivo activo exibido em todo o sistema e documentos.</p>
          {yearStatus && (
            <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${yearStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {yearStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{yearStatus.msg}</span>
            </div>
          )}
          <form onSubmit={handleYearSave} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano Lectivo</label>
              <input type="text" className="input-field" placeholder="Ex: 2026/2027" value={yearInput}
                onChange={e => setYearInput(e.target.value)} required pattern="\d{4}/\d{4}" title="Formato: AAAA/AAAA" />
            </div>
            <button type="submit" disabled={yearSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-60">
              <Save size={16} />{yearSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="card">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <DollarSign size={20} className="text-impagme-red" /> Valores das Propinas
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Defina os valores padrão usados no registo de pagamentos.
          </p>

          {feeStatus && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${feeStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feeStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{feeStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleFeesSave}>
            {[
              { label: '2º Ciclo — Ensino Médio', color: 'text-impagme-red', fields: [
                { key: 'fee_propina',   label: 'Propina Mensal' },
                { key: 'fee_matricula', label: 'Matrícula' },
                { key: 'fee_multa',     label: 'Multa' },
                { key: 'fee_prova',     label: 'Prova / Exame' },
              ]},
              { label: '1º Ciclo — Iniciação ao 9º', color: 'text-blue-600', fields: [
                { key: 'fee_propina_1ciclo',   label: 'Propina Mensal' },
                { key: 'fee_matricula_1ciclo', label: 'Matrícula' },
                { key: 'fee_multa_1ciclo',     label: 'Multa' },
                { key: 'fee_prova_1ciclo',     label: 'Prova / Exame' },
              ]},
            ].map(({ label, color, fields }) => (
              <div key={label} className="mb-6">
                <p className={`text-sm font-bold mb-3 ${color}`}>{label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(({ key, label: fl }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{fl}</label>
                      <div className="relative">
                        <input type="number" min="0" step="any" required disabled={!feesLoaded}
                          className="input-field pr-12"
                          value={fees[key as keyof typeof fees]}
                          onChange={e => setFees(f => ({ ...f, [key]: e.target.value }))} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">Kz</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Os novos valores aplicam-se a partir do próximo pagamento registado.
              </p>
              <button
                type="submit"
                disabled={feesSaving || !feesLoaded}
                className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-60"
              >
                {feesSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {feesSaving ? 'A guardar…' : 'Guardar Valores'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Lock size={20} className="text-impagme-red" /> Alterar Senha
        </h3>
        
        {status && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
            <input 
              type="password" className="input-field" required 
              value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input 
                type="password" className="input-field" required 
                value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input 
                type="password" className="input-field" required 
                value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3 mt-4">
            Atualizar Senha
          </button>
        </form>
      </div>

      <div className="card bg-gray-50 border-dashed border-2">
        <h3 className="text-lg font-bold mb-2">Informações do Perfil</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Usuário</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-gray-500">Nível de Acesso</p>
            <p className="font-medium">
              {user.role === 'admin' ? 'Administrador' :
               user.role === 'finance' ? 'Secretário(a)' :
               user.role === 'teacher' ? 'Professor(a)' :
               user.role === 'student' ? 'Aluno(a)' : user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = ({ token, cycle, schoolYear }: { token: string, cycle: string, schoolYear?: string }) => {
  const [reportType, setReportType] = useState<'academic' | 'financial'>('academic');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ class_id: '', month: '', year: String(new Date().getFullYear()), status: '' });
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setClasses(Array.isArray(data) ? data.filter((c: any) => (c.cycle || '2º Ciclo') === cycle) : []));
  }, [token, cycle]);

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = reportType === 'academic'
        ? `/api/students`
        : `/api/payments?cycle=${encodeURIComponent(cycle)}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      let result = await res.json();

      // Filter academic results by cycle via class membership
      if (reportType === 'academic') {
        const cycleClassIds = new Set(classes.map((c: any) => c.id));
        result = result.filter((s: any) => cycleClassIds.has(s.class_id));
      }

      // Basic filtering logic on client side
      if (reportType === 'financial' && filter.status) {
        result = result.filter((p: any) => p.status === filter.status);
      }
      
      if (reportType === 'financial' && filter.month) {
        result = result.filter((p: any) => p.month === filter.month);
      }
      
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (data.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;
    const isFinancial = reportType === 'financial';

    // ── HEADER ──────────────────────────────────────────
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, W, 38, 'F');
    doc.setFillColor(200, 38, 30);
    doc.rect(0, 38, W, 2.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('IMPAGME', 18, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(170, 170, 170);
    doc.text('INSTITUTO MUNDO DO ENSINO', 18, 26);
    doc.setFillColor(200, 38, 30);
    doc.rect(18, 29, 44, 0.7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(isFinancial ? 'RELATORIO FINANCEIRO' : 'RELATORIO ACADEMICO', W - 18, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    const filterDesc = isFinancial
      ? `Mes: ${filter.month || 'Todos'} | Status: ${filter.status || 'Todos'}`
      : `Turma: ${filter.class_id ? (classes.find((c: any) => String(c.id) === filter.class_id)?.name || '-') : 'Todas'}`;
    doc.text(`Ano Lectivo: ${schoolYear ?? '2026/2027'}`, W - 18, 27, { align: 'right' });
    doc.text(filterDesc, W - 18, 33, { align: 'right' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, W - 18, 38, { align: 'right' });

    let y = 50;

    // ── SUMMARY CARDS ───────────────────────────────────
    if (isFinancial) {
      const paid = data.filter((p: any) => p.status === 'Pago');
      const pending = data.filter((p: any) => p.status !== 'Pago');
      const paidTotal = paid.reduce((s: number, p: any) => s + Number(p.amount), 0);
      const pendingTotal = pending.reduce((s: number, p: any) => s + Number(p.amount), 0);
      const cards = [
        ['Total de Registros', String(data.length)],
        ['Pagamentos Efetuados', String(paid.length)],
        ['Total Arrecadado', `${paidTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz`],
        ['Pagamentos Pendentes', String(pending.length)],
        ['Total Pendente', `${pendingTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz`],
      ];
      const bw = (W - 36 - (cards.length - 1) * 4) / cards.length;
      cards.forEach(([label, value], i) => {
        const bx = 18 + i * (bw + 4);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(bx, y, bw, 22, 2, 2, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(bx, y, bw, 22, 2, 2, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(130, 130, 130);
        doc.text(label, bx + bw / 2, y + 7, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(26, 26, 26);
        doc.text(value, bx + bw / 2, y + 16, { align: 'center' });
      });
    } else {
      const active = data.filter((s: any) => !s.status || s.status === 'Ativo');
      const cards = [
        ['Total de Alunos', String(data.length)],
        ['Ativos', String(active.length)],
        ['Inativos', String(data.length - active.length)],
      ];
      const bw = (W - 36 - 8) / 3;
      cards.forEach(([label, value], i) => {
        const bx = 18 + i * (bw + 4);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(bx, y, bw, 22, 2, 2, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(bx, y, bw, 22, 2, 2, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(130, 130, 130);
        doc.text(label, bx + bw / 2, y + 7, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(26, 26, 26);
        doc.text(value, bx + bw / 2, y + 16, { align: 'center' });
      });
    }
    y += 30;

    // ── DATA TABLE ──────────────────────────────────────
    if (isFinancial) {
      const grandTotal = data.reduce((s: number, p: any) => s + Number(p.amount), 0);
      autoTable(doc, {
        startY: y,
        margin: { left: 18, right: 18 },
        head: [['#', 'N. Recibo', 'Aluno', 'Tipo', 'Mes', 'Data', 'Valor (Kz)', 'Status']],
        body: data.map((p: any, i: number) => [
          i + 1,
          p.receipt_no,
          p.student_name,
          p.type,
          p.month || '-',
          new Date(p.date + 'T00:00:00').toLocaleDateString('pt-PT'),
          Number(p.amount).toLocaleString('pt-PT', { minimumFractionDigits: 2 }),
          p.status || 'Pago',
        ]),
        foot: [['', '', '', '', '', 'TOTAL', grandTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' Kz', '']],
        headStyles: {
          fillColor: [26, 26, 26], textColor: [255, 255, 255],
          fontStyle: 'bold', fontSize: 8,
          cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        bodyStyles: { fontSize: 7.5, cellPadding: { top: 4, bottom: 4, left: 5, right: 5 } },
        footStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', textColor: [160, 160, 160] },
          1: { fontStyle: 'bold', textColor: [200, 38, 30] },
          6: { halign: 'right', fontStyle: 'bold' },
          7: { halign: 'center' },
        },
        didParseCell: (hookData: any) => {
          if (hookData.section === 'body' && hookData.column.index === 7) {
            const s = hookData.cell.raw as string;
            hookData.cell.styles.textColor = s === 'Pago' ? [22, 163, 74] : [220, 100, 0];
            hookData.cell.styles.fontStyle = 'bold';
          }
        },
      });
    } else {
      autoTable(doc, {
        startY: y,
        margin: { left: 18, right: 18 },
        head: [['#', 'N. Matricula', 'Nome do Aluno', 'BI', 'Status']],
        body: data.map((s: any, i: number) => [
          i + 1,
          s.registration_no,
          s.name,
          s.bi || '-',
          s.status || 'Ativo',
        ]),
        headStyles: {
          fillColor: [26, 26, 26], textColor: [255, 255, 255],
          fontStyle: 'bold', fontSize: 8.5,
          cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
        },
        bodyStyles: { fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 5, right: 5 } },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center', textColor: [160, 160, 160] },
          1: { fontStyle: 'bold', textColor: [200, 38, 30] },
          4: { halign: 'center' },
        },
        didParseCell: (hookData: any) => {
          if (hookData.section === 'body' && hookData.column.index === 4) {
            const s = hookData.cell.raw as string;
            hookData.cell.styles.textColor = s === 'Ativo' ? [22, 163, 74] : [200, 38, 30];
            hookData.cell.styles.fontStyle = 'bold';
          }
        },
      });
    }

    // ── FOOTER ON ALL PAGES ─────────────────────────────
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(200, 38, 30);
      doc.rect(0, H - 12, W, 1, 'F');
      doc.setFillColor(26, 26, 26);
      doc.rect(0, H - 11, W, 11, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(200, 200, 200);
      doc.text('IMPAGME - Instituto Mundo do Ensino', W / 2, H - 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(130, 130, 130);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 18, H - 2.5);
      doc.text(`Pag. ${i} / ${pageCount}`, W - 18, H - 2.5, { align: 'right' });
    }

    const fname = isFinancial
      ? `Relatorio_Financeiro_${filter.month || 'Completo'}_${new Date().toISOString().split('T')[0]}.pdf`
      : `Relatorio_Academico_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fname);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios e Estatísticas</h2>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download size={18} /> Exportar PDF
          </button>
          <button onClick={generateReport} className="btn-primary flex items-center gap-2">
            <FileText size={18} /> Gerar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <h3 className="font-bold border-b pb-2">Configurações</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button 
                onClick={() => { setReportType('academic'); setData([]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'academic' ? 'bg-white shadow-sm text-impagme-red' : 'text-gray-500'}`}
              >
                Acadêmico
              </button>
              <button 
                onClick={() => { setReportType('financial'); setData([]); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${reportType === 'financial' ? 'bg-white shadow-sm text-impagme-red' : 'text-gray-500'}`}
              >
                Financeiro
              </button>
            </div>
          </div>

          {reportType === 'academic' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
              <select 
                className="input-field"
                value={filter.class_id}
                onChange={e => setFilter({...filter, class_id: e.target.value})}
              >
                <option value="">Todas as Turmas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
              <select 
                className="input-field"
                value={filter.month}
                onChange={e => setFilter({...filter, month: e.target.value})}
              >
                <option value="">Todos os Meses</option>
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">Status</label>
              <select 
                className="input-field"
                value={filter.status}
                onChange={e => setFilter({...filter, status: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          )}
        </div>

        <div className="md:col-span-2 card min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Pré-visualização</h3>
            {data.length > 0 && <span className="text-xs text-gray-400">{data.length} registros encontrados</span>}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-12 h-12 border-4 border-impagme-red/20 border-t-impagme-red rounded-full animate-spin mb-4"></div>
              <p>Processando dados...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  {reportType === 'academic' ? (
                    <tr>
                      <th className="px-4 py-3 font-semibold">Matrícula</th>
                      <th className="px-4 py-3 font-semibold">Nome</th>
                      <th className="px-4 py-3 font-semibold">BI</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 font-semibold">Recibo</th>
                      <th className="px-4 py-3 font-semibold">Aluno</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {reportType === 'academic' ? (
                        <>
                          <td className="px-4 py-3 font-mono text-impagme-red">{item.registration_no}</td>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.bi}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                              {item.status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-mono">{item.receipt_no}</td>
                          <td className="px-4 py-3">{item.student_name}</td>
                          <td className="px-4 py-3">{item.type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {item.status || 'Pago'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            {item.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                {reportType === 'financial' && (
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">Total Geral:</td>
                      <td className="px-4 py-3 text-right text-impagme-red">
                        {data.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Configure os filtros e clique em "Gerar Relatório"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ token }: { token: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-20 text-center">Carregando portal...</div>;
  if (!data || !data.student) return <div className="p-20 text-center text-red-500">Erro ao carregar dados do aluno. Certifique-se de que seu perfil está configurado corretamente.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Olá, {data.student?.name}</h2>
          <p className="text-gray-500 mt-1">Bem-vindo ao seu portal acadêmico.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Nº Matrícula</p>
          <p className="font-mono font-bold text-impagme-red">{data.student?.registration_no}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Class Info */}
          <div className="card bg-impagme-dark text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BookOpen size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Minha Turma Atual</h3>
              {data.class ? (
                <div className="space-y-4">
                  <p className="text-4xl font-bold">{data.class?.name}</p>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500">Sala de Aula</p>
                      <p className="text-xl font-bold text-impagme-red">{data.class.room_number || 'A definir'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Período</p>
                      <p className="text-xl font-bold">{data.class.shift}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ano Letivo</p>
                      <p className="text-xl font-bold">{data.class.year}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xl text-gray-500">Nenhuma turma vinculada no momento.</p>
              )}
            </div>
          </div>

          {/* Payments History */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Histórico de Propinas</h3>
              <Wallet className="text-gray-300" size={24} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Mês</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Valor</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.payments.length > 0 ? data.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium">{p.month}</td>
                      <td className="px-4 py-3">{p.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.date}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-400 italic">Nenhum pagamento registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="card text-center py-8">
            <div className="w-20 h-20 bg-red-50 text-impagme-red rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>
            <h4 className="text-lg font-bold">Situação Financeira</h4>
            <p className="text-gray-500 text-sm mt-1">
              {data.payments.filter((p: any) => p.status === 'Pendente').length > 0 
                ? 'Existem mensalidades pendentes.' 
                : 'Todas as mensalidades estão em dia.'}
            </p>
          </div>

          {/* Academic Calendar */}
          <div className="card">
            <h3 className="font-bold mb-4">Avisos</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-600 uppercase">Secretaria</p>
                <p className="text-sm font-medium mt-1">Confirmação de matrículas até 15/03.</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-impagme-red">
                <p className="text-xs font-bold text-impagme-red uppercase">Pedagogia</p>
                <p className="text-sm font-medium mt-1">Calendário de provas disponível no mural.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  finance: 'Secretário(a)',
  teacher: 'Professor(a)',
  student: 'Aluno(a)',
};
const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-impagme-red/10 text-impagme-red',
  finance: 'bg-blue-100 text-blue-700',
  teacher: 'bg-green-100 text-green-700',
  student: 'bg-gray-100 text-gray-600',
};

const UserManagement = ({ token }: { token: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [resetModal, setResetModal] = useState<{ isOpen: boolean, userId: number | null, username: string }>({ isOpen: false, userId: null, username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', confirmPassword: '', role: 'finance' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: number | null, username: string }>({ isOpen: false, id: null, username: '' });

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
    setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: resetModal.userId, newPassword })
    });
    if (res.ok) {
      setResetModal({ isOpen: false, userId: null, username: '' });
      setNewPassword('');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError('As senhas não coincidem.');
      return;
    }
    if (createForm.password.length < 4) {
      setCreateError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    setCreateLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: createForm.username, password: createForm.password, role: createForm.role })
    });
    const data = await res.json();
    setCreateLoading(false);
    if (res.ok) {
      setShowCreateModal(false);
      setCreateForm({ username: '', password: '', confirmPassword: '', role: 'finance' });
      fetchUsers();
    } else {
      setCreateError(data.error || 'Erro ao criar utilizador.');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    await fetch(`/api/admin/users/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setConfirmDelete({ isOpen: false, id: null, username: '' });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Utilizadores</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} conta{users.length !== 1 ? 's' : ''} no sistema</p>
        </div>
        <button onClick={() => { setCreateError(''); setCreateForm({ username: '', password: '', confirmPassword: '', role: 'finance' }); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Novo Utilizador
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Utilizador</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Função</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { setNewPassword(''); setResetModal({ isOpen: true, userId: u.id, username: u.username }); }}
                        className="text-impagme-red hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        <Lock size={14} /> Redefinir Senha
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => setConfirmDelete({ isOpen: true, id: u.id, username: u.username })}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar utilizador"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Criar Utilizador</h3>
                <button onClick={() => setShowCreateModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome de Utilizador</label>
                  <input
                    type="text" className="input-field" required
                    placeholder="ex: joao.silva"
                    value={createForm.username}
                    onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Função no Sistema</label>
                  <select
                    className="input-field"
                    value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  >
                    <option value="finance">Secretário(a) — acesso ao Financeiro</option>
                    <option value="teacher">Professor(a) — acesso ao Académico</option>
                    <option value="student">Aluno(a) — acesso ao Portal do Aluno</option>
                    <option value="admin">Administrador — acesso total</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
                  <input
                    type="password" className="input-field" required minLength={4}
                    placeholder="Mínimo 4 caracteres"
                    value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Senha</label>
                  <input
                    type="password" className="input-field" required
                    placeholder="Repita a senha"
                    value={createForm.confirmPassword}
                    onChange={e => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>
                {createError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {createError}
                  </div>
                )}
                <div className="flex justify-end gap-4 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" disabled={createLoading} className="btn-primary px-8 flex items-center gap-2 disabled:opacity-60">
                    {createLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {createLoading ? 'A criar…' : 'Criar Conta'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-impagme-dark text-white p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold">Redefinir Senha</h3>
                <button onClick={() => setResetModal({ isOpen: false, userId: null, username: '' })}><X size={24} /></button>
              </div>
              <form onSubmit={handleReset} className="p-8 space-y-4">
                <p className="text-sm text-gray-500">A redefinir a senha de: <strong>{resetModal.username}</strong></p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                  <input
                    type="password" className="input-field" required
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setResetModal({ isOpen: false, userId: null, username: '' })} className="px-6 py-2 text-gray-600 font-medium">Cancelar</button>
                  <button type="submit" className="btn-primary px-8">Confirmar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, username: '' })}
        onConfirm={handleDelete}
        title="Eliminar Utilizador"
        message={`Tem a certeza que deseja eliminar a conta "${confirmDelete.username}"? Esta ação é irreversível.`}
      />
    </div>
  );
};

const GradeManagement = ({ token, cycle }: { token: string, cycle: string }) => {
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const classes = allClasses.filter((c: any) => (c.cycle || '2º Ciclo') === cycle);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('T1');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(setAllClasses);
    fetch(`/api/subjects?cycle=${encodeURIComponent(cycle)}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(setSubjects);
  }, [token, cycle]);

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedPeriod) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/classes/${selectedClass}/subjects/${selectedSubject}/grades/${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStudents(data.map((s: any) => ({ ...s, score: s.score !== null ? s.score.toString() : '' })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [selectedClass, selectedSubject, selectedPeriod]);

  const handleScoreChange = (studentId: number, score: string) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, score } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/grades/batch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: selectedClass,
          subject_id: selectedSubject,
          period: selectedPeriod,
          grades: students.map(s => ({ student_id: s.student_id, score: parseFloat(s.score) || 0 }))
        })
      });
      if (res.ok) {
        alert('Notas salvas com sucesso!');
        fetchGrades();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lançamento de Notas</h2>
        <button 
          onClick={handleSave} 
          disabled={saving || !selectedClass || !selectedSubject || students.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? 'Salvando...' : <><Plus size={20} /> Adicionar Notas</>}
        </button>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
          <select 
            className="input-field" 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">Selecionar Turma</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.year})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
          <select 
            className="input-field" 
            value={selectedSubject} 
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">Selecionar Disciplina</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select 
            className="input-field" 
            value={selectedPeriod} 
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            <option value="T1">1º Trimestre</option>
            <option value="T2">2º Trimestre</option>
            <option value="T3">3º Trimestre</option>
            <option value="EXAME">Exame</option>
            <option value="RECURSO">Recurso</option>
          </select>
        </div>
      </div>

      {selectedClass && selectedSubject ? (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Carregando lista de alunos...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Aluno</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-32">Nota</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.length > 0 ? students.map((s) => (
                      <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{s.student_name}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="20"
                            className="input-field py-1 px-2 text-center font-bold"
                            value={s.score}
                            onChange={e => handleScoreChange(s.student_id, e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          {s.score !== '' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseFloat(s.score) >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {parseFloat(s.score) >= 10 ? 'Aprovado' : 'Reprovado'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">Nenhum aluno encontrado nesta turma.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {students.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn-primary px-10 flex items-center gap-2"
                  >
                    {saving ? 'Salvando...' : <><CheckCircle2 size={20} /> Salvar Notas</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p>Selecione uma turma e uma disciplina para lançar as notas.</p>
        </div>
      )}
    </div>
  );
};

const StudentProfile = ({ token, studentId, onBack }: { token: string, studentId: number, onBack: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${studentId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
  }, [studentId, token]);

  if (loading) return <div className="p-20 text-center">Carregando perfil do aluno...</div>;
  if (!data || !data.student) return <div className="p-20 text-center text-red-500">Erro ao carregar perfil do aluno.</div>;

  const { student, class: classInfo, payments, grades } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h2 className="text-2xl font-bold">Perfil do Aluno</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div className="card text-center py-8">
            <div className="w-32 h-40 bg-gray-100 rounded-xl mx-auto mb-4 overflow-hidden border-2 border-gray-100">
              {student?.photo ? (
                <img src={student.photo} alt={student?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <User size={64} />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{student?.name}</h3>
            <p className="text-impagme-red font-mono font-bold text-sm mt-1">{student?.registration_no}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              {student?.status}
            </div>
          </div>

          <div className="card">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Informações de Contacto</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">BI / ID</p>
                <p className="font-medium">{student.bi}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Data de Nascimento</p>
                <p className="font-medium">{new Date(student.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Contacto</p>
                <p className="font-medium">{student.contact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Encarregado de Educação</p>
                <p className="font-medium">{student.guardian}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Endereço</p>
                <p className="font-medium text-sm">{student.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic & Financial */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Info */}
          <div className="card bg-impagme-dark text-white">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Turma Atual</h4>
              <BookOpen className="text-gray-600" size={20} />
            </div>
            {classInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Nome da Turma</p>
                  <p className="text-lg font-bold">{classInfo?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ano Letivo</p>
                  <p className="text-lg font-bold">{classInfo.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Período</p>
                  <p className="text-lg font-bold">{classInfo.shift}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sala</p>
                  <p className="text-lg font-bold text-impagme-red">{classInfo.room_number || '---'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Nenhuma turma vinculada.</p>
            )}
          </div>

          {/* Grades */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Notas e Aproveitamento</h4>
              <GraduationCap className="text-gray-300" size={20} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Disciplina</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Período</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Nota</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {grades.length > 0 ? grades.map((g: any) => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-medium">{g.subject_name}</td>
                      <td className="px-4 py-3 text-sm">{g.period}</td>
                      <td className="px-4 py-3 font-bold">{g.score.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${g.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {g.score >= 10 ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Nenhuma nota lançada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Histórico Financeiro</h4>
              <Wallet className="text-gray-300" size={20} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Recibo</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Mês</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Valor</th>
                    <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.length > 0 ? payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-mono text-xs">{p.receipt_no}</td>
                      <td className="px-4 py-3 text-sm">{p.month}</td>
                      <td className="px-4 py-3 font-bold">{p.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Nenhum pagamento registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceManagement = ({ token, cycle }: { token: string, cycle: string }) => {
  const today = new Date().toISOString().split('T')[0];
  const nowDate = new Date();

  const [view, setView] = useState<'register' | 'summary'>('register');
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const classes = allClasses.filter((c: any) => (c.cycle || '2º Ciclo') === cycle);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summaryMonth, setSummaryMonth] = useState(nowDate.getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(nowDate.getFullYear());
  const [summary, setSummary] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(data => setAllClasses(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    setStudents([]);
    setAttendance({});
    setSaved(false);
    Promise.all([
      fetch(`/api/classes/${selectedClass.id}/students`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/attendance?class_id=${selectedClass.id}&date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([studs, recs]) => {
      setStudents(Array.isArray(studs) ? studs : []);
      const map: Record<number, string> = {};
      (Array.isArray(studs) ? studs : []).forEach((s: any) => { map[s.id] = 'Presente'; });
      (Array.isArray(recs) ? recs : []).forEach((r: any) => { map[r.student_id] = r.status; });
      setAttendance(map);
      setLoading(false);
    });
  }, [selectedClass, selectedDate]);

  const loadSummary = () => {
    if (!selectedClass) return;
    setSummaryLoading(true);
    fetch(`/api/attendance/summary?class_id=${selectedClass.id}&month=${summaryMonth}&year=${summaryYear}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => { setSummary(Array.isArray(data) ? data : []); setSummaryLoading(false); });
  };

  useEffect(() => {
    if (view === 'summary' && selectedClass) loadSummary();
  }, [view, selectedClass, summaryMonth, summaryYear]);

  const setStatus = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status: string) => {
    const next: Record<number, string> = {};
    students.forEach(s => { next[s.id] = status; });
    setAttendance(next);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedClass || students.length === 0) return;
    setSaving(true);
    const records = students.map(s => ({
      student_id: s.id,
      class_id: selectedClass.id,
      date: selectedDate,
      status: attendance[s.id] || 'Presente',
    }));
    const res = await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ records }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  };

  const presentes = students.filter(s => attendance[s.id] === 'Presente').length;
  const faltas = students.filter(s => attendance[s.id] === 'Falta').length;
  const justificadas = students.filter(s => attendance[s.id] === 'Justificada').length;

  const statusConfig: Record<string, { label: string; color: string; bg: string; ring: string }> = {
    'Presente':    { label: 'Presente',    color: 'text-green-700',  bg: 'bg-green-100',  ring: 'ring-green-400' },
    'Falta':       { label: 'Falta',       color: 'text-red-700',    bg: 'bg-red-100',    ring: 'ring-red-400' },
    'Justificada': { label: 'Justificada', color: 'text-amber-700',  bg: 'bg-amber-100',  ring: 'ring-amber-400' },
  };

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ClipboardCheck className="text-impagme-red" size={26} /> Presenças
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Registo e acompanhamento de presenças</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button onClick={() => setView('register')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'register' ? 'bg-impagme-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <CalendarDays size={16} /> Registar
          </button>
          <button onClick={() => setView('summary')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${view === 'summary' ? 'bg-impagme-red text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <BarChart2 size={16} /> Resumo Mensal
          </button>
        </div>
      </div>

      {/* Class + Date selector */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Turma</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
              value={selectedClass?.id || ''}
              onChange={e => {
                const cls = classes.find(c => c.id === Number(e.target.value));
                setSelectedClass(cls || null);
              }}
            >
              <option value="">— Selecionar turma —</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.level && `(${c.level})`}</option>
              ))}
            </select>
          </div>
          {view === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
                value={selectedDate}
                max={today}
                onChange={e => { setSelectedDate(e.target.value); setSaved(false); }}
              />
            </div>
          )}
          {view === 'summary' && (
            <div className="flex gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mês</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
                  value={summaryMonth}
                  onChange={e => setSummaryMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ano</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-impagme-red/20 focus:border-impagme-red"
                  value={summaryYear}
                  onChange={e => setSummaryYear(Number(e.target.value))}
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REGISTER VIEW */}
      {view === 'register' && (
        <>
          {!selectedClass ? (
            <div className="card py-20 text-center">
              <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">Selecione uma turma para registar as presenças</p>
            </div>
          ) : loading ? (
            <div className="card py-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-impagme-red border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400 text-sm">A carregar alunos…</p>
            </div>
          ) : students.length === 0 ? (
            <div className="card py-20 text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">Esta turma não tem alunos inscritos</p>
              <p className="text-sm text-gray-300 mt-1">Adicione alunos em Turmas e Grade</p>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{presentes}</p>
                    <p className="text-xs text-gray-500">Presentes</p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <X size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-700">{faltas}</p>
                    <p className="text-xs text-gray-500">Faltas</p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{justificadas}</p>
                    <p className="text-xs text-gray-500">Justificadas</p>
                  </div>
                </div>
              </div>

              {/* Quick actions + Save */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500 self-center mr-1">Marcar todos:</span>
                  {['Presente', 'Falta', 'Justificada'].map(s => (
                    <button key={s} onClick={() => markAll(s)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${statusConfig[s].bg} ${statusConfig[s].color} hover:opacity-80 transition-opacity`}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <CheckCircle2 size={16} /> Guardado com sucesso
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
                    {saving ? 'A guardar…' : 'Guardar Presenças'}
                  </button>
                </div>
              </div>

              {/* Student list */}
              <div className="card overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">{students.length} alunos — {selectedClass.name} — {selectedDate}</span>
                  <span className="text-xs text-gray-400">{Math.round((presentes / students.length) * 100)}% de presença</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {students.map((student, idx) => {
                    const status = attendance[student.id] || 'Presente';
                    const cfg = statusConfig[status];
                    return (
                      <li key={student.id} className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors">
                        <span className="w-8 text-xs text-gray-400 font-mono">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{student.registration_no}</p>
                        </div>
                        <div className="flex gap-2">
                          {['Presente', 'Falta', 'Justificada'].map(s => (
                            <button
                              key={s}
                              onClick={() => setStatus(student.id, s)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                status === s
                                  ? `${statusConfig[s].bg} ${statusConfig[s].color} ring-2 ${statusConfig[s].ring}`
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </>
      )}

      {/* SUMMARY VIEW */}
      {view === 'summary' && (
        <>
          {!selectedClass ? (
            <div className="card py-20 text-center">
              <BarChart2 size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">Selecione uma turma para ver o resumo</p>
            </div>
          ) : summaryLoading ? (
            <div className="card py-16 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-impagme-red border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-400 text-sm">A carregar resumo…</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{selectedClass.name} — {monthNames[summaryMonth - 1]} {summaryYear}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{summary.length} alunos inscritos</p>
              </div>
              {summary.length === 0 ? (
                <div className="py-16 text-center">
                  <CalendarDays size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400">Nenhum registo de presença neste mês</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                        <th className="px-6 py-3 text-xs font-semibold text-green-600 uppercase tracking-wider text-center">Presentes</th>
                        <th className="px-6 py-3 text-xs font-semibold text-red-600 uppercase tracking-wider text-center">Faltas</th>
                        <th className="px-6 py-3 text-xs font-semibold text-amber-600 uppercase tracking-wider text-center">Justif.</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total Dias</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">% Presença</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summary.map(row => {
                        const pct = row.total_dias > 0 ? Math.round((row.presencas / row.total_dias) * 100) : 0;
                        return (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3">
                              <p className="font-semibold text-sm text-gray-900">{row.name}</p>
                              <p className="text-xs text-gray-400 font-mono">{row.registration_no}</p>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="inline-block min-w-8 px-2 py-0.5 bg-green-100 text-green-700 font-bold text-sm rounded-lg">{row.presencas}</span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="inline-block min-w-8 px-2 py-0.5 bg-red-100 text-red-700 font-bold text-sm rounded-lg">{row.faltas}</span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className="inline-block min-w-8 px-2 py-0.5 bg-amber-100 text-amber-700 font-bold text-sm rounded-lg">{row.justificadas}</span>
                            </td>
                            <td className="px-6 py-3 text-center text-sm text-gray-600 font-medium">{row.total_dias}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 w-20">
                                  <div
                                    className={`h-2 rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-bold w-8 ${pct >= 75 ? 'text-green-700' : pct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedCycle, setSelectedCycle] = useState<'1º Ciclo' | '2º Ciclo'>('2º Ciclo');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [schoolYear, setSchoolYear] = useState('2026/2027');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ students: any[], teachers: any[], staff: any[] }>({ students: [], teachers: [], staff: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}?token=${token}`;
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'NOTIFICATION') {
          setNotifications(prev => [message.data, ...prev]);
        }
      };

      return () => socket.close();
    }
  }, [token]);

  const markNotificationRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({ students: [], teachers: [], staff: [] });
      setShowSearchResults(false);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleViewStudentProfile = (id: number) => {
    setSelectedStudentId(id);
    setActiveModule('student-profile');
  };

  const handleLogin = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = (expired = false) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (expired) setSessionExpired(true);
  };

  useEffect(() => {
    // Check if stored token is already expired on page load
    const stored = localStorage.getItem('token');
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          handleLogout(true);
          return;
        }
      } catch {}
    }

    // Intercept all fetch calls — auto-logout on 401/403 from authenticated routes
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await origFetch(...args);
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      if (
        (response.status === 401 || response.status === 403) &&
        !url.includes('/api/login') &&
        !url.includes('/api/change-password')
      ) {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
      return response;
    };

    const onExpired = () => handleLogout(true);
    window.addEventListener('session-expired', onExpired);
    return () => {
      window.removeEventListener('session-expired', onExpired);
      window.fetch = origFetch;
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(data => setStats(data));
      fetch('/api/settings/general', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(data => { if (data.school_year) setSchoolYear(data.school_year); });
    }
  }, [token, activeModule]);

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} sessionExpired={sessionExpired} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, roles: ['admin', 'teacher', 'finance'] },
    { id: 'my-portal', label: 'Meu Portal', icon: GraduationCap, roles: ['student'] },
    { id: 'students', label: 'Gestão de Alunos', icon: Users, roles: ['admin', 'teacher', 'finance'] },
    { id: 'teachers', label: 'Professores', icon: UserSquare2, roles: ['admin'] },
    { id: 'staff', label: 'Funcionários', icon: Briefcase, roles: ['admin'] },
    { id: 'classes', label: 'Turmas e Grade', icon: BookOpen, roles: ['admin', 'teacher'] },
    { id: 'attendance', label: 'Presenças', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
    { id: 'financial', label: 'Financeiro', icon: Wallet, roles: ['admin', 'finance'] },
    { id: 'academic', label: 'Acadêmico', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { id: 'reports', label: 'Relatórios', icon: FileText, roles: ['admin', 'finance'] },
    { id: 'users', label: 'Utilizadores', icon: Settings2, roles: ['admin'] },
    { id: 'settings', label: 'Minha Conta', icon: Lock, roles: ['admin', 'teacher', 'student', 'finance'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-impagme-dark text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-40`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-impagme-red rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          {isSidebarOpen && (
            <div>
              <span className="font-bold text-xl tracking-tight leading-none block">IMPAGME</span>
              <span className="text-[10px] text-white/40 font-medium tracking-wide">{schoolYear}</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`sidebar-link w-full ${activeModule === item.id ? 'active' : ''} ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-impagme-red">
              <Menu size={24} />
            </button>

            {user.role !== 'student' && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5 shrink-0">
                {(['1º Ciclo', '2º Ciclo'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCycle(c)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${selectedCycle === c ? 'bg-impagme-red text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar alunos, professores..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm w-80 focus:ring-2 focus:ring-impagme-red/20 outline-none"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
                    >
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resultados da Pesquisa</h4>
                        <button onClick={() => setShowSearchResults(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                      </div>

                      {searchResults.students.length === 0 && searchResults.teachers.length === 0 && searchResults.staff.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Search size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Nenhum resultado encontrado para "{searchQuery}"</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {searchResults.students.length > 0 && (
                            <div className="p-2">
                              <p className="px-3 py-1 text-[10px] font-bold text-blue-600 uppercase">Alunos</p>
                              {searchResults.students.map(s => (
                                <button 
                                  key={s.id} 
                                  onClick={() => { handleViewStudentProfile(s.id); setShowSearchResults(false); setSearchQuery(''); }}
                                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                                >
                                  <div>
                                    <p className="font-medium text-sm group-hover:text-impagme-red transition-colors">{s.name}</p>
                                    <p className="text-xs text-gray-500">Reg: {s.registration_no} | BI: {s.bi}</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-impagme-red transition-colors" />
                                </button>
                              ))}
                            </div>
                          )}

                          {searchResults.teachers.length > 0 && (
                            <div className="p-2">
                              <p className="px-3 py-1 text-[10px] font-bold text-green-600 uppercase">Professores</p>
                              {searchResults.teachers.map(t => (
                                <button 
                                  key={t.id} 
                                  onClick={() => { setActiveModule('teachers'); setShowSearchResults(false); setSearchQuery(''); }}
                                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                                >
                                  <div>
                                    <p className="font-medium text-sm group-hover:text-impagme-red transition-colors">{t.name}</p>
                                    <p className="text-xs text-gray-500">BI: {t.bi}</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-impagme-red transition-colors" />
                                </button>
                              ))}
                            </div>
                          )}

                          {searchResults.staff.length > 0 && (
                            <div className="p-2">
                              <p className="px-3 py-1 text-[10px] font-bold text-purple-600 uppercase">Funcionários</p>
                              {searchResults.staff.map(s => (
                                <button 
                                  key={s.id} 
                                  onClick={() => { setActiveModule('staff'); setShowSearchResults(false); setSearchQuery(''); }}
                                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                                >
                                  <div>
                                    <p className="font-medium text-sm group-hover:text-impagme-red transition-colors">{s.name}</p>
                                    <p className="text-xs text-gray-500">{s.role} | BI: {s.bi}</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-impagme-red transition-colors" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative text-gray-500 hover:text-impagme-red transition-colors ${showNotifications ? 'text-impagme-red' : ''}`}
              >
                <Bell size={22} />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-impagme-red text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <NotificationDropdown 
                      notifications={notifications}
                      onMarkRead={markNotificationRead}
                      onMarkAllRead={markAllNotificationsRead}
                      onClose={() => setShowNotifications(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user.username}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {user.role === 'admin' ? 'Administrador' :
                   user.role === 'finance' ? 'Secretário(a)' :
                   user.role === 'teacher' ? 'Professor(a)' :
                   user.role === 'student' ? 'Aluno(a)' : user.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
                {user.username[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeModule === 'dashboard' && user && <Dashboard stats={stats} onNavigate={setActiveModule} role={user.role} token={token} selectedCycle={selectedCycle} />}
              {activeModule === 'my-portal' && <StudentDashboard token={token} />}
              {activeModule === 'students' && <StudentManagement token={token} onViewProfile={handleViewStudentProfile} cycle={selectedCycle} />}
              {activeModule === 'student-profile' && selectedStudentId && (
                <StudentProfile 
                  token={token} 
                  studentId={selectedStudentId} 
                  onBack={() => setActiveModule('students')} 
                />
              )}
              {activeModule === 'teachers' && <TeacherManagement token={token} cycle={selectedCycle} />}
              {activeModule === 'staff' && <StaffManagement token={token} />}
              {activeModule === 'classes' && <ClassManagement token={token} onViewProfile={handleViewStudentProfile} cycle={selectedCycle} schoolYear={schoolYear} />}
              {activeModule === 'attendance' && <AttendanceManagement token={token} cycle={selectedCycle} />}
              {activeModule === 'academic' && <GradeManagement token={token} cycle={selectedCycle} />}
              {activeModule === 'financial' && <FinancialManagement token={token} cycle={selectedCycle} schoolYear={schoolYear} />}
              {activeModule === 'reports' && <Reports token={token} cycle={selectedCycle} schoolYear={schoolYear} />}
              {activeModule === 'users' && <UserManagement token={token} />}
              {activeModule === 'settings' && <Settings token={token} user={user} schoolYear={schoolYear} onSchoolYearChange={setSchoolYear} />}
              {/* Other modules would be implemented similarly */}
              {!['dashboard', 'students', 'student-profile', 'teachers', 'staff', 'classes', 'attendance', 'financial', 'users', 'settings', 'reports', 'my-portal', 'academic'].includes(activeModule) && (
                <div className="card text-center py-20">
                  <div className="flex justify-center mb-4 text-gray-300">
                    <AlertCircle size={64} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400">Módulo em Desenvolvimento</h3>
                  <p className="text-gray-500 mt-2">Esta funcionalidade estará disponível na próxima atualização do sistema.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-gray-100 mt-12 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-impagme-red rounded flex items-center justify-center text-white font-bold">I</div>
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} icescript. Todos os direitos reservados.</p>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="mailto:icescript88@gmail.com" className="hover:text-impagme-red transition-colors">icescript88@gmail.com</a>
              <a href="https://wa.me/244935935960" className="hover:text-impagme-red transition-colors">WhatsApp: 935 935 960</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
