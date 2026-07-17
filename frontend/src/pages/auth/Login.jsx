import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError('Login gagal. Periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (type) => {
    if (type === 'client') {
      setEmail('budi.santoso@client.com');
      setPassword('password123');
    } else if (type === 'worker') {
      setEmail('joko.widodo@worker.com');
      setPassword('password123');
    } else if (type === 'admin') {
      setEmail('admin@kerjain.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Phone frame view */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 flex flex-col justify-between min-h-[600px]">
        <div>
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/25 mb-4">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
              KerjaIn
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              Hyperlocal Service Marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-50 text-accent-600 text-xs font-semibold p-3 rounded-xl border border-accent-100">
                {error}
              </div>
            )}
            
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="login-email"
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password"
            />

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              <LogIn size={16} className="mr-2" />
              {loading ? 'Masuk...' : 'Masuk ke Akun'}
            </Button>
          </form>
        </div>

        {/* Demo Roles Access */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-center text-slate-400 uppercase tracking-wider mb-3">
            Akses Cepat Pengujian (Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('client')}
              className="px-2 py-2 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 hover:border-primary-200 rounded-xl text-[10px] font-bold text-slate-600 transition-all"
            >
              Client (Budi)
            </button>
            <button
              onClick={() => quickLogin('worker')}
              className="px-2 py-2 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 hover:border-primary-200 rounded-xl text-[10px] font-bold text-slate-600 transition-all"
            >
              Worker (Joko)
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="px-2 py-2 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 hover:border-primary-200 rounded-xl text-[10px] font-bold text-slate-600 transition-all"
            >
              Admin Portal
            </button>
          </div>
          
          <div className="text-center mt-6 text-xs font-medium text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-600 font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
