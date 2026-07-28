import React, { useState } from 'react';
import MobileLayout from "../../components/layout/MobileLayout";
import { 
    ArrowLeft, 
    CreditCard, 
    User, 
    CheckCircle2, 
    Building2, 
    ChevronDown, 
    ShieldCheck 
} from 'lucide-react';

// Daftar Bank Populer di Indonesia
const INDONESIA_BANKS = [
    { id: 'bca', name: 'Bank Central Asia (BCA)', code: '014', color: 'bg-blue-600' },
    { id: 'mandiri', name: 'Bank Mandiri', code: '008', color: 'bg-amber-500' },
    { id: 'bri', name: 'Bank Rakyat Indonesia (BRI)', code: '002', color: 'bg-blue-700' },
    { id: 'bni', name: 'Bank Negara Indonesia (BNI)', code: '009', color: 'bg-orange-600' },
    { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', code: '451', color: 'bg-emerald-600' },
    { id: 'cimb', name: 'Bank CIMB Niaga', code: '022', color: 'bg-red-600' },
    { id: 'permata', name: 'Bank Permata', code: '013', color: 'bg-lime-600' },
    { id: 'danamon', name: 'Bank Danamon', code: '011', color: 'bg-orange-500' },
    { id: 'jago', name: 'Bank Jago', code: '542', color: 'bg-amber-400' },
    { id: 'seabank', name: 'SeaBank Indonesia', code: '535', color: 'bg-cyan-500' },
];

export default function EditBankAccount({ currentAccount, onSave, onBack }) {
    const [selectedBank, setSelectedBank] = useState(currentAccount?.bankName || '');
    const [accountNumber, setAccountNumber] = useState(currentAccount?.accountNumber || '');
    const [accountHolder, setAccountHolder] = useState(currentAccount?.accountHolder || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter angka saja untuk nomor rekening
    const handleAccountNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setAccountNumber(val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedBank || !accountNumber || !accountHolder) return;

        setIsSubmitting(true);

        // Simulasi proses simpan (misal request API)
        setTimeout(() => {
            const updatedData = {
                bankName: selectedBank,
                accountNumber: accountNumber,
                accountHolder: accountHolder
            };

            setIsSubmitting(false);
            if (onSave) onSave(updatedData);
        }, 500);
    };

    return (
        <MobileLayout
            topNavProps={{
                variant: "location",
                hasNotification: false,
            }}
            bottomNavProps={{
                activeTab: "wallet",
            }}
        >
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24">
                
                {/* HEADER TOP BAR */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
                    <button 
                        onClick={onBack}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Ubah Rekening Bank</h1>
                    <div className="w-8"></div> {/* Balance Spacer */}
                </div>

                <div className="p-5 flex flex-col gap-5">
                    
                    {/* BANNER INFORMASI KESEHATAN AKUN */}
                    <div className="bg-cyan-50/70 border border-cyan-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#007088] shrink-0 mt-0.5" />
                        <p className="text-xs text-cyan-900 leading-relaxed">
                            Pastikan nama pemilik rekening **sesuai dengan identitas terdaftar** untuk mempercepat proses penarikan dana.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        
                        {/* 1. SELEKSI BANK */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#007088]" />
                                Pilih Bank Tujuan
                            </label>

                            <div className="relative">
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 appearance-none focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all pr-10 cursor-pointer font-medium"
                                >
                                    <option value="" disabled>-- Pilih Bank --</option>
                                    {INDONESIA_BANKS.map((bank) => (
                                        <option key={bank.id} value={bank.name}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* 2. NOMOR REKENING */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-[#007088]" />
                                Nomor Rekening
                            </label>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                value={accountNumber}
                                onChange={handleAccountNumberChange}
                                required
                                placeholder="Contoh: 1234567890"
                                className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all font-mono tracking-wide"
                            />
                        </div>

                       

                        {/* PREVIEW KARTU RINGKASAN REKENING */}
                        {selectedBank && accountNumber && (
                            <div className="mt-2 p-4 bg-slate-100/80 border border-slate-200 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Ringkasan Rekening</span>
                                <span className="text-xs font-bold text-gray-800">{selectedBank}</span>
                                <span className="text-xs font-mono text-gray-600">{accountNumber}</span>
                                <span className="text-xs font-semibold text-[#007088] uppercase mt-0.5">{accountHolder || "NAMA PEMILIK"}</span>
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button 
                            type="submit"
                            disabled={isSubmitting || !selectedBank || !accountNumber || !accountHolder}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-[#007088] hover:bg-[#005a6e] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Rekening Baru'}</span>
                        </button>

                    </form>

                </div>

            </div>
        </MobileLayout>
    );
}