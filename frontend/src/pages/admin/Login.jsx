import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import logo from '../../assets/Logo.png';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@kerjain.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);
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
            const res = await authApi.login(email, password);
            if (res.role === 'admin') {
                localStorage.setItem('ki_admin_token', res.token);
                localStorage.setItem('ki_admin_user', JSON.stringify(res.user));
                navigate('/admin/dashboard');
            } else {
                setError('Akses Ditolak: Akun Anda bukan administrator.');
            }
        } catch {
            setError('Login gagal. Periksa kembali kredensial admin Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            {/* Minimalist Phone/Form Container matching client login layout */}
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between relative shadow-lg shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-200">
                
                <div>
                    {/* Brand Header */}
                    <div className="flex justify-center mb-6">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-24 w-auto object-contain"
                        />
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
                            Masuk Admin Panel
                        </h2>
                        <p className="text-sm font-semibold text-slate-400 mt-1">
                            Otorisasi sistem utama KerjaIn
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-xs font-bold p-4 rounded-xl border border-rose-100/50 flex items-start gap-2.5">
                                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 tracking-wider">
                                Email Administrator
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="admin@kerjain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#046c7a] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 tracking-wider">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-12 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#046c7a] transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#046c7a] hover:bg-[#035f6b] text-white py-3.5 px-4 rounded-full text-xs font-extrabold shadow-lg shadow-teal-700/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-4 cursor-pointer"
                        >
                            <span>{loading ? 'Mengautentikasi...' : 'Masuk Ke Panel'}</span>
                            <ArrowRight size={14} className="stroke-[2.5]" />
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center border-t border-slate-150 pt-4">
                    <p className="text-[10px] font-semibold text-slate-400 leading-relaxed max-w-[90%] mx-auto">
                        Otorisasi admin diatur oleh kebijakan audit privasi internal. Seluruh aktivitas log masuk akan direkam otomatis.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;
