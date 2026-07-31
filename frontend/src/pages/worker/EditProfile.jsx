import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../../components/layout/MobileLayout";
import { showAlert } from '../../utils/swal';
import axiosInstance from '../../services/axiosInstance';

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
    Lock,
    Loader2,
    Layers,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

// Fallback Categories & Skills if DB is empty
const FALLBACK_CATEGORIES = [
    {
        id: "cat-1",
        CategoryID: "cat-1",
        name: "Pertukangan & Bangunan",
        skills: [
            { id: "sk-1", SkillID: "sk-1", name: "Tukang Kayu & Furniture" },
            { id: "sk-2", SkillID: "sk-2", name: "Tukang Bangunan & Renovasi" },
            { id: "sk-3", SkillID: "sk-3", name: "Tukang Cat & Interior" },
            { id: "sk-4", SkillID: "sk-4", name: "Pasang Keramik & Lantai" }
        ]
    },
    {
        id: "cat-2",
        CategoryID: "cat-2",
        name: "Teknisi & Kelistrikan",
        skills: [
            { id: "sk-5", SkillID: "sk-5", name: "Instalasi Listrik" },
            { id: "sk-6", SkillID: "sk-6", name: "Teknisi AC & Pendingin" },
            { id: "sk-7", SkillID: "sk-7", name: "Perbaikan Elektronik" },
            { id: "sk-8", SkillID: "sk-8", name: "Perbaikan Pompa Air" }
        ]
    },
    {
        id: "cat-3",
        CategoryID: "cat-3",
        name: "Sanitari & Plambing",
        skills: [
            { id: "sk-9", SkillID: "sk-9", name: "Pipa & Plambing" },
            { id: "sk-10", SkillID: "sk-10", name: "Perbaikan Saluran Mampet" },
            { id: "sk-11", SkillID: "sk-11", name: "Pemasangan Wastafel & WC" }
        ]
    },
    {
        id: "cat-4",
        CategoryID: "cat-4",
        name: "Kebersihan & Asisten",
        skills: [
            { id: "sk-12", SkillID: "sk-12", name: "Jasa Kebersihan / Cleaning" },
            { id: "sk-13", SkillID: "sk-13", name: "Cuci Sofa & Kasur" },
            { id: "sk-14", SkillID: "sk-14", name: "Pembersihan Taman" }
        ]
    },
    {
        id: "cat-5",
        CategoryID: "cat-5",
        name: "Otomotif",
        skills: [
            { id: "sk-15", SkillID: "sk-15", name: "Montir Mobil Panggilan" },
            { id: "sk-16", SkillID: "sk-16", name: "Montir Motor Panggilan" },
            { id: "sk-17", SkillID: "sk-17", name: "Servis Aki & Ban" }
        ]
    }
];

export default function EditWorkerProfile({ user, onSave, onBack }) {
    const navigate = useNavigate();
    const currentWorkerId = localStorage.getItem('workerId') || 'me';

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // List of categories from API/Fallback
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
        avatar: DEFAULT_AVATAR,
        photoBase64: null
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]); // Max 3 items
    const [previewAvatar, setPreviewAvatar] = useState(DEFAULT_AVATAR);
    const [selectedSkillInput, setSelectedSkillInput] = useState("");
    
    // State UX
    const [fetching, setFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Load categories and worker profile data
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                // 1. Fetch categories from backend
                let cats = FALLBACK_CATEGORIES;
                try {
                    const catRes = await axiosInstance.get('/category');
                    if (catRes.data?.data && catRes.data.data.length > 0) {
                        cats = catRes.data.data;
                    }
                } catch (catErr) {
                    console.warn("Using fallback categories:", catErr.message);
                }
                setCategories(cats);

                // 2. Fetch worker profile
                let profile = user;
                if (!profile) {
                    profile = await workerApi.getProfile(currentWorkerId);
                }

                if (profile) {
                    const nameVal = profile.name || profile.User?.name || "";
                    const emailVal = profile.email || profile.User?.email || "";
                    const phoneVal = profile.phone || profile.User?.phoneNumber || "";
                    const bioVal = profile.bio || profile.description || profile.User?.description || "";
                    const avatarVal = profile.photo || profile.avatar || profile.User?.photo || DEFAULT_AVATAR;

                    setFormData({
                        name: nameVal,
                        email: emailVal,
                        phone: phoneVal,
                        bio: bioVal,
                        avatar: avatarVal,
                        photoBase64: null
                    });
                    setPreviewAvatar(avatarVal);

                    // Parse existing skills
                    let existingSkills = [];
                    if (Array.isArray(profile.skills)) {
                        existingSkills = profile.skills.map(s => typeof s === 'string' ? { name: s } : s).filter(Boolean);
                    }

                    // Find category matching existing skills
                    let matchedCatId = profile.CategoryID || "";
                    if (!matchedCatId && existingSkills.length > 0) {
                        const firstSkillName = existingSkills[0]?.name || existingSkills[0]?.skillName;
                        if (firstSkillName) {
                            const foundCat = cats.find(c => 
                                (c.skills || []).some(s => (s.name || '').toLowerCase() === firstSkillName.toLowerCase())
                            );
                            if (foundCat) {
                                matchedCatId = foundCat.CategoryID || foundCat.id;
                            }
                        }
                    }

                    if (!matchedCatId && cats.length > 0) {
                        matchedCatId = cats[0].CategoryID || cats[0].id;
                    }

                    setSelectedCategoryId(matchedCatId);

                    // Limit skills to max 3
                    setSelectedSkills(existingSkills.slice(0, 3));
                }
            } catch (err) {
                console.error("Gagal memuat profil pekerja:", err);
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [user, currentWorkerId]);

    // Handle Category change (1 Worker 1 Kategori Saja)
    const handleCategoryChange = (e) => {
        const newCatId = e.target.value;
        setSelectedCategoryId(newCatId);
        
        // Reset skills if user changes category
        setSelectedSkills([]);
        setSelectedSkillInput("");
    };

    // Handle Add Skill (Max 3 Skills)
    const handleAddSkill = (e) => {
        const skillIdOrName = e.target.value;
        if (!skillIdOrName) return;

        if (selectedSkills.length >= 3) {
            showAlert("Batas Maksimal", "warning", "Maksimal 3 keahlian per pekerja.");
            return;
        }

        const currentCategory = categories.find(c => (c.CategoryID || c.id) === selectedCategoryId);
        const availableSkills = currentCategory?.skills || [];
        const foundSkill = availableSkills.find(s => (s.SkillID || s.id) === skillIdOrName || s.name === skillIdOrName);

        const skillObj = foundSkill || { id: skillIdOrName, SkillID: skillIdOrName, name: skillIdOrName };

        // Check duplicate
        const isDuplicate = selectedSkills.some(s => (s.SkillID || s.id || s.name) === (skillObj.SkillID || skillObj.id || skillObj.name));

        if (!isDuplicate) {
            setSelectedSkills(prev => [...prev, skillObj].slice(0, 3));
        }
        setSelectedSkillInput("");
    };

    // Handle Remove Skill Tag
    const handleRemoveSkill = (skillToRemove) => {
        const keyToRemove = skillToRemove.SkillID || skillToRemove.id || skillToRemove.name;
        setSelectedSkills(prev => prev.filter(s => (s.SkillID || s.id || s.name) !== keyToRemove));
    };

    // Handle Upload Avatar
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) {
                showAlert("File Terlalu Besar", "warning", "Ukuran file maksimal 8MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result;
                setPreviewAvatar(base64Data);
                setFormData(prev => ({
                    ...prev,
                    avatar: base64Data,
                    photoBase64: base64Data
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCategoryId) {
            showAlert("Kategori Diperlukan", "warning", "Harap pilih 1 Kategori Pekerjaan!");
            return;
        }

        if (selectedSkills.length === 0) {
            showAlert("Keahlian Diperlukan", "warning", "Harap pilih minimal 1 keahlian (maksimal 3)!");
            return;
        }

        setSubmitting(true);
        try {
            const skillNames = selectedSkills.map(s => s.name || s.skillName);
            const payload = {
                photo: formData.photoBase64 || formData.avatar,
                bio: formData.bio,
                description: formData.bio,
                selectedCategory: selectedCategoryId,
                skills: skillNames
            };

            await workerApi.updateProfile(currentWorkerId, payload);
            showAlert("Berhasil", "success", "Profil pekerja berhasil diperbarui!");

            if (onSave) {
                onSave({ ...formData, skills: selectedSkills });
            } else {
                navigate('/worker/profile');
            }
        } catch (err) {
            showAlert("Gagal", "error", "Gagal memperbarui profil: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Get skills list for currently selected category
    const currentCategoryObj = categories.find(c => (c.CategoryID || c.id) === selectedCategoryId);
    const categorySkillsList = currentCategoryObj?.skills || [];

    if (loadingData) {
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
                <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#007088] mb-2" />
                    <p className="text-xs font-medium">Memuat data profil...</p>
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
            <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 pb-24 select-none">
                
                {/* HEADER NAVIGASI */}
                <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
                    <button 
                        type="button"
                        onClick={() => navigate('/worker/profile')}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-extrabold text-slate-800">Edit Profil Pekerja</h1>
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
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
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
                        <span className="text-xs text-slate-500 font-medium mt-2">Ketuk ikon kamera untuk mengubah foto</span>
                    </div>

                    {/* INPUT FIELD READ-ONLY: NAMA LENGKAP */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#007088]" />
                                Nama Lengkap
                            </label>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                Tidak dapat diubah
                            </span>
                        </div>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            readOnly
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none"
                        />
                    </div>

                    {/* INPUT FIELD READ-ONLY: EMAIL */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-[#007088]" />
                                Alamat Email
                            </label>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                Tidak dapat diubah
                            </span>
                        </div>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            readOnly
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none"
                        />
                    </div>

                    {/* INPUT FIELD READ-ONLY: NOMOR TELEPON */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#007088]" />
                                Nomor Telepon / WhatsApp
                            </label>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                Tidak dapat diubah
                            </span>
                        </div>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            readOnly
                            disabled
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none"
                        />
                    </div>

                    {/* 1. KATEGORI UTAMA (1 WORKER 1 KATEGORI SAJA) */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-[#007088]" />
                                Kategori Utama Pekerjaan
                            </label>
                            <span className="text-[10px] font-black text-[#007088] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                1 Pekerja 1 Kategori
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">Pilih bidang spesialisasi utama layanan Anda.</p>

                        <select
                            value={selectedCategoryId}
                            onChange={handleCategoryChange}
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all cursor-pointer mt-1"
                        >
                            <option value="" disabled>-- Pilih Kategori Utama --</option>
                            {categories.map((cat) => (
                                <option key={cat.CategoryID || cat.id} value={cat.CategoryID || cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2. SKILL / KEAHLIAN (MAX 3 SKILL PER WORKER) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-[#007088]" />
                                Keahlian Spesifik
                            </label>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedSkills.length >= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                                Keahlian Terpilih ({selectedSkills.length}/3)
                            </span>
                        </div>

                        {/* Select Skill Dropdown */}
                        <select
                            value={selectedSkillInput}
                            onChange={handleAddSkill}
                            disabled={!selectedCategoryId || selectedSkills.length >= 3}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            <option value="" disabled>
                                {!selectedCategoryId 
                                    ? "-- Pilih Kategori Utama Terlebih Dahulu --" 
                                    : selectedSkills.length >= 3 
                                    ? "-- Maksimal 3 Keahlian Tercapai --" 
                                    : "-- Tambah Keahlian (Maks 3) --"}
                            </option>
                            {categorySkillsList
                                .filter(s => !selectedSkills.some(sel => (sel.SkillID || sel.id || sel.name) === (s.SkillID || s.id || s.name)))
                                .map((sk) => (
                                    <option key={sk.SkillID || sk.id || sk.name} value={sk.SkillID || sk.id || sk.name}>
                                        + {sk.name}
                                    </option>
                                ))
                            }
                        </select>

                        {/* List Badge Keahlian Terpilih */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedSkills.map((sk, index) => {
                                const skillName = sk.name || sk.skillName;
                                return (
                                    <span 
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#007088]/10 text-[#007088] border border-[#007088]/20 rounded-full text-xs font-extrabold"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#007088]" />
                                        <span>{skillName}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(sk)}
                                            className="hover:bg-[#007088]/20 rounded-full p-0.5 transition-colors cursor-pointer ml-1"
                                            title="Hapus Skill"
                                        >
                                            <X className="w-3.5 h-3.5 text-[#007088]" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        {selectedSkills.length === 0 && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <AlertCircle size={12} />
                                Pilih minimal 1 keahlian spesifik di bawah kategori ini.
                            </span>
                        )}
                        {selectedSkills.length >= 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                                Batas maksimal 3 keahlian tercapai. Hapus salah satu keahlian jika ingin mengganti.
                            </span>
                        )}
                    </div>

                    {/* INPUT FIELD: DESKRIPSI WORKER */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#007088]" />
                            Deskripsi / Pengalaman Kerja
                        </label>
                        <textarea 
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Ceritakan pengalaman kerja, keahlian, atau alat kerja yang kamu miliki..."
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007088] focus:ring-1 focus:ring-[#007088] transition-all resize-none"
                        />
                    </div>

                    {/* TOMBOL SIMPAN */}
                    <button 
                        type="submit"
                        disabled={submitting || !selectedCategoryId || selectedSkills.length === 0}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#007088] hover:bg-[#005a6e] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                        {submitting ? (
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