import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, MapPin, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/Logo.png'
import Input from "../../components/ui/Input";

const Login = () => {
    const [role, setRole] = useState('client'); // Role switch ('client' | 'worker')
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
            // Navigate depending on the actual role returned by backend
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
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            {/* Phone container style matching mockups */}
            <div className="w-full max-w-md  overflow-hidden border border-slate-100 p-8 flex flex-col justify-between min-h-[700px] relative">
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
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-sm font-semibold text-slate-400 mt-1">
                            Silakan masuk ke akun Anda
                        </p>
                    </div>

                    {/* Role Switcher (Client vs Worker) */}
                    <div className="mb-6 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 tracking-wider">
                            Masuk Sebagai
                        </label>
                        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200/50">
                            <button
                                type="button"
                                onClick={() => setRole('client')}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 ${role === 'client'
                                    ? 'bg-teal-800 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Client
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('worker')}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 ${role === 'worker'
                                    ? 'bg-teal-800 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Worker
                            </button>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-accent-50 text-accent-600 text-xs font-bold p-3.5 rounded-xl border border-accent-100/50">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="nama@email.com"
                            icon={Mail}
                            // value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="login-email"
                            required
                        />

                        <Input
                            label="Kata Sandi"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            // value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="login-password"
                            required
                        />

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700 select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-800 focus:ring-teal-500/20"
                                />
                                <span>Ingat Saya</span>
                            </label>

                            <Link to="/login" className="text-teal-800 font-extrabold hover:underline">
                                Lupa Sandi?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#046c7a] hover:bg-[#035f6b] text-white py-3.5 px-4 rounded-full text-sm font-extrabold shadow-lg shadow-teal-700/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            <span>{loading ? 'Masuk...' : 'Masuk Ke Akun'}</span>
                            <ArrowRight size={16} className="stroke-[2.5]" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow h-px bg-slate-100"></div>
                        <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Atau Lanjutkan Dengan
                        </span>
                        <div className="flex-grow h-px bg-slate-100"></div>
                    </div>

                    {/* Social Sign In */}
                    {/* <SocialButton provider="google" onClick={() => console.log('Google Auth Clicked')} /> */}
                </div>

                {/* Footer info text */}
                <div className="mt-8 flex flex-col gap-4">
                    <div className="text-center text-xs font-semibold text-slate-500">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-teal-800 font-extrabold hover:underline">
                            Daftar
                        </Link>
                    </div>

                    <p className="text-[10px] font-semibold text-slate-400 text-center leading-relaxed max-w-[80%] mx-auto">
                        Dengan masuk, Anda menyetujui{' '}
                        <Link to="/login" className="text-teal-800 font-extrabold hover:underline">
                            Ketentuan Layanan
                        </Link>{' '}
                        dan{' '}
                        <Link to="/login" className="text-teal-800 font-extrabold hover:underline">
                            Kebijakan Privasi
                        </Link>{' '}
                        kami.
                    </p>
                </div>

                {/* Floating Demo Access Controller at bottom right for development utility */}
                {/* <div className="absolute bottom-2 right-2 z-20">
                    <button
                        onClick={() => setShowDemoAccess(!showDemoAccess)}
                        className="w-6 h-6 bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center text-[9px] font-mono font-bold"
                        title="Akses Cepat Demo"
                    >
                        D
                    </button>

                    {showDemoAccess && (
                        <div className="absolute bottom-8 right-0 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xl w-60 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                                Akses Cepat Pengujian (Demo):
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    onClick={() => {
                                        quickLogin('client');
                                        setShowDemoAccess(false);
                                    }}
                                    className="px-1 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg text-[9px] font-extrabold text-slate-600 hover:text-teal-700 transition-all"
                                >
                                    Client
                                </button>
                                <button
                                    onClick={() => {
                                        quickLogin('worker');
                                        setShowDemoAccess(false);
                                    }}
                                    className="px-1 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg text-[9px] font-extrabold text-slate-600 hover:text-teal-700 transition-all"
                                >
                                    Worker
                                </button>
                                <button
                                    onClick={() => {
                                        quickLogin('admin');
                                        setShowDemoAccess(false);
                                    }}
                                    className="px-1 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg text-[9px] font-extrabold text-slate-600 hover:text-teal-700 transition-all"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div> */}
            </div>
        </div>
    );
}

export default Login
