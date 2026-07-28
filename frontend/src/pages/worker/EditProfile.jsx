import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../../components/layout/MobileLayout";
import { 
    ArrowLeft, 
    Camera, 
    User, 
    Briefcase, 
    Mail, 
    Phone, 
    FileText, 
    Save,
    X,
    Plus
} from 'lucide-react';

// Opsional: Import opsi dari mockData jika ada, atau buat daftar internal
const AVAILABLE_SKILLS = [
    "Tukang Kayu & Furniture",
    "Teknisi AC & Pendingin",
    "Tukang Cat & Interior",
    "Instalasi Listrik",
    "Pipa & Plambing",
    "Tukang Bangunan & Renovasi",
    "Perbaikan Elektronik",
    "Jasa Kebersihan / Cleaning"
];

export default function EditWorkerProfile({ user, onSave, onBack, isLoading = false }) {
    
    const navigate = useNavigate();
    // Inisialisasi state form dinamis dari props user
    const [formData, setFormData] = useState({
        name: "",
        skills: [], // Mengubah role tunggal menjadi array skills
        email: "",
        phone: "",
        bio: "",
        avatar: ""
    });

    const [previewAvatar, setPreviewAvatar] = useState("");
    const [selectedSkillInput, setSelectedSkillInput] = useState("");

    // Effect untuk sinkronisasi jika data user baru masuk / di-load async
    useEffect(() => {
        if (user) {
            // Parsing skills: bisa dari array `user.skills` atau string `user.role`
            let initialSkills = [];
            if (Array.isArray(user.skills)) {
                initialSkills = user.skills;
            } else if (user.role) {
                initialSkills = [user.role];
            } else {
                initialSkills = ["Tukang Kayu & Furniture"];
            }

            setFormData({
                name: user.name || "",
                skills: initialSkills,
                email: user.email || "",
                phone: user.phone || "",
                bio: user.bio || "",
                avatar: user.avatar || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60"
            });
            setPreviewAvatar(user.avatar || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60");
        }
    }, [user]);

    // Handle input teks biasa
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle tambah keahlian dari Dropdown
    const handleAddSkill = (e) => {
        const value = e.target.value;
        if (value && !formData.skills.includes(value)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, value]
            }));
            setSelectedSkillInput(""); // Reset dropdown
        }
    };

    // Handle hapus keahlian (Badge Tag)
    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    // Handle upload foto preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setPreviewAvatar(imageUrl);
            setFormData(prev => ({
                ...prev,
                avatar: file // Menyimpan file asli untuk upload API/FormData
            }));
        }
    };

    // Handle submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        } else {
            console.log("Data profil diperbarui:", formData);
            if (onBack) onBack();
        }
    };

    return (
        <MobileLayout
            topNavProps={{
                variant: "location",
                hasNotification: false,
            }}
            bottomNavProps={{
                activeTab: "profile",
            }}
        >
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24">
                
                {/* HEADER NAVIGASI */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
                    <button 
                        type="button"
                        onClick={() => navigate('/worker/profile')}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Edit Profil Pekerja</h1>
                    <div className="w-8"></div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    
                    {/* UPLOAD FOTO PROFIL */}
                    <div className="flex flex-col items-center justify-center my-2">
                        <div className="relative">
                            <img 
                                src={previewAvatar} 
                                alt="Preview Avatar" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
                            />
                            <label 
                                htmlFor="avatar-upload" 
                                className="absolute bottom-0 right-0 p-2 bg-[#007088] hover:bg-[#005a6e] text-white rounded-full cursor-pointer shadow-lg transition-transform active:scale-95"
                            >
                                <Camera className="w-4 h-4" />
                            </label>
                            <input 
                                id="avatar-upload" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="hidden" 
                            />
                        </div>
                        <span className="text-xs text-gray-500 mt-2">Ketuk ikon kamera untuk ubah foto</span>
                    </div>

                    {/* INPUT FIELD: NAMA */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#007088]" />
                            Nama Lengkap
                        </label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Masukkan nama lengkap"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all"
                        />
                    </div>

                    {/* DROPDOWN & MULTI-SELECT: PEKERJAAN / KEAHLIAN */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-[#007088]" />
                            Pekerjaan & Keterampilan Mampu
                        </label>
                        
                        {/* Select Dropdown */}
                        <select
                            value={selectedSkillInput}
                            onChange={handleAddSkill}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all cursor-pointer"
                        >
                            <option value="" disabled>-- Pilih / Tambah Keterampilan --</option>
                            {AVAILABLE_SKILLS.filter(skill => !formData.skills.includes(skill)).map((skill, idx) => (
                                <option key={idx} value={skill}>
                                    + {skill}
                                </option>
                            ))}
                        </select>

                        {/* List Badge Keterampilan Terpilih */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {formData.skills.map((skill, index) => (
                                <span 
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#007088]/10 text-[#007088] border border-[#007088]/20 rounded-full text-xs font-medium"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="hover:bg-[#007088]/20 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3 text-[#007088]" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {formData.skills.length === 0 && (
                            <span className="text-[10px] text-amber-600">Pilih minimal 1 keterampilan pekerjaan.</span>
                        )}
                    </div>

                    {/* INPUT FIELD: EMAIL */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#007088]" />
                            Email
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="alamat@email.com"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all"
                        />
                    </div>

                    {/* INPUT FIELD: NOMOR TELEPON */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#007088]" />
                            Nomor Telepon / WhatsApp
                        </label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="08xxxxxxxxxx"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all"
                        />
                    </div>

                    {/* INPUT FIELD: DESKRIPSI WORKER */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#007088]" />
                            Deskripsi / Pengalaman Kerja
                        </label>
                        <textarea 
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Ceritakan pengalaman kerja, keahlian, atau alat yang kamu miliki..."
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all resize-none"
                        />
                    </div>

                    {/* TOMBOL SIMPAN */}
                    <button 
                        type="submit"
                        disabled={isLoading || formData.skills.length === 0}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#007088] hover:bg-[#005a6e] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                    >
                        <Save className="w-4 h-4" />
                        <span>{isLoading ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </button>

                </form>

            </div>
        </MobileLayout>
    );
}