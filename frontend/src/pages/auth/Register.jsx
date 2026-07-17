import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, Lock, User, UserPlus, Shield, UserRound } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // default client
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Semua input wajib diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      if (role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError('Registrasi gagal. Email mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 flex flex-col justify-between min-h-[600px]">
        <div>
          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
              Buat Akun Baru
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1">
              Mulai hubungkan kebutuhan hyperlocal Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-50 text-accent-600 text-xs font-semibold p-3 rounded-xl border border-accent-100">
                {error}
              </div>
            )}
            
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Budi Santoso"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="register-name"
            />

            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="register-email"
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="register-password"
            />

            {/* Role Selection Tabs */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 font-heading">
                Daftar Sebagai
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all
                    ${role === 'client' 
                      ? 'border-primary-600 bg-primary-50 text-primary-600' 
                      : 'border-slate-200 text-slate-500 bg-slate-50'}`}
                >
                  <UserRound size={16} />
                  Klien (Pemberi Kerja)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all
                    ${role === 'worker' 
                      ? 'border-primary-600 bg-primary-50 text-primary-600' 
                      : 'border-slate-200 text-slate-500 bg-slate-50'}`}
                >
                  <Shield size={16} />
                  Pekerja (Worker)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading}
            >
              <UserPlus size={16} className="mr-2" />
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs font-medium text-slate-500">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="text-primary-600 font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
