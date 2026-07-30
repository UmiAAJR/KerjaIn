import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
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
    Loader2,
    DollarSign
} from 'lucide-react';

export default function EditWorkerProfile({ workerId: propWorkerId }) {
    const navigate = useNavigate();
    
    // Ambil workerId dari prop atau dari localStorage
    const activeWorkerId = propWorkerId || localStorage.getItem('workerId');

    // State Master Data dari Database
    const [availableSkills, setAvailableSkills] = useState([]);

    // State Form
    const [formData, setFormData] = useState({
        name: "",
        skills: [],
        email: "",
        phone: "",
        bio: "",
        hourlyRate: 30000,
        photo: ""
    });

    const [previewAvatar, setPreviewAvatar] = useState("");
    const [selectedSkillInput, setSelectedSkillInput] = useState("");
    
    // State UX
    const [fetching, setFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Load Data Profil & Master Skills dari Database Secara Pararel
    useEffect(() => {
    const fetchAllData = async () => {
        try {
            setFetching(true);

            // 1. Panggil API getSkills
            const skillsRes = await workerApi.getSkills();
            
            console.log("A. Respon mentah dari API:", skillsRes);

            // 2. Ekstrak array skill dari wrapper { message, data }
            let rawSkillsList = [];

            if (Array.isArray(skillsRes)) {
                // Jika api.js sudah mengembalikan response.data.data
                rawSkillsList = skillsRes;
            } else if (skillsRes && Array.isArray(skillsRes.data)) {
                // Jika api.js mengembalikan response.data
                rawSkillsList = skillsRes.data;
            }

            console.log("B. Array skill setelah diekstrak:", rawSkillsList);

            // 3. Ambil string nama skill (kolom 'name' dari database)
            const formattedSkills = rawSkillsList.map(item => {
                if (typeof item === 'string') return item;
                return item.name || item.skillName || '';
            }).filter(Boolean);

            console.log("C. Hasil akhir array string skill:", formattedSkills);

            // 4. Simpan ke state
            setAvailableSkills(formattedSkills);

        } catch (err) {
            console.error("Gagal mengambil data skill:", err);
        } finally {
            setFetching(false);
        }
    };

    fetchAllData();
}, []);

    // Handle Input Teks
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Tambah Skill
    const handleAddSkill = (e) => {
        const value = e.target.value;
        if (value && !formData.skills.includes(value)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, value]
            }));
            setSelectedSkillInput("");
        }
    };

    // Handle Hapus Skill
    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    // Handle Ubah Foto Profil 
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
                setFormData(prev => ({
                    ...prev,
                    photo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Submit Perubahan ke Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage("");

        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                description: formData.bio,
                bio: formData.bio,
                skills: formData.skills,
                hourlyRate: Number(formData.hourlyRate),
                photo: formData.photo
            };

            await workerApi.updateProfile(activeWorkerId, payload);

            alert("Profil berhasil diperbarui!");
            navigate('/worker/profile');
        } catch (err) {
            console.error("Gagal memperbarui profil:", err);
            setErrorMessage(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSaving(false);
        }
    };

    if (fetching) {
        return (
            <MobileLayout topNavProps={{ variant: "location" }} bottomNavProps={{ activeTab: "profile" }}>
                <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-[#007088]" />
                        <span className="text-xs">Memuat data dari database...</span>
                    </div>
                </div>
            </MobileLayout>
        );
    }

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

                {errorMessage && (
                    <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                        {errorMessage}
                    </div>
                )}

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

                    {/* NAMA */}
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

                    {/* TARIF PER JAM */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-[#007088]" />
                            Tarif per Jam (Rp)
                        </label>
                        <input 
                            type="number" 
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                            required
                            min="10000"
                            step="5000"
                            placeholder="Contoh: 35000"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all"
                        />
                    </div>

                    {/* DROPDOWN DINAMIS SKILL DARI DATABASE */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-[#007088]" />
                            Pekerjaan & Keterampilan Mampu
                        </label>
                        
                        <select
                            value={selectedSkillInput}
                            onChange={handleAddSkill}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all cursor-pointer"
                        >
                            <option value="" disabled>-- Pilih / Tambah Keterampilan --</option>
                            
                            {/* Rendering Opsi Skill Langsung Dari State Database */}
                            {availableSkills
                                .filter(skill => !formData.skills.includes(skill))
                                .map((skill, idx) => (
                                    <option key={idx} value={skill}>
                                        + {skill}
                                    </option>
                                ))
                            }
                        </select>

                        {/* List Skill Terpilih */}
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

                    {/* EMAIL */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#007088]" />
                            Email
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* NOMOR TELEPON */}
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

                    {/* DESKRIPSI WORKER */}
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
                        disabled={isSaving || formData.skills.length === 0}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#007088] hover:bg-[#005a6e] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>

                </form>

            </div>
        </MobileLayout>
    );
}