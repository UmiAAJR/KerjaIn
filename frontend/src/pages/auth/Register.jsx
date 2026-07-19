import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import logo from '../../assets/Logo.png'
// import SocialButton from '../../components/ui/SocialButton';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('client'); // Role switch ('client' | 'worker')
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError('Semua input wajib diisi');
            return;
        }
        if (!agreeTerms) {
            setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Default to client role
            await register(name, email, password, 'client');
            navigate('/client/dashboard');
        } catch (err) {
            setError('Registrasi gagal. Email mungkin sudah terdaftar.');
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
                            Buat Akun Baru
                        </h2>
                        <p className="text-sm font-semibold text-slate-400 mt-1">
                            Mulai hubungkan kebutuhan hyperlocal Anda
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
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Client
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('worker')}
                                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-200 ${role === 'worker'
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Worker
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-accent-50 text-accent-600 text-xs font-bold p-3.5 rounded-xl border border-accent-100/50">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Nama Lengkap"
                            type="text"
                            placeholder="Budi Santoso"
                            icon={User}
                            // value={name}
                            onChange={(e) => setName(e.target.value)}
                            id="register-name"
                            required
                        />

                        <Input
                            label="Alamat Email"
                            type="email"
                            placeholder="nama@email.com"
                            icon={Mail}
                            // value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="register-email"
                            required
                        />

                        <Input
                            label="Kata Sandi"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            // value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="register-password"
                            required
                        />

                        {/* Checkbox agreement */}
                        <div className="pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] font-semibold text-slate-500 select-none">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-teal-800 focus:ring-teal-500/20 mt-0.5"
                                    required
                                />
                                <span className="leading-relaxed">
                                    Saya setuju dengan{' '}
                                    <Link to="/register" className="text-teal-800 font-extrabold hover:underline">
                                        Ketentuan Layanan
                                    </Link>{' '}
                                    dan{' '}
                                    <Link to="/register" className="text-teal-800 font-extrabold hover:underline">
                                        Kebijakan Privasi
                                    </Link>{' '}
                                    KerjaDekat.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-[#035f6b] text-white py-3.5 px-4 rounded-full text-sm font-extrabold shadow-lg shadow-teal-700/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
                        >
                            <UserPlus size={16} className="stroke-[2.5]" />
                            <span>{loading ? 'Mendaftar...' : 'Daftar Akun Baru'}</span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow h-px bg-slate-100"></div>
                        <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Atau Daftar Dengan
                        </span>
                        <div className="flex-grow h-px bg-slate-100"></div>
                    </div>

                    {/* Social Sign Up */}
                    {/* <SocialButton provider="google" onClick={() => console.log('Google Auth Clicked')} /> */}
                </div>

                {/* Footer Link & Terms */}
                <div className="mt-8 flex flex-col gap-4">
                    <div className="text-center text-xs font-semibold text-slate-500">
                        Sudah memiliki akun?{' '}
                        <Link to="/login" className="text-teal-800 font-extrabold hover:underline">
                            Login
                        </Link>
                    </div>

                    <p className="text-[10px] font-semibold text-slate-400 text-center leading-relaxed max-w-[80%] mx-auto">
                        Dengan mendaftar, Anda menyetujui{' '}
                        <Link to="/register" className="text-teal-800 font-extrabold hover:underline">
                            Ketentuan Layanan
                        </Link>{' '}
                        dan{' '}
                        <Link to="/register" className="text-teal-800 font-extrabold hover:underline">
                            Kebijakan Privasi
                        </Link>{' '}
                        kami.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
