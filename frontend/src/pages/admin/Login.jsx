import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import logo from '../../assets/Logo.png'
import Input from '../../components/ui/Input';

const AdminLogin = () => {
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
      } else {
        setError('Akses ditolak. Anda bukan Administrator.');
      }
    } catch (err) {
      console.error(err);
      setError('Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Container matching user login page style */}
      <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden border border-slate-100 p-8 flex flex-col justify-between shadow-sm relative">

        <div>
          {/* Brand Header */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
              Masuk Administrator
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Silakan masukkan kredensial administratif Anda
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3.5 rounded-xl border border-rose-100">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="admin@kerjain.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="admin-email"
              required
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="admin-password"
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#00897b] hover:bg-[#00786d] text-white py-3.5 px-4 rounded-full text-sm font-extrabold shadow-lg shadow-teal-700/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
            >
              <span>{loading ? 'Masuk...' : 'Masuk Dashboard'}</span>
              <ArrowRight size={16} className="stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Footer info text */}
        <div className="mt-8 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
            <ShieldCheck size={12} className="text-slate-400" />
            <span>Keamanan Terenkripsi</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
