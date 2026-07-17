import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Check, X, Eye, ShieldAlert } from 'lucide-react';

const AdminVerification = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchList = async () => {
    try {
      const res = await adminApi.getWorkerVerificationList();
      setList(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleVerify = async (workerId, status) => {
    try {
      await adminApi.verifyWorker(workerId, status);
      alert(`Worker ID ${workerId} berhasil di-set menjadi: ${status}`);
      fetchList();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Verifikasi KTP Worker">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Verifikasi KTP Worker">
      {list.length === 0 ? (
        <Card className="border border-slate-100 p-8 text-center">
          <p className="text-sm font-bold text-slate-400">Tidak ada pengajuan verifikasi KTP masuk</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((item) => (
            <Card key={item.workerId} className="border border-slate-100 flex flex-col justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <img 
                  src={item.photo} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ID: {item.workerId}</span>
                </div>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-center relative">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Foto Selfie</span>
                  <img 
                    src={item.selfiePhoto} 
                    alt="Selfie" 
                    className="w-full h-24 rounded-lg object-cover border bg-slate-200 cursor-pointer"
                    onClick={() => setSelectedPhoto(item.selfiePhoto)}
                  />
                </div>
                <div className="text-center relative">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Foto KTP</span>
                  {item.ktpPhoto ? (
                    <img 
                      src={item.ktpPhoto} 
                      alt="KTP" 
                      className="w-full h-24 rounded-lg object-cover border bg-slate-200 cursor-pointer"
                      onClick={() => setSelectedPhoto(item.ktpPhoto)}
                    />
                  ) : (
                    <div className="w-full h-24 rounded-lg border border-dashed flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {item.status === 'Verified' ? (
                  <div className="w-full py-2 bg-success-50 text-success-600 font-bold text-xs text-center rounded-xl border border-success-100">
                    Akun Telah Terverifikasi
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 py-2 font-bold text-xs"
                      onClick={() => handleVerify(item.workerId, 'Rejected')}
                    >
                      <X size={12} className="mr-1" /> Tolak Verif
                    </Button>
                    <Button
                      size="sm"
                      className="flex-grow py-2 font-bold text-xs"
                      onClick={() => handleVerify(item.workerId, 'Verified')}
                    >
                      <Check size={12} className="mr-1" /> Setujui (Verify)
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title="Pratinjau Foto"
      >
        {selectedPhoto && (
          <img 
            src={selectedPhoto} 
            alt="Preview" 
            className="w-full max-h-[500px] rounded-xl object-contain mx-auto"
          />
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminVerification;
