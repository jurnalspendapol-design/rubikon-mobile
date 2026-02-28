import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  MessageCircle, 
  AlertCircle, 
  BookOpen, 
  School, 
  Brain, 
  MessageSquare, 
  Heart, 
  RefreshCw, 
  Info,
  ChevronLeft,
  Send,
  History,
  User,
  LayoutDashboard,
  Search,
  Plus,
  Edit2,
  Trash2,
  Upload,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

// --- Types ---
interface User {
  id: number;
  name: string;
  role: 'student' | 'counselor';
  email: string;
  class?: string;
  avatar_url?: string;
}

interface Module {
  id: number;
  title: string;
  content: string;
  category: string;
}

// --- Components ---

const AppLogo = ({ className, fallbackIcon: FallbackIcon }: { className?: string, fallbackIcon: any }) => {
  const [imgError, setImgError] = useState(false);
  
  if (imgError) {
    return <FallbackIcon className={className} />;
  }
  
  return (
    <img 
      src="/logo.png" 
      alt="Logo" 
      className={cn("object-contain", className)} 
      onError={() => setImgError(true)} 
    />
  );
};

const Header = ({ title, showBack = true, user, onProfileClick }: { title: string, showBack?: boolean, user?: User, onProfileClick?: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        </div>
        <div className="ml-auto">
          {user && onProfileClick && (
            <button 
              onClick={onProfileClick}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform active:scale-90 overflow-hidden"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileModal = ({ user, isOpen, onClose, onLogout, onUpdateUser }: { user: User, isOpen: boolean, onClose: () => void, onLogout: () => void, onUpdateUser?: (user: User) => void }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const { error } = await supabase.from('users').update({ avatar_url: base64String }).eq('id', user.id);
        
        if (error) throw error;
        
        if (onUpdateUser) {
          onUpdateUser({ ...user, avatar_url: base64String });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Gagal mengunggah foto profil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Password tidak cocok' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password minimal 6 karakter' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
      if (error) throw error;
      
      setPasswordStatus({ type: 'success', message: 'Password berhasil diubah' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err) {
      setPasswordStatus({ type: 'error', message: 'Gagal mengubah password' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={() => {
            setIsChangingPassword(false);
            setPasswordStatus(null);
            onClose();
          }}
          className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-200 overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="text-display text-2xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="mt-2 inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {user.role === 'counselor' ? 'Guru BK / Konselor' : 'Siswa'}
          </div>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Ganti Password</h3>
            <div>
              <input 
                type="password" 
                placeholder="Password Baru"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            {passwordStatus && (
              <p className={`text-xs font-bold p-2 rounded-lg ${passwordStatus.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {passwordStatus.message}
              </p>
            )}

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={toggleFullscreen}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              Mode Fullscreen
            </button>

            <button 
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-center gap-3 bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
              Ganti Password
            </button>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Informasi Akun</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">ID Pengguna</span>
                  <span className="text-sm text-slate-800 font-bold">#{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Status Akun</span>
                  <span className="text-sm text-emerald-500 font-bold">Aktif</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-3 bg-rose-50 text-rose-600 py-5 rounded-2xl font-bold text-display transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              Keluar dari Aplikasi
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ChatModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  const counselors = [
    { name: 'Bu Ayu', phone: '6282231357654' },
    { name: 'Bu Jihada', phone: '6285785676799' },
    { name: 'Bu Rina', phone: '628813315840' },
    { name: 'Bu Retno', phone: '6281357831809' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-display text-2xl font-bold text-slate-800">Chat Guru BK</h2>
          <p className="text-slate-500 text-sm mt-1">Pilih guru BK yang ingin kamu hubungi via WhatsApp.</p>
        </div>

        <div className="space-y-3">
          {counselors.map(c => (
            <button
              key={c.name}
              onClick={() => {
                window.open(`https://wa.me/${c.phone}`, '_blank');
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{c.name}</h4>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ServiceCard = ({ 
  icon: Icon, 
  label, 
  subtitle,
  onClick,
  className,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600"
}: { 
  icon: any, 
  label: string, 
  subtitle: string,
  onClick: () => void,
  className?: string,
  iconBg?: string,
  iconColor?: string
}) => (
  <motion.button 
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "card-neo flex flex-col items-start p-5 text-left h-full group",
      className
    )}
  >
    <div className={cn("p-3 rounded-2xl mb-4 transition-transform group-hover:scale-110", iconBg)}>
      <Icon className={cn("w-6 h-6", iconColor)} />
    </div>
    <h3 className="text-display font-bold text-[16px] text-slate-800 leading-tight mb-1.5">{label}</h3>
    <p className="text-[12px] text-slate-500 leading-snug font-medium">{subtitle}</p>
    <div className="mt-auto pt-4 flex items-center text-slate-300 group-hover:text-blue-500 transition-colors">
       <ChevronLeft className="w-4 h-4 rotate-180" />
    </div>
  </motion.button>
);

const Banner = ({ image, title, category, onClick }: { image: string, title: string, category: string, onClick?: () => void, key?: number | string }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="min-w-[300px] h-44 rounded-[2.5rem] overflow-hidden relative mr-5 shadow-lg group cursor-pointer"
  >
    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">{category}</span>
      <p className="text-white font-bold text-lg leading-tight text-display">{title}</p>
    </div>
  </motion.div>
);

// --- Pages ---

const Home = ({ user, onLogout, onProfileClick }: { user: User, onLogout: () => void, onProfileClick: () => void }) => {
  const navigate = useNavigate();
  const [selectedBanner, setSelectedBanner] = useState<{title: string, category: string, content: string, image: string} | null>(null);

  const banners = [
    {
      image: "https://picsum.photos/seed/mental/800/600",
      category: "Tips",
      title: "Cara Meningkatkan Konsentrasi Belajar",
      content: "1. Cari tempat yang tenang dan bebas gangguan.\n2. Gunakan teknik Pomodoro (25 menit belajar, 5 menit istirahat).\n3. Jauhkan handphone saat sedang fokus.\n4. Minum air putih yang cukup agar otak tetap segar.\n5. Buat target belajar yang jelas setiap harinya."
    },
    {
      image: "https://picsum.photos/seed/study/800/600",
      category: "Motivasi",
      title: "Mengatasi Rasa Malas",
      content: "1. Ingat kembali tujuan awalmu bersekolah.\n2. Pecah tugas besar menjadi bagian-bagian kecil yang mudah dikerjakan.\n3. Beri dirimu hadiah kecil (reward) setelah menyelesaikan tugas.\n4. Cari teman belajar yang bisa saling memotivasi.\n5. Jangan terlalu keras pada dirimu sendiri, istirahatlah jika lelah."
    },
    {
      image: "https://picsum.photos/seed/career/800/600",
      category: "Sosial",
      title: "Tips Berteman di Lingkungan Baru",
      content: "1. Jadilah pendengar yang baik.\n2. Jangan ragu untuk menyapa lebih dulu.\n3. Ikuti kegiatan ekstrakurikuler yang kamu minati.\n4. Tetap menjadi dirimu sendiri (be authentic).\n5. Hargai perbedaan pendapat dan latar belakang."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 pb-32 w-full">
      {/* Banner Detail Modal */}
      <AnimatePresence>
        {selectedBanner && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <div className="h-48 relative shrink-0">
                <img src={selectedBanner.image} alt={selectedBanner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <button 
                  onClick={() => setSelectedBanner(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1 block">{selectedBanner.category}</span>
                  <h2 className="text-white font-bold text-xl leading-tight text-display">{selectedBanner.title}</h2>
                </div>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="prose prose-sm text-slate-600 whitespace-pre-line">
                  {selectedBanner.content}
                </div>
                <button 
                  onClick={() => setSelectedBanner(null)}
                  className="w-full mt-8 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="px-8 pt-10 pb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onProfileClick}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 transition-transform active:scale-90 overflow-hidden"
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </button>
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Good Morning,</p>
            <h2 className="text-display text-xl font-bold text-slate-800">{user.name} 👋</h2>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-600">
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Section - Bento Style */}
      <div className="px-8 py-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-[3rem] overflow-hidden bg-slate-900 p-8 flex flex-col justify-center shadow-2xl shadow-slate-200"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
          
          <div className="relative z-10">
            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">RUBIKON MOBILE</span>
            <h1 className="text-display text-3xl font-bold text-white leading-[1.1]">
              Kami disini<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">untuk kamu!</span>
            </h1>
          </div>
          
          <div className="absolute right-6 bottom-6 animate-float opacity-40">
            <AppLogo className="w-20 h-20 text-white" fallbackIcon={School} />
          </div>
        </motion.div>
      </div>

      {/* Service Grid - Bento Style */}
      <div className="px-8 py-6 grid grid-cols-2 gap-5">
        <ServiceCard 
          icon={MessageCircle} 
          label="Konseling" 
          subtitle="Bimbingan pribadi & kelompok"
          onClick={() => navigate('/counseling')}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          className="col-span-1"
        />
        <ServiceCard 
          icon={AlertCircle} 
          label="Pengaduan" 
          subtitle="Lapor masalah secara aman"
          onClick={() => navigate('/report')}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          className="col-span-1"
        />
        <ServiceCard 
          icon={BookOpen} 
          label="Modul BK" 
          subtitle="Edukasi kesehatan mental"
          onClick={() => navigate('/modules')}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
          className="col-span-1"
        />
        <ServiceCard 
          icon={School} 
          label="Info Sekolah" 
          subtitle="Informasi sekolah lanjutan"
          onClick={() => navigate('/info')}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          className="col-span-1"
        />
        <ServiceCard 
          icon={Brain} 
          label="Tes Gaya Belajar" 
          subtitle="Kenali cara belajarmu yang unik"
          onClick={() => navigate('/test')}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          className="col-span-1"
        />
        <ServiceCard 
          icon={Heart} 
          label="Self Healing" 
          subtitle="Relaksasi & ketenangan"
          onClick={() => navigate('/healing')}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
          className="col-span-1"
        />
      </div>

      {/* Banners Section */}
      <div className="py-8">
        <div className="px-8 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-display text-2xl font-bold text-slate-800">Explore</h2>
            <p className="text-xs text-slate-400 font-medium">Temukan hal baru hari ini</p>
          </div>
          <button className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">Lihat semua</button>
        </div>
        <div className="flex overflow-x-auto px-8 no-scrollbar">
          {banners.map((banner, idx) => (
            <Banner 
              key={idx}
              image={banner.image} 
              category={banner.category}
              title={banner.title} 
              onClick={() => setSelectedBanner(banner)}
            />
          ))}
        </div>
      </div>

      {user.role === 'counselor' && (
        <div className="px-8 pb-12 max-w-md mx-auto">
          <Link to="/admin" className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-xl shadow-slate-200 transition-transform active:scale-95">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="text-display">Dashboard Konselor</span>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
};

const CounselingForm = ({ user }: { user: User }) => {
  const [type, setType] = useState<'pribadi' | 'kelompok'>('pribadi');
  const [submitted, setSubmitted] = useState(false);
  
  // Form States
  const [pribadiData, setPribadiData] = useState({
    nama: user.name,
    kelas: '7',
    kontak: '',
    hobi: '',
    mood: '😐',
    reasons: [] as string[],
    reasonLainnya: '',
    story: '',
    method: 'Ngobrol langsung di Ruang BK',
    time: 'Jam Istirahat',
    companion: 'Sendiri saja',
    expectation: 'Dapat solusi/saran',
    privacyAgreed: false
  });

  const [kelompokData, setKelompokData] = useState({
    nama: user.name,
    kelas: '7',
    namaKelompok: '',
    topics: [] as string[],
    whyInterested: '',
    memberPref: 'Bebas (boleh campur dengan kelas lain)',
    participantType: 'Tergantung mood',
    expectations: [] as string[],
    expectationLainnya: '',
    secrecyPromise: 'Ya, Saya Berjanji Menjaganya'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = type === 'pribadi' ? pribadiData : kelompokData;
    
    // Basic validation for privacy/secrecy
    if (type === 'pribadi' && !pribadiData.privacyAgreed) {
      alert("Silakan setujui Janji Kerahasiaan terlebih dahulu.");
      return;
    }

    const { error } = await supabase.from('counseling_requests').insert({
      student_id: user.id,
      type,
      problem_type: type === 'pribadi' ? pribadiData.reasons.join(', ') : kelompokData.topics.join(', '),
      preferred_time: type === 'pribadi' ? pribadiData.time : 'Sesuai Jadwal Kelompok',
      notes: type === 'pribadi' ? pribadiData.story : kelompokData.whyInterested,
      form_data: JSON.stringify(data)
    });

    if (!error) {
      setSubmitted(true);
    } else {
      alert('Terjadi kesalahan saat mengirim permohonan.');
    }
  };

  const toggleReason = (reason: string) => {
    setPribadiData(prev => ({
      ...prev,
      reasons: prev.reasons.includes(reason) 
        ? prev.reasons.filter(r => r !== reason)
        : [...prev.reasons, reason]
    }));
  };

  const toggleTopic = (topic: string) => {
    setKelompokData(prev => {
      if (prev.topics.includes(topic)) {
        return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      }
      if (prev.topics.length >= 2) return prev;
      return { ...prev, topics: [...prev.topics, topic] };
    });
  };

  const toggleGroupExpectation = (exp: string) => {
    setKelompokData(prev => ({
      ...prev,
      expectations: prev.expectations.includes(exp)
        ? prev.expectations.filter(e => e !== exp)
        : [...prev.expectations, exp]
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <Send className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Permohonan Terkirim!</h2>
        <p className="text-slate-600 mb-6">Guru BK akan segera meninjau permohonanmu. Cek riwayat secara berkala.</p>
        <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Kembali ke Menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 pb-20 w-full">
      <Header title="Layanan Konseling" />
      
      {/* Type Selector */}
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex mb-8">
          <button 
            onClick={() => setType('pribadi')}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold transition-all",
              type === 'pribadi' ? "bg-blue-600 text-white shadow-md" : "text-slate-500"
            )}
          >
            Pribadi
          </button>
          <button 
            onClick={() => setType('kelompok')}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold transition-all",
              type === 'kelompok' ? "bg-blue-600 text-white shadow-md" : "text-slate-500"
            )}
          >
            Kelompok
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {type === 'pribadi' ? (
            <>
              {/* Bagian 1: Identitas */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Kenalan Yuk!
                </h3>
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                      value={pribadiData.nama}
                      onChange={e => setPribadiData({...pribadiData, nama: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                    <div className="flex gap-2">
                      {['7', '8', '9'].map(k => (
                        <button 
                          key={k}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, kelas: k})}
                          className={cn(
                            "flex-1 py-2 rounded-lg border font-bold text-sm",
                            pribadiData.kelas === k ? "bg-blue-50 border-blue-600 text-blue-600" : "border-slate-200 text-slate-500"
                          )}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp / Instagram (Opsional)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                      placeholder="@username atau 0812..."
                      value={pribadiData.kontak}
                      onChange={e => setPribadiData({...pribadiData, kontak: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hobi atau Hal yang Kamu Sukai</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                      placeholder="Main game, baca buku, dll..."
                      value={pribadiData.hobi}
                      onChange={e => setPribadiData({...pribadiData, hobi: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Bagian 2: Kondisi Saat Ini */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Apa yang Lagi Kamu Rasakan?
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Gimana perasaanmu hari ini?</label>
                    <div className="flex justify-between gap-1">
                      {[
                        { e: '😊', l: 'Senang' },
                        { e: '😐', l: 'Biasa' },
                        { e: '☹️', l: 'Sedih' },
                        { e: '😡', l: 'Kesal' },
                        { e: '😰', l: 'Cemas' }
                      ].map(m => (
                        <button 
                          key={m.e}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, mood: m.e})}
                          className={cn(
                            "flex flex-col items-center p-2 rounded-xl border-2 transition-all",
                            pribadiData.mood === m.e ? "bg-blue-50 border-blue-600" : "border-transparent"
                          )}
                        >
                          <span className="text-2xl">{m.e}</span>
                          <span className="text-[10px] mt-1 font-medium">{m.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Alasan utama ingin ngobrol?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        "Masalah Belajar (Males belajar, nilai turun)",
                        "Masalah Teman (Dibully, berantem, merasa gak punya teman)",
                        "Masalah di Rumah (Berantem sama ortu/saudara)",
                        "Masalah Masa Depan (Bingung mau masuk SMA/SMK mana)",
                        "Masalah Pribadi (Lagi sedih tapi gak tahu kenapa)"
                      ].map(r => (
                        <button 
                          key={r}
                          type="button"
                          onClick={() => toggleReason(r)}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-3",
                            pribadiData.reasons.includes(r) ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center", pribadiData.reasons.includes(r) ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                            {pribadiData.reasons.includes(r) && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          {r}
                        </button>
                      ))}
                      <div className="mt-2">
                        <input 
                          type="text" 
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                          placeholder="Lainnya: ______"
                          value={pribadiData.reasonLainnya}
                          onChange={e => setPribadiData({...pribadiData, reasonLainnya: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apa yang lagi mengganjal? (Opsional)</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm min-h-[100px]"
                      placeholder="Ceritakan sedikit dong..."
                      value={pribadiData.story}
                      onChange={e => setPribadiData({...pribadiData, story: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Bagian 3: Preferensi Sesi */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Biar Makin Nyaman
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Lebih suka ngobrol lewat apa?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Ngobrol langsung di Ruang BK', 'Chat WhatsApp dulu', 'Video Call'].map(m => (
                        <button 
                          key={m}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, method: m})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            pribadiData.method === m ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Waktu yang paling pas?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Jam Istirahat', 'Setelah Pulang Sekolah', 'Saat Jam Kosong'].map(t => (
                        <button 
                          key={t}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, time: t})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            pribadiData.time === t ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Didampingi teman?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Sendiri saja', 'Boleh bawa satu teman akrab'].map(c => (
                        <button 
                          key={c}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, companion: c})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            pribadiData.companion === c ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Bagian 4: Harapan & Privasi */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Harapan & Privasi
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Apa yang kamu harapkan?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Dapat solusi/saran', 'Cuma pengen didengerin aja (curhat)', 'Pengen dibantu bicara ke orang tua/guru lain'].map(e => (
                        <button 
                          key={e}
                          type="button"
                          onClick={() => setPribadiData({...pribadiData, expectation: e})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            pribadiData.expectation === e ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 text-sm mb-1">Janji Kerahasiaan</h4>
                    <p className="text-xs text-blue-700 mb-3">"Tenang, semua cerita kamu aman di sini dan tidak akan disebarkan ke teman-teman lain."</p>
                    <button 
                      type="button"
                      onClick={() => setPribadiData({...pribadiData, privacyAgreed: !pribadiData.privacyAgreed})}
                      className={cn(
                        "w-full p-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm transition-all",
                        pribadiData.privacyAgreed ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-600"
                      )}
                    >
                      {pribadiData.privacyAgreed && <div className="w-2 h-2 bg-white rounded-full" />}
                      Oke, Aku Mengerti
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Bagian 1: Identitas Kelompok */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Identitas Kelompok
                </h3>
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                      value={kelompokData.nama}
                      onChange={e => setKelompokData({...kelompokData, nama: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                    <div className="flex gap-2">
                      {['7', '8', '9'].map(k => (
                        <button 
                          key={k}
                          type="button"
                          onClick={() => setKelompokData({...kelompokData, kelas: k})}
                          className={cn(
                            "flex-1 py-2 rounded-lg border font-bold text-sm",
                            kelompokData.kelas === k ? "bg-blue-50 border-blue-600 text-blue-600" : "border-slate-200 text-slate-500"
                          )}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kelompok (Opsional)</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                      placeholder="Jika mendaftar bareng teman..."
                      value={kelompokData.namaKelompok}
                      onChange={e => setKelompokData({...kelompokData, namaKelompok: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Bagian 2: Topik Seru */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Topik Seru yang Ingin Dibahas
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Pilih maksimal 2 topik</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { t: "Anti-Galau", d: "Cara mengelola emosi dan rasa sedih." },
                        { t: "Bestie Goals", d: "Cara menjalin pertemanan yang sehat dan seru." },
                        { t: "Bye-Bye Malas", d: "Tips kompak biar semangat belajar bareng." },
                        { t: "Pejuang Masa Depan", d: "Diskusi bareng tentang mau masuk SMA/SMK mana." },
                        { t: "Stop Bullying", d: "Gimana cara saling jaga dan menghargai di sekolah." },
                        { t: "Self-Love", d: "Belajar cara lebih percaya diri bareng-bareing." }
                      ].map(item => (
                        <button 
                          key={item.t}
                          type="button"
                          onClick={() => toggleTopic(item.t)}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-3",
                            kelompokData.topics.includes(item.t) ? "bg-blue-50 border-blue-600 text-blue-700" : "border-slate-100 text-slate-600"
                          )}
                        >
                          <div className={cn("mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0", kelompokData.topics.includes(item.t) ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                            {kelompokData.topics.includes(item.t) && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div>
                            <p className="font-bold">{item.t}</p>
                            <p className="text-[11px] opacity-70">{item.d}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kenapa kamu tertarik? (Paragraf Singkat)</label>
                    <textarea 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm min-h-[80px]"
                      placeholder="Ceritakan alasanmu..."
                      value={kelompokData.whyInterested}
                      onChange={e => setKelompokData({...kelompokData, whyInterested: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Bagian 3: Kenyamanan dalam Kelompok */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Kenyamanan dalam Kelompok
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Kamu lebih nyaman jika anggotanya...</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Teman sekelas saja',
                        'Bebas (boleh campur dengan kelas lain)',
                        'Hanya laki-laki saja / Perempuan saja',
                        'Tidak masalah siapa saja'
                      ].map(p => (
                        <button 
                          key={p}
                          type="button"
                          onClick={() => setKelompokData({...kelompokData, memberPref: p})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            kelompokData.memberPref === p ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Tipe diskusi seperti apa?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Senang berbagi cerita (aktif bicara)',
                        'Lebih suka mendengarkan dulu',
                        'Tergantung mood'
                      ].map(t => (
                        <button 
                          key={t}
                          type="button"
                          onClick={() => setKelompokData({...kelompokData, participantType: t})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all",
                            kelompokData.participantType === t ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Apa yang kamu harapkan?</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Dapat teman baru',
                        'Merasa tidak sendirian menghadapi masalah',
                        'Belajar cara berkomunikasi yang baik'
                      ].map(e => (
                        <button 
                          key={e}
                          type="button"
                          onClick={() => toggleGroupExpectation(e)}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all flex items-center gap-3",
                            kelompokData.expectations.includes(e) ? "bg-blue-50 border-blue-600 text-blue-700 font-medium" : "border-slate-100 text-slate-600"
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center", kelompokData.expectations.includes(e) ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                            {kelompokData.expectations.includes(e) && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          {e}
                        </button>
                      ))}
                      <div className="mt-2">
                        <input 
                          type="text" 
                          className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                          placeholder="Lainnya: ______"
                          value={kelompokData.expectationLainnya}
                          onChange={e => setKelompokData({...kelompokData, expectationLainnya: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bagian 4: Kesepakatan Bersama */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Kesepakatan Bersama
                </h3>
                <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 text-sm mb-1">Janji Menjaga Rahasia Teman</h4>
                    <p className="text-xs text-blue-700 mb-4">“Dalam konseling kelompok, kita akan saling bercerita. Apakah kamu setuju untuk tidak menceritakan rahasia atau masalah temanmu kepada orang lain di luar kelompok nanti?”</p>
                    <div className="grid grid-cols-1 gap-2">
                      {['Ya, Saya Berjanji Menjaganya', 'Saya Akan Berusaha'].map(p => (
                        <button 
                          key={p}
                          type="button"
                          onClick={() => setKelompokData({...kelompokData, secrecyPromise: p})}
                          className={cn(
                            "text-left p-3 rounded-xl border text-sm transition-all font-bold",
                            kelompokData.secrecyPromise === p ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-blue-200 text-blue-600"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors">
            Kirim Permohonan
          </button>
        </form>
      </div>
    </div>
  );
};

const ReportingForm = ({ user }: { user: User }) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Bagian 1
    namaPelapor: user.name,
    kelas: user.class || '',
    isAnonymous: false,
    
    // Bagian 2
    jenisPengaduan: [] as string[],
    jenisPengaduanLainnya: '',
    pihakTerlibat: '',
    waktuTempat: '',
    kronologi: '',
    saksi: '',
    
    // Bagian 3 (Khusus Kelompok)
    namaKelompok: '',
    penyebab: '',
    lamaMasalah: '',
    upayaDamai: '',
    
    // Bagian 4
    harapan: [] as string[],
    kontak: ''
  });

  const isKelompok = formData.jenisPengaduan.includes('Masalah Kelompok: Konflik antar geng atau perpecahan di kelas.');

  const handleNext = () => {
    if (step === 2 && !isKelompok) {
      setStep(4); // Skip section 3 if not group issue
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step === 4 && !isKelompok) {
      setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  const toggleArrayItem = (field: 'jenisPengaduan' | 'harapan', value: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format content for database
    let content = `*LAPORAN PENGADUAN*\n\n`;
    content += `*BAGIAN 1: IDENTITAS*\n`;
    content += `Nama: ${formData.isAnonymous ? 'Anonim' : formData.namaPelapor}\n`;
    content += `Kelas: ${formData.kelas}\n\n`;
    
    content += `*BAGIAN 2: DETAIL KEJADIAN*\n`;
    content += `Jenis Pengaduan: ${formData.jenisPengaduan.join(', ')}${formData.jenisPengaduan.includes('Lainnya') ? ` (${formData.jenisPengaduanLainnya})` : ''}\n`;
    content += `Pihak Terlibat: ${formData.pihakTerlibat}\n`;
    content += `Waktu & Tempat: ${formData.waktuTempat}\n`;
    content += `Kronologi:\n${formData.kronologi}\n`;
    content += `Saksi: ${formData.saksi}\n\n`;

    if (isKelompok) {
      content += `*BAGIAN 3: MASALAH KELOMPOK*\n`;
      content += `Kelompok Berkonflik: ${formData.namaKelompok}\n`;
      content += `Penyebab: ${formData.penyebab}\n`;
      content += `Lama Berlangsung: ${formData.lamaMasalah}\n`;
      content += `Upaya Damai: ${formData.upayaDamai}\n\n`;
    }

    content += `*BAGIAN 4: HARAPAN & TINDAK LANJUT*\n`;
    content += `Harapan: ${formData.harapan.join(', ')}\n`;
    content += `Kontak: ${formData.kontak}\n`;

    const { error } = await supabase.from('reports').insert({
      student_id: user.id,
      content,
      is_anonymous: formData.isAnonymous ? 1 : 0
    });
    
    setIsSubmitting(false);
    if (!error) {
      setSubmitted(true);
    } else {
      alert('Terjadi kesalahan saat mengirim laporan.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-purple-100 p-6 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-purple-600" />
        </div>
        <h2 className="text-display text-2xl font-bold text-slate-800 mb-4">Laporan Diterima</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-md">
          <p className="text-slate-600 font-medium leading-relaxed">
            "Terima kasih sudah berani melapor. Kamu tidak sendirian. Laporanmu akan segera kami pelajari. Tetap tenang dan jika kamu merasa dalam bahaya mendesak, segera temui Guru BK secara langsung."
          </p>
        </div>
        <Link to="/" className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-fuchsia-50 to-pink-50 w-full pb-32">
      <Header title="Layanan Pengaduan" />
      
      <div className="p-6 max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                step === i ? "bg-purple-600 text-white" : 
                step > i ? "bg-purple-200 text-purple-700" : "bg-slate-200 text-slate-400",
                (!isKelompok && i === 3) && "opacity-30"
              )}>
                {i}
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
          
          {/* STEP 1: Identitas */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Bagian 1: Identitas & Keamanan</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pelapor</label>
                  <p className="text-xs text-slate-500 mb-2">Boleh dikosongkan jika ingin anonim</p>
                  <input 
                    type="text" 
                    value={formData.namaPelapor}
                    onChange={e => setFormData({...formData, namaPelapor: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    placeholder="Nama kamu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kelas</label>
                  <input 
                    type="text" 
                    value={formData.kelas}
                    onChange={e => setFormData({...formData, kelas: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    placeholder="Contoh: 7A, 8B"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Apakah kamu ingin identitasmu dirahasiakan?</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="anonim" 
                        checked={formData.isAnonymous === true}
                        onChange={() => setFormData({...formData, isAnonymous: true})}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <span className="font-medium text-slate-700">Ya, mohon rahasiakan identitas saya.</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        name="anonim" 
                        checked={formData.isAnonymous === false}
                        onChange={() => setFormData({...formData, isAnonymous: false})}
                        className="w-5 h-5 accent-purple-600"
                      />
                      <span className="font-medium text-slate-700">Tidak apa-apa jika guru tahu siapa saya.</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Detail Pengaduan */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Bagian 2: Detail Pengaduan</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Jenis Pengaduan (Bisa pilih lebih dari satu)</label>
                  <div className="space-y-2">
                    {[
                      'Perundungan (Bullying): Fisik, kata-kata kasar, atau di media sosial.',
                      'Fasilitas Sekolah: Kamar mandi rusak, kelas tidak nyaman, dll.',
                      'Keamanan: Kehilangan barang, ancaman dari orang lain.',
                      'Masalah Kelompok: Konflik antar geng atau perpecahan di kelas.',
                      'Lainnya'
                    ].map(jenis => (
                      <label key={jenis} className="flex items-start gap-3 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.jenisPengaduan.includes(jenis)}
                          onChange={() => toggleArrayItem('jenisPengaduan', jenis)}
                          className="w-5 h-5 mt-0.5 accent-purple-600 shrink-0"
                        />
                        <span className="text-sm font-medium text-slate-700">{jenis}</span>
                      </label>
                    ))}
                    {formData.jenisPengaduan.includes('Lainnya') && (
                      <input 
                        type="text" 
                        value={formData.jenisPengaduanLainnya}
                        onChange={e => setFormData({...formData, jenisPengaduanLainnya: e.target.value})}
                        className="w-full p-3 mt-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none text-sm"
                        placeholder="Sebutkan jenis pengaduan lainnya..."
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Siapa saja yang terlibat?</label>
                  <p className="text-xs text-slate-500 mb-2">Sebutkan nama atau inisial jika tahu</p>
                  <input 
                    type="text" 
                    value={formData.pihakTerlibat}
                    onChange={e => setFormData({...formData, pihakTerlibat: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kapan dan di mana kejadiannya?</label>
                  <input 
                    type="text" 
                    value={formData.waktuTempat}
                    onChange={e => setFormData({...formData, waktuTempat: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kronologi Kejadian</label>
                  <p className="text-xs text-slate-500 mb-2">Ceritakan secara singkat apa yang terjadi</p>
                  <textarea 
                    value={formData.kronologi}
                    onChange={e => setFormData({...formData, kronologi: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Apakah ada saksi mata?</label>
                  <p className="text-xs text-slate-500 mb-2">Siswa lain atau guru yang melihat</p>
                  <input 
                    type="text" 
                    value={formData.saksi}
                    onChange={e => setFormData({...formData, saksi: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Pendukung (Jika ada)</label>
                  <p className="text-xs text-slate-500 mb-2">Foto luka, tangkapan layar chat, dll.</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Upload file bukti</p>
                    <input type="file" className="mt-4 text-xs text-slate-500 w-full" accept="image/*" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Khusus Kelompok */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Bagian 3: Khusus Pengaduan Kelompok</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama kelompok atau kelas yang berkonflik</label>
                  <input 
                    type="text" 
                    value={formData.namaKelompok}
                    onChange={e => setFormData({...formData, namaKelompok: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Apa penyebab utama perselisihan ini?</label>
                  <textarea 
                    value={formData.penyebab}
                    onChange={e => setFormData({...formData, penyebab: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Sudah berapa lama masalah ini berlangsung?</label>
                  <div className="space-y-2">
                    {['Baru hari ini', 'Seminggu terakhir', 'Sudah sangat lama (berbulan-bulan)'].map(lama => (
                      <label key={lama} className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="radio" 
                          name="lamaMasalah" 
                          checked={formData.lamaMasalah === lama}
                          onChange={() => setFormData({...formData, lamaMasalah: lama})}
                          className="w-5 h-5 accent-purple-600"
                          required
                        />
                        <span className="font-medium text-slate-700">{lama}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Apakah sudah pernah ada upaya damai sebelumnya?</label>
                  <div className="flex gap-4">
                    {['Ya', 'Tidak'].map(upaya => (
                      <label key={upaya} className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="radio" 
                          name="upayaDamai" 
                          checked={formData.upayaDamai === upaya}
                          onChange={() => setFormData({...formData, upayaDamai: upaya})}
                          className="w-5 h-5 accent-purple-600"
                          required
                        />
                        <span className="font-medium text-slate-700">{upaya}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Harapan */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Bagian 4: Harapan & Tindak Lanjut</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Apa yang kamu inginkan dari pihak sekolah setelah laporan ini?</label>
                  <div className="space-y-2">
                    {[
                      'Mediasi (dipertemukan untuk damai).',
                      'Pemberian sanksi tegas kepada pelaku.',
                      'Perlindungan tambahan agar saya merasa aman.',
                      'Cukup dicatat sebagai laporan saja dulu.'
                    ].map(harap => (
                      <label key={harap} className="flex items-start gap-3 p-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.harapan.includes(harap)}
                          onChange={() => toggleArrayItem('harapan', harap)}
                          className="w-5 h-5 mt-0.5 accent-purple-600 shrink-0"
                        />
                        <span className="text-sm font-medium text-slate-700">{harap}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bagaimana kami bisa menghubungimu untuk kabar selanjutnya?</label>
                  <p className="text-xs text-slate-500 mb-2">Nomor WA/DM Instagram - Ingatkan bahwa ini hanya akan diakses oleh Guru BK yang bertugas</p>
                  <input 
                    type="text" 
                    value={formData.kontak}
                    onChange={e => setFormData({...formData, kontak: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-purple-500 outline-none transition-all"
                    placeholder="Contoh: WA 08123456789"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button 
                type="button" 
                onClick={handlePrev}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors"
              >
                Kembali
              </button>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting || (step === 2 && formData.jenisPengaduan.length === 0) || (step === 4 && formData.harapan.length === 0)}
              className="flex-[2] bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : (step === 4 ? 'Kirim Laporan' : 'Selanjutnya')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModuleList = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const defaultModules: Module[] = [
    {
      id: 1,
      title: "Mengatasi Kecemasan Menghadapi Ujian",
      content: "Kecemasan saat ujian adalah hal yang wajar. Beberapa cara untuk mengatasinya antara lain:\n\n1. Persiapan yang matang: Belajarlah jauh-jauh hari, jangan SKS (Sistem Ngebut Semalam).\n2. Mengatur pola tidur: Pastikan kamu tidur cukup (7-8 jam) sebelum hari ujian.\n3. Melakukan relaksasi pernapasan: Tarik napas dalam-dalam selama 4 detik, tahan 4 detik, lalu hembuskan perlahan selama 6 detik. Ulangi beberapa kali sebelum ujian dimulai.\n4. Berpikir positif: Yakinkan dirimu bahwa kamu sudah berusaha maksimal.\n5. Jangan lupa untuk selalu berdoa dan meminta restu orang tua.",
      category: "Akademik"
    },
    {
      id: 2,
      title: "Membangun Kepercayaan Diri",
      content: "Kepercayaan diri bukan bawaan lahir, melainkan keterampilan yang bisa dilatih. Mulailah dengan:\n\n1. Mengenali kelebihanmu: Catat hal-hal positif tentang dirimu.\n2. Berhenti membandingkan diri dengan orang lain: Setiap orang punya jalan dan waktunya masing-masing.\n3. Berani mencoba hal baru: Keluar dari zona nyaman akan memperluas wawasanmu.\n4. Selalu bersyukur: Fokus pada apa yang kamu miliki, bukan apa yang tidak kamu miliki.\n5. Menerima kegagalan: Jadikan kegagalan sebagai pelajaran, bukan akhir dari segalanya.",
      category: "Pribadi"
    },
    {
      id: 3,
      title: "Cara Menghadapi Bullying",
      content: "Jika kamu mengalami bullying, jangan diam saja. Berikut langkah yang bisa kamu ambil:\n\n1. Ceritakan kepada orang dewasa yang kamu percayai: Orang tua, wali kelas, atau guru BK.\n2. Jangan membalas dengan kekerasan: Membalas dendam hanya akan memperburuk situasi.\n3. Tetap tenang dan abaikan: Terkadang pelaku bullying hanya mencari reaksi darimu.\n4. Hindari situasi yang berpotensi membahayakan dirimu: Jangan berjalan sendirian di tempat sepi.\n5. Simpan bukti: Jika bullying terjadi secara online (cyberbullying), screenshot buktinya.\n\nIngat, kamu tidak sendirian dan kamu berhak merasa aman.",
      category: "Sosial"
    },
    {
      id: 4,
      title: "Manajemen Waktu Belajar",
      content: "Banyak siswa kesulitan membagi waktu antara belajar, bermain, dan istirahat. Cobalah tips berikut:\n\n1. Membuat jadwal harian: Tuliskan apa saja yang harus kamu kerjakan hari ini.\n2. Gunakan teknik Pomodoro: Belajar fokus selama 25 menit, lalu istirahat 5 menit. Setelah 4 sesi, istirahat lebih lama (15-30 menit).\n3. Hindari menunda-nunda pekerjaan: Kerjakan tugas sesegera mungkin.\n4. Kurangi gangguan: Matikan notifikasi HP atau letakkan HP di ruangan lain saat belajar.\n5. Tentukan prioritas: Kerjakan tugas yang paling penting atau paling sulit terlebih dahulu.",
      category: "Akademik"
    }
  ];

  useEffect(() => {
    supabase.from('modules').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setModules(data);
        } else {
          setModules(defaultModules);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-purple-50 w-full pb-32">
      <Header title="Modul BK" />
      
      {/* Module Detail Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-rose-100 p-6 pb-8 relative shrink-0">
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-full text-rose-600 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-block px-3 py-1 bg-rose-200 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  {selectedModule.category.replace('_', ' ')}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">{selectedModule.title}</h2>
              </div>
              
              <div className="p-6 overflow-y-auto bg-white -mt-4 rounded-t-3xl relative z-10">
                <div className="prose prose-sm text-slate-600 whitespace-pre-line leading-relaxed">
                  {selectedModule.content}
                </div>
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="w-full mt-8 bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold hover:bg-rose-100 transition-colors"
                >
                  Tutup Modul
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm shadow-rose-100/50 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-600 px-3 py-1 rounded-full">
                {m.category.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3 leading-tight">{m.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">{m.content}</p>
            <button 
              onClick={() => setSelectedModule(m)}
              className="mt-6 text-rose-600 font-bold flex items-center gap-1 text-sm hover:text-rose-700 transition-colors"
            >
              Baca Selengkapnya <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CounselorDashboard = ({ user, onLogout, onProfileClick }: { user: User, onLogout: () => void, onProfileClick: () => void }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingHistory, setViewingHistory] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);

  const updateRequestStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('counseling_requests').update({ status }).eq('id', id);
    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } else {
      alert('Gagal memperbarui status');
    }
  };

  const updateReportStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (!error) {
      setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    } else {
      alert('Gagal memperbarui status');
    }
  };

  const fetchUsers = async () => {
    let query = supabase.from('users').select('*').order('name', { ascending: true });
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }
    const { data } = await query;
    if (data) setUsers(data);
  };

  useEffect(() => {
    supabase.from('counseling_requests').select('*, users!inner(name)').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRequests(data.map((d: any) => ({ ...d, student_name: d.users.name })));
      });
    supabase.from('reports').select('*, users(name)').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReports(data.map((d: any) => ({ ...d, student_name: d.users?.name })));
      });
    fetchUsers();
  }, [searchQuery]);

  const handleSaveUser = async (userData: any) => {
    try {
      let error;
      if (editingUser) {
        const res = await supabase.from('users').update(userData).eq('id', editingUser.id);
        error = res.error;
      } else {
        const res = await supabase.from('users').insert(userData);
        error = res.error;
      }

      if (!error) {
        setIsUserModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(`Gagal menyimpan: ${error.message || 'Terjadi kesalahan sistem'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Hapus pengguna ini?')) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  const fetchUserHistory = async (user: any) => {
    const { data } = await supabase.from('counseling_requests').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
    if (data) setUserHistory(data);
    setViewingHistory(user);
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const usersToImport = [];

      // Skip header: nama, email, kelas, password
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, email, userClass, password] = line.split(',').map(s => s.trim());
        if (name && email) {
          usersToImport.push({ name, email, class: userClass, password: password || '123456' });
        }
      }

      if (usersToImport.length > 0) {
        const { error } = await supabase.from('users').upsert(
          usersToImport.map(u => ({ ...u, role: 'student' })),
          { onConflict: 'email' }
        );
        
        if (!error) {
          alert(`Berhasil mengimpor ${usersToImport.length} siswa!`);
          fetchUsers();
        } else {
          alert('Gagal mengimpor data. Pastikan format CSV benar.');
        }
      }
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const csvContent = "nama,email,kelas,password\nBudi Santoso,budi@siswa.com,X-A,123456\nSiti Aminah,siti@siswa.com,X-B,123456";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_siswa.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 w-full">
      <Header title="Dashboard Konselor" user={user} onProfileClick={onProfileClick} />
      <div className="max-w-7xl mx-auto">
        <div className="p-6 flex gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setTab('requests')}
          className={cn(
            "flex-1 min-w-[120px] py-4 rounded-2xl font-bold text-display transition-all",
            tab === 'requests' ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400"
          )}
        >
          Permohonan ({requests.length})
        </button>
        <button 
          onClick={() => setTab('reports')}
          className={cn(
            "flex-1 min-w-[120px] py-4 rounded-2xl font-bold text-display transition-all",
            tab === 'reports' ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400"
          )}
        >
          Laporan ({reports.length})
        </button>
        <button 
          onClick={() => setTab('users')}
          className={cn(
            "flex-1 min-w-[120px] py-4 rounded-2xl font-bold text-display transition-all",
            tab === 'users' ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400"
          )}
        >
          Pengguna
        </button>
      </div>

      <div className="px-6 space-y-5">
        {tab === 'requests' && (
          requests.map(r => (
            <div key={r.id} className="card-neo p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-display font-bold text-slate-800 text-lg">{r.student_name}</h4>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {r.status === 'accepted' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : r.status === 'confirmed' ? 'Dikonfirmasi' : r.status}
                </span>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-500 font-medium"><strong>Masalah:</strong> {r.problem_type}</p>
                <p className="text-sm text-slate-500 font-medium"><strong>Waktu:</strong> {new Date(r.preferred_time).toLocaleString()}</p>
                <div className="bg-slate-50 p-4 rounded-2xl mt-4">
                  <p className="text-sm text-slate-500 italic">"{r.notes}"</p>
                </div>
              </div>
              <div className="flex gap-3">
                {r.status === 'pending' ? (
                  <>
                    <button onClick={() => updateRequestStatus(r.id, 'accepted')} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-sm font-bold text-display shadow-lg shadow-emerald-100">Terima</button>
                    <button onClick={() => updateRequestStatus(r.id, 'rejected')} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl text-sm font-bold text-display">Tolak</button>
                  </>
                ) : (
                  <div className="flex-1 text-center py-4 rounded-2xl text-sm font-bold text-slate-500 bg-slate-50">
                    Status: {r.status === 'accepted' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : r.status === 'confirmed' ? 'Dikonfirmasi' : r.status}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {tab === 'reports' && (
          reports.map(r => (
            <div key={r.id} className="card-neo p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-display font-bold text-slate-800 text-lg">{r.is_anonymous ? 'Anonim' : r.student_name}</h4>
                <span className="text-[10px] bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {r.status === 'read' ? 'Sudah Dibaca' : r.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{r.content}</p>
              <div className="mt-6">
                {r.status === 'pending' ? (
                  <button onClick={() => updateReportStatus(r.id, 'read')} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold text-display">Tandai Sudah Dibaca</button>
                ) : (
                  <div className="w-full text-center py-4 rounded-2xl text-sm font-bold text-slate-500 bg-slate-50">
                    Status: {r.status === 'read' ? 'Sudah Dibaca' : r.status}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={downloadCsvTemplate}
                className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100"
                title="Download Template CSV"
              >
                <BookOpen className="w-6 h-6" />
              </button>
              <input 
                type="file" 
                id="csv-upload" 
                accept=".csv" 
                className="hidden" 
                onChange={handleCsvImport}
              />
              <label 
                htmlFor="csv-upload"
                className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-100 cursor-pointer"
                title="Upload CSV"
              >
                <Upload className="w-6 h-6" />
              </label>
              <button 
                onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100"
                title="Tambah Pengguna"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="card-neo p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-display font-bold text-slate-800 text-lg">{u.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider",
                      u.role === 'counselor' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {u.role}
                    </span>
                  </div>
                  
                  {u.role === 'student' && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500 font-medium"><strong>Kelas:</strong> {u.class || '-'}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => fetchUserHistory(u)}
                      className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-xs font-bold text-display"
                    >
                      Riwayat
                    </button>
                    <button 
                      onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-3 bg-rose-50 text-rose-600 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
          >
            <h3 className="text-display text-2xl font-bold text-slate-800 mb-6">
              {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveUser(Object.fromEntries(formData));
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Nama Lengkap</label>
                <input name="name" defaultValue={editingUser?.name} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Email</label>
                <input name="email" type="email" defaultValue={editingUser?.email} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Role</label>
                <select name="role" defaultValue={editingUser?.role || 'student'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500">
                  <option value="student">Siswa</option>
                  <option value="counselor">Konselor</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Kelas (Khusus Siswa)</label>
                <input name="class" defaultValue={editingUser?.class} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500" placeholder="Contoh: 7A, 8B, 9C" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400">Batal</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-display shadow-lg">Simpan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto rounded-[2.5rem] p-8 shadow-2xl no-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-display text-2xl font-bold text-slate-800">Riwayat {viewingHistory.name}</h3>
              <button onClick={() => setViewingHistory(null)} className="p-2 bg-slate-50 rounded-full text-slate-400"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            
            <div className="space-y-4">
              {userHistory.length === 0 ? (
                <p className="text-center py-8 text-slate-400 font-medium">Belum ada riwayat konseling.</p>
              ) : (
                userHistory.map(h => (
                  <div key={h.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{h.type}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{h.problem_type}</h4>
                    <p className="text-xs text-slate-500 italic">"{h.notes}"</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

const HistoryView = ({ user }: { user: User }) => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = () => {
    supabase.from('counseling_requests').select('*').eq('student_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRequests(data);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, [user.id]);

  const handleConfirm = async (id: number) => {
    const { error } = await supabase.from('counseling_requests').update({ status: 'confirmed' }).eq('id', id);
    if (!error) {
      alert('Terima kasih telah mengkonfirmasi jadwal konseling.');
      fetchRequests();
    } else {
      alert('Gagal mengkonfirmasi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-zinc-50 pb-32 w-full">
      <Header title="Riwayat Konseling" />
      <div className="p-8 space-y-5 max-w-2xl mx-auto">
        {requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <History className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-display font-bold text-slate-400">Belum ada riwayat.</p>
          </div>
        ) : (
          requests.map(r => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={r.id} 
              className="card-neo p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{r.type}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider",
                  r.status === 'completed' || r.status === 'confirmed' ? "bg-emerald-100 text-emerald-600" : 
                  r.status === 'accepted' ? "bg-blue-100 text-blue-600" :
                  r.status === 'rejected' ? "bg-rose-100 text-rose-600" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {r.status === 'accepted' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : r.status === 'confirmed' ? 'Dikonfirmasi' : r.status}
                </span>
              </div>
              <h4 className="text-display font-bold text-slate-800 text-lg">{r.problem_type}</h4>
              <p className="text-sm text-slate-400 font-medium mt-2">{new Date(r.preferred_time).toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
              
              {r.status === 'accepted' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-blue-800 font-medium">Konselor telah menyetujui jadwal konseling Anda. Silakan konfirmasi kehadiran Anda.</p>
                  </div>
                  <button 
                    onClick={() => handleConfirm(r.id)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                  >
                    Konfirmasi Kehadiran
                  </button>
                </div>
              )}
              {r.status === 'rejected' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-rose-50 p-4 rounded-xl">
                    <p className="text-sm text-rose-800 font-medium">Mohon maaf, jadwal konseling belum bisa disetujui saat ini. Silakan ajukan jadwal lain atau hubungi konselor secara langsung.</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const SelfHealing = () => {
  const [journalEntry, setJournalEntry] = useState('');
  const [savedJournal, setSavedJournal] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('rubikon_journal');
    if (saved) setSavedJournal(saved);
  }, []);

  const saveJournal = () => {
    if (journalEntry.trim()) {
      localStorage.setItem('rubikon_journal', journalEntry);
      setSavedJournal(journalEntry);
      setJournalEntry('');
      alert('Jurnal syukur berhasil disimpan!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 pb-32 w-full">
      <Header title="Self Healing" />
      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
          <h3 className="text-display text-2xl font-bold mb-3">Tarik Napas...</h3>
          <p className="text-sm opacity-80 font-medium">Luangkan waktu sejenak untuk menenangkan jiwamu.</p>
          
          <div className="mt-12 flex justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-40 h-40 bg-white/10 rounded-[3rem] flex items-center justify-center border border-white/20 backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.5)]" />
            </motion.div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Breathe In • Breathe Out</p>
          </div>
        </motion.div>
        
        <div className="space-y-6">
          {/* Musik Relaksasi */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl"><Heart className="text-blue-600 w-6 h-6" /></div>
              <div>
                <h4 className="text-display font-bold text-slate-800 text-lg">Musik Relaksasi</h4>
                <p className="text-xs text-slate-500 font-medium">Dengarkan musik untuk menenangkan pikiran</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video relative">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/lFcSrYw-ARY?si=Y0mK-yH9i9t9d45x" 
                title="Relaxation Music" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          {/* Jurnal Syukur */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl"><BookOpen className="text-emerald-600 w-6 h-6" /></div>
              <div>
                <h4 className="text-display font-bold text-slate-800 text-lg">Jurnal Syukur</h4>
                <p className="text-xs text-slate-500 font-medium">Tuliskan 3 hal baik hari ini</p>
              </div>
            </div>
            
            <textarea 
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Hari ini saya bersyukur karena..."
              className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none min-h-[120px] mb-4 text-sm"
            />
            <button 
              onClick={saveJournal}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
            >
              Simpan Jurnal
            </button>

            {savedJournal && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Jurnal Terakhirmu:</p>
                <p className="text-sm text-slate-700 italic">"{savedJournal}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LearningStyleTest = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ visual: 0, auditori: 0, kinestetik: 0 });
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    {
      q: "Saat belajar hal baru, saya lebih suka...",
      options: [
        { text: "Melihat gambar, diagram, atau membaca buku.", type: "visual" },
        { text: "Mendengarkan penjelasan guru atau rekaman.", type: "auditori" },
        { text: "Langsung praktik atau mencoba sendiri.", type: "kinestetik" }
      ]
    },
    {
      q: "Saat mengingat sesuatu, saya biasanya...",
      options: [
        { text: "Mengingat wajah atau bentuknya.", type: "visual" },
        { text: "Mengingat suara atau apa yang dikatakan.", type: "auditori" },
        { text: "Mengingat apa yang saya lakukan saat itu.", type: "kinestetik" }
      ]
    },
    {
      q: "Saat waktu luang, saya lebih suka...",
      options: [
        { text: "Membaca buku atau menonton film.", type: "visual" },
        { text: "Mendengarkan musik atau podcast.", type: "auditori" },
        { text: "Berolahraga atau membuat sesuatu.", type: "kinestetik" }
      ]
    },
    {
      q: "Saat marah atau emosi, saya biasanya...",
      options: [
        { text: "Diam dan membayangkan sesuatu.", type: "visual" },
        { text: "Mengomel atau berbicara dengan nada tinggi.", type: "auditori" },
        { text: "Membanting pintu atau berjalan mondar-mandir.", type: "kinestetik" }
      ]
    },
    {
      q: "Saat mengeja kata yang sulit, saya akan...",
      options: [
        { text: "Membayangkan kata itu di pikiran saya.", type: "visual" },
        { text: "Mengejanya dengan suara keras.", type: "auditori" },
        { text: "Menulisnya di udara atau di kertas.", type: "kinestetik" }
      ]
    }
  ];

  const handleAnswer = (type: string) => {
    setScores(prev => ({ ...prev, [type]: prev[type as keyof typeof prev] + 1 }));
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate result
      const newScores = { ...scores, [type]: scores[type as keyof typeof scores] + 1 };
      let maxScore = 0;
      let maxType = '';
      
      Object.entries(newScores).forEach(([k, v]) => {
        const val = Number(v);
        if (val > maxScore) {
          maxScore = val;
          maxType = k;
        }
      });
      
      setResult(maxType);
    }
  };

  const getResultDetails = () => {
    switch(result) {
      case 'visual':
        return {
          title: "Visual (Melihat)",
          desc: "Kamu belajar paling baik dengan melihat. Gambar, diagram, warna, dan catatan yang rapi sangat membantumu memahami informasi.",
          tips: ["Gunakan stabilo berwarna", "Buat mind map", "Tonton video pembelajaran", "Duduk di barisan depan"]
        };
      case 'auditori':
        return {
          title: "Auditori (Mendengar)",
          desc: "Kamu belajar paling baik dengan mendengarkan. Penjelasan lisan, diskusi, dan mendengarkan ulang rekaman sangat efektif untukmu.",
          tips: ["Rekam penjelasan guru", "Belajar sambil berdiskusi", "Baca catatan dengan suara keras", "Gunakan jembatan keledai (lagu/nada)"]
        };
      case 'kinestetik':
        return {
          title: "Kinestetik (Melakukan)",
          desc: "Kamu belajar paling baik dengan bergerak dan menyentuh. Praktik langsung dan aktivitas fisik membantumu mengingat lebih baik.",
          tips: ["Belajar sambil berjalan-jalan kecil", "Gunakan alat peraga", "Sering istirahat sejenak saat belajar", "Lakukan eksperimen langsung"]
        };
      default:
        return { title: "", desc: "", tips: [] };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 w-full pb-32">
      <Header title="Tes Gaya Belajar" />
      <div className="p-6 max-w-2xl mx-auto">
        {!result ? (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                <span>Pertanyaan {step + 1}</span>
                <span>Dari {questions.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${((step) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
              {questions[step].q}
            </h3>
            
            <div className="space-y-3">
              {questions[step].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.type)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-colors font-medium text-slate-700"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Gaya Belajarmu Adalah</h2>
            <h3 className="text-3xl font-bold text-emerald-600 mb-4">{getResultDetails().title}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{getResultDetails().desc}</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs">💡</span>
                Tips Belajar Untukmu:
              </h4>
              <ul className="space-y-3">
                {getResultDetails().tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => {
                setStep(0);
                setScores({ visual: 0, auditori: 0, kinestetik: 0 });
                setResult(null);
              }}
              className="mt-8 w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Ulangi Tes
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ExternalFrame = ({ url, title }: { url: string, title: string }) => (
  <div className="flex flex-col h-[calc(100vh-64px)]">
    <Header title={title} />
    <div className="flex-1 pb-16">
      <iframe 
        src={url} 
        className="w-full h-full border-none" 
        title={title}
      />
    </div>
  </div>
);

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      
      if (data) {
        if (data.password) {
          if (data.password !== password) {
            setError('Password salah');
            setLoading(false);
            return;
          }
        } else {
          if (password !== '123456') {
            setError('Password salah (Gunakan 123456 untuk akun lama)');
            setLoading(false);
            return;
          }
        }
        onLogin(data as User);
      } else {
        setError('Email tidak terdaftar');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 animate-float overflow-hidden">
            <AppLogo className="w-12 h-12 text-white" fallbackIcon={School} />
          </div>
          <h1 className="text-display text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">RUBIKON</h1>
          <p className="text-slate-500 font-medium text-sm">Ruang Bimbingan Konseling Mobile</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <h2 className="text-display text-2xl font-bold text-slate-800 mb-6">Masuk</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.id"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 font-medium focus:border-blue-500 focus:outline-none transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-5 rounded-2xl font-bold text-display shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Rubikon Mobile By: Wahyu Sulaiman dan Tim BK SMPN 2 Gempol
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

const MobileWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex justify-center w-full font-sans">
    <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-x-hidden sm:border-x border-slate-200">
      {children}
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('rubikon_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rubikon_user', JSON.stringify(userData));
    
    // Attempt to go fullscreen for immersive mobile experience
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // Ignore errors if fullscreen is blocked by browser
        });
      }
    } catch (e) {
      console.log('Fullscreen request failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rubikon_user');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display font-bold text-slate-400">Loading...</div>;

  if (!user) return (
    <MobileWrapper>
      <LoginPage onLogin={handleLogin} />
    </MobileWrapper>
  );

  return (
    <MobileWrapper>
      <Router>
        <div className="w-full bg-slate-50 min-h-screen relative overflow-x-hidden pb-24">
          <ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
          <ProfileModal 
            user={user} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            onLogout={handleLogout}
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('rubikon_user', JSON.stringify(updatedUser));
            }}
          />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home user={user} onLogout={handleLogout} onProfileClick={() => setIsProfileOpen(true)} />} />
              <Route path="/counseling" element={<CounselingForm user={user} />} />
              <Route path="/report" element={<ReportingForm user={user} />} />
              <Route path="/modules" element={<ModuleList />} />
              <Route path="/history" element={<HistoryView user={user} />} />
              <Route path="/admin" element={<CounselorDashboard user={user} onLogout={handleLogout} onProfileClick={() => setIsProfileOpen(true)} />} />
              <Route path="/healing" element={<SelfHealing />} />
              <Route path="/info" element={<ExternalFrame title="Info Sekolah Lanjutan" url="https://sekolah.data.kemendikdasmen.go.id/" />} />
              <Route path="/test" element={<LearningStyleTest />} />
            </Routes>
          </AnimatePresence>
          
          {/* Navigation Bar for Student */}
          {user.role === 'student' && (
            <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <Link to="/" className="flex flex-col items-center gap-1 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Beranda</span>
              </Link>
              
              <Link to="/history" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                <History className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Riwayat</span>
              </Link>
              
              {/* Center Action Button */}
              <div className="relative -top-8">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsChatModalOpen(true)}
                  className="bg-gradient-to-tr from-blue-600 to-teal-400 p-5 rounded-[1.5rem] shadow-2xl shadow-blue-200 text-white border-4 border-white"
                >
                  <MessageSquare className="w-6 h-6" />
                </motion.button>
              </div>

              <Link to="/modules" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Belajar</span>
              </Link>
              
              <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Profil</span>
              </button>
            </div>
          )}
        </div>
      </Router>
    </MobileWrapper>
  );
}
