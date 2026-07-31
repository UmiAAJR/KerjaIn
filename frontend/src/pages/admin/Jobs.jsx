import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { Search, AlertCircle, Briefcase, Calendar, User, DollarSign } from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getJobs();
      setJobs(res || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => {
    const jobTitle = j.title || j.service || '';
    const matchesSearch = 
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.clientName && j.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (j.workerName && j.workerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'All' || 
      j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const statusColors = {
    'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-blue-50 text-blue-700 border-blue-100',
    'WAITING_PAYMENT': 'bg-blue-50 text-blue-700 border-blue-100',
    'ESCROW_PAID': 'bg-teal-50 text-teal-700 border-teal-100',
    'ACCEPTED': 'bg-cyan-50 text-cyan-700 border-cyan-100',
    'ON_THE_WAY': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'IN_PROGRESS': 'bg-amber-50 text-amber-700 border-amber-100',
    'WAIT_CONFIRM': 'bg-purple-50 text-purple-700 border-purple-100',
    'WAITING_CONFIRMATION': 'bg-purple-50 text-purple-700 border-purple-100',
    'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-100'
  };

  if (loading) {
    return (
      <AdminLayout activeMenu="jobs">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeMenu="jobs">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 select-none">
        
        {/* Header & Search */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
              Daftar Pekerjaan Sistem (Jobs)
            </h3>
            <span className="bg-teal-50 text-teal-600 font-black text-xs px-2.5 py-1 rounded-full border border-teal-100">
              {filteredJobs.length} JOBS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-600 focus:outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer w-full sm:w-44"
            >
              <option value="All">Semua Status</option>
              <option value="PENDING">PENDING (Mencari)</option>
              <option value="ACCEPTED">ACCEPTED (Diterima)</option>
              <option value="ARRIVED">ARRIVED (Tiba)</option>
              <option value="WORKING">WORKING (Dikerjakan)</option>
              <option value="COMPLETED">COMPLETED (Selesai)</option>
              <option value="CANCELLED">CANCELLED (Batal)</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Cari judul, client, worker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="overflow-x-auto min-w-0">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
              <AlertCircle size={36} className="stroke-1.5 text-slate-300" />
              <p className="text-xs font-bold uppercase tracking-wider">Tidak ada pekerjaan ditemukan</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-4 font-bold">Detail Job / Tanggal</th>
                  <th className="pb-4 font-bold">Kategori & Deskripsi</th>
                  <th className="pb-4 font-bold">Client / Worker</th>
                  <th className="pb-4 font-bold text-right">Nilai Transaksi</th>
                  <th className="pb-4 font-bold text-center">Status Operasional</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const currentJobId = job.JobID || job.jobId;
                  const formattedDate = job.bookingDate || job.date || 'Hari ini';
                  return (
                    <tr key={currentJobId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                      
                      {/* Job Details / Date */}
                      <td className="py-4">
                        <div className="font-extrabold text-slate-800 text-sm leading-tight">
                          {job.title || job.service || 'Pekerjaan Jasa'}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          ID: {currentJobId}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{formattedDate} {job.time ? `@ ${job.time}` : ''}</span>
                        </div>
                        {job.schedule && (
                          <div className="text-[9px] font-semibold text-slate-400 mt-0.5">
                            Jadwal: {job.schedule}
                          </div>
                        )}
                        {job.startedAt && (
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            Mulai: {job.startedAt}
                          </div>
                        )}
                        {job.finishedAt && (
                          <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                            Selesai: {job.finishedAt}
                          </div>
                        )}
                      </td>

                      {/* Category & Desc */}
                      <td className="py-4 max-w-xs">
                        <div className="font-bold text-primary-500 uppercase tracking-wide text-[10px]">
                          {job.category || job.jobCategory || 'Jasa Umum'}
                        </div>
                        <p className="text-slate-500 font-medium truncate mt-0.5 max-w-[200px]">
                          {job.description || 'Tidak ada deskripsi pekerjaan.'}
                        </p>
                        {job.status === 'COMPLETED' && job.rating && (
                          <div className="mt-1.5 space-y-0.5">
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-xs">
                                  {i < job.rating ? '★' : '☆'}
                                </span>
                              ))}
                              <span className="text-[10px] font-black text-slate-500 ml-1">({job.rating}/5)</span>
                            </div>
                            {job.comment && (
                              <p className="text-[10px] font-semibold text-slate-400 italic max-w-[180px] truncate" title={job.comment}>
                                "{job.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Client & Worker */}
                      <td className="py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                          <User size={12} className="text-slate-400" />
                          <span>C: {job.clientName || 'Client'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <User size={12} className="text-slate-300" />
                          <span>W: {job.workerName || 'Mencari pekerja...'}</span>
                        </div>
                      </td>

                      {/* Transaction value */}
                      <td className="py-4 text-right font-extrabold text-teal-600 text-sm">
                        {formatIDR(job.price || job.amount)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[job.status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          {job.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminJobs;
