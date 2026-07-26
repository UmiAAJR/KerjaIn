import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/layout/MobileLayout';
import { clientApi } from '../../services/api';
import {
    Star,
    ChevronLeft,
    ShieldCheck,
    MessageSquare,
    MapPin,
    UserCheck
} from 'lucide-react';

const ClientHistoryDetail = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [jobDetails, setJobDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await clientApi.getJobTracking(jobId);
                setJobDetails(data);
            } catch (err) {
                console.error('Failed to fetch history detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [jobId]);

    const formatPrice = (amount) => {
        return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
    };

    const renderStars = (rating) => {
        const stars = [];
        const score = rating || 5;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    className={i <= score ? "fill-amber-400 stroke-amber-500" : "text-slate-200 stroke-[1.5]"}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <MobileLayout
                topNavProps={{
                    variant: "brand",
                    brandName: "Detail Riwayat",
                    hasNotification: false,
                }}
                bottomNavProps={{
                    activeTab: "activity",
                }}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#046c7a]"></div>
                </div>
            </MobileLayout>
        );
    }

    if (!jobDetails) {
        return (
            <MobileLayout
                topNavProps={{
                    variant: "brand",
                    brandName: "Detail Riwayat",
                    hasNotification: false,
                }}
                bottomNavProps={{
                    activeTab: "activity",
                }}
            >
                <div className="px-5 py-8 text-center space-y-4">
                    <p className="text-xs font-bold text-slate-500">Detail transaksi tidak ditemukan.</p>
                    <button
                        onClick={() => navigate('/client/history')}
                        className="bg-[#046c7a] hover:bg-[#035f6b] text-white px-5 py-2.5 rounded-full text-xs font-black"
                    >
                        Kembali Ke Riwayat
                    </button>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout
            topNavProps={{
                variant: "brand",
                brandName: "Detail Riwayat",
                hasNotification: false,
            }}
            bottomNavProps={{
                activeTab: "activity",
            }}
        >
            <div className="px-5 pt-4 pb-8 space-y-4">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate('/client/history')}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-[#046c7a] hover:underline cursor-pointer"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                    <span>Kembali ke Riwayat</span>
                </button>

                {/* Static Progress Header */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100">
                            Pekerjaan Selesai (7 dari 7)
                        </span>
                        <span className="text-xs font-black text-slate-800 font-heading">
                            Selesai & Lunas
                        </span>
                    </div>

                    {/* Continuous Progress Bar Line */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                        <div
                            className="bg-gradient-to-r from-[#046c7a] to-emerald-500 h-full rounded-full"
                            style={{ width: '100%' }}
                        ></div>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 leading-snug">
                        Transaksi selesai sepenuhnya. Seluruh dana escrow telah dirilis secara aman ke wallet worker.
                    </p>
                </div>

                {/* Worker Profile Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={jobDetails.workerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                            alt={jobDetails.workerName}
                            className="w-14 h-14 rounded-[20px] object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-black text-slate-800 truncate">
                                    {jobDetails.workerName}
                                </h4>
                                <span className="bg-teal-50 text-[#046c7a] p-0.5 rounded-md border border-teal-100/50 shrink-0">
                                    <UserCheck size={10} />
                                </span>
                            </div>
                            <p className="text-xs font-extrabold text-[#046c7a] mt-0.5">
                                {jobDetails.service}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                                <span className="text-amber-500">★</span>
                                <span className="text-slate-600">4.9</span>
                                <span className="h-2 w-px bg-slate-200 mx-1"></span>
                                <span>Worker Profesional</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Metadata details */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                        Rincian Pesanan
                    </h3>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job ID</span>
                            <span className="font-mono font-bold text-slate-700 mt-0.5 block">{jobDetails.jobId}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Jasa</span>
                            <span className="font-bold text-slate-700 mt-0.5 block">{jobDetails.jobCategory || 'Jasa KerjaIn'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{jobDetails.date}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Mulai</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{jobDetails.startedAt || 'N/A'}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Selesai</span>
                            <span className="font-semibold text-slate-700 mt-0.5 block">{jobDetails.finishedAt || 'N/A'}</span>
                        </div>
                        <div className="col-span-2 border-t border-slate-50 pt-3">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={11} className="text-slate-400" /> Lokasi Pengerjaan
                            </span>
                            <span className="font-semibold text-slate-700 mt-0.5 block leading-relaxed">{jobDetails.address || 'Alamat lokasi client'}</span>
                        </div>
                    </div>
                </div>

                {/* Price and Escrow Card */}
                <div className="bg-slate-50 rounded-[24px] border border-slate-200/40 p-4 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Total Pembayaran Lunas</span>
                        <span className="text-lg font-black text-[#046c7a] font-heading block mt-0.5">
                            {formatPrice(jobDetails.price)}
                        </span>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3.5 py-2 rounded-xl text-[10px] font-black border border-emerald-150 flex items-center gap-1">
                        <ShieldCheck size={13} /> Escrow Rilis
                    </div>
                </div>

                {/* Rating Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-xs space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-slate-400" /> Ulasan Anda
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            {renderStars(jobDetails.rating)}
                            <span className="text-xs font-black text-slate-800 ml-1.5">
                                {jobDetails.rating || 5}.0 dari 5.0
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-655 italic bg-slate-50 p-3 rounded-2xl border border-slate-100/50 leading-relaxed">
                            "{jobDetails.comment || 'Pekerja sangat profesional, ramah, dan menyelesaikan tugas tepat waktu sesuai pesanan. Sangat direkomendasikan!'}"
                        </p>
                    </div>
                </div>

            </div>
        </MobileLayout>
    );
};

export default ClientHistoryDetail;
