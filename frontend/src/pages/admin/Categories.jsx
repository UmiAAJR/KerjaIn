import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Trash2, Plus, Tag } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setAdding(true);
    try {
      await adminApi.createCategory(newCatName);
      setNewCatName('');
      fetchCats();
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori jasa ini?')) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCats();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Manajemen Kategori Jasa">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manajemen Kategori Jasa">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Add */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-100 p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 font-heading">Tambah Kategori Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                label="Nama Kategori Jasa"
                placeholder="misal: Jasa Kebun"
                icon={Tag}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                id="cat-name-input"
              />
              <Button type="submit" className="w-full flex justify-center py-2.5" disabled={adding}>
                <Plus size={16} className="mr-1" /> {adding ? 'Menambahkan...' : 'Tambah Kategori'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-700 font-heading">Daftar Kategori Aktif</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="border border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{cat.nama}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{cat.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all"
                  title="Hapus Kategori"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
