import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../services/adminService';
import { Plus, Trash, AlertCircle, Wrench, Layers, HelpCircle, ChevronDown, ChevronUp, PlusCircle, Check } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [expandedCatId, setExpandedCatId] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await adminApi.createCategory(newCatName.trim());
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      alert("Gagal menambahkan kategori: " + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kategori ini? Seluruh data sub-skill di dalamnya juga akan terhapus.")) return;
    try {
      await adminApi.deleteCategory(id);
      if (expandedCatId === id) setExpandedCatId(null);
      fetchCategories();
    } catch (err) {
      alert("Gagal menghapus kategori: " + err.message);
    }
  };

  const handleCreateSkill = async (e, categoryId) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await adminApi.createSkill(categoryId, newSkillName.trim());
      setNewSkillName('');
      fetchCategories();
    } catch (err) {
      alert("Gagal menambahkan skill: " + err.message);
    }
  };

  const handleDeleteSkill = async (categoryId, skillId) => {
    if (!window.confirm("Hapus sub-skill ini?")) return;
    try {
      await adminApi.deleteSkill(categoryId, skillId);
      fetchCategories();
    } catch (err) {
      alert("Gagal menghapus skill: " + err.message);
    }
  };

  const toggleExpand = (catId) => {
    if (expandedCatId === catId) {
      setExpandedCatId(null);
    } else {
      setExpandedCatId(catId);
      setNewSkillName(''); // reset input
    }
  };

  if (loading) {
    return (
      <AdminLayout activeMenu="categories">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeMenu="categories">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 select-none">
        
        {/* Category List */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider font-heading">
              Daftar Kategori Jasa & Sub-Keahlian
            </h3>
            <span className="bg-teal-50 text-teal-600 font-black text-xs px-2.5 py-1 rounded-full border border-teal-100">
              {categories.length} KATEGORI
            </span>
          </div>

          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <AlertCircle size={36} className="stroke-1.5 text-slate-300" />
                <p className="text-xs font-bold uppercase tracking-wider">Belum ada kategori terdaftar</p>
              </div>
            ) : (
              categories.map((cat) => {
                const catId = cat.CategoryID || cat.id;
                const catName = cat.name || cat.nama;
                const isExpanded = expandedCatId === catId;
                const skillsList = cat.skills || [];

                return (
                  <div key={catId} className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                    
                    {/* Category Row Header */}
                    <div 
                      onClick={() => toggleExpand(catId)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors
                        ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'bg-white hover:bg-slate-50/40'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                          <Layers size={18} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800 font-heading leading-tight">
                            {catName}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">
                            {skillsList.length} Sub-Keahlian (Skills)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteCategory(catId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash size={15} />
                        </button>
                        <button
                          onClick={() => toggleExpand(catId)}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={16} className="stroke-[2.5]" /> : <ChevronDown size={16} className="stroke-[2.5]" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Skills Section */}
                    {isExpanded && (
                      <div className="p-5 bg-white space-y-4 border-t border-slate-100/50">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Daftar Sub-Keahlian ({catName}):
                        </div>

                        {/* List of Skills */}
                        {skillsList.length === 0 ? (
                          <div className="text-xs font-bold text-slate-400 italic py-2">
                            Belum ada sub-keahlian terdaftar untuk kategori ini.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2.5">
                            {skillsList.map((skill) => {
                              const skillId = skill.SkillID || skill.id;
                              return (
                                <div 
                                  key={skillId} 
                                  className="flex items-center gap-1.5 bg-slate-50 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs hover:border-slate-300"
                                >
                                  <span>{skill.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSkill(catId, skillId)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                                  >
                                    <X size={12} strokeWidth={3} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Skill Form */}
                        <form onSubmit={(e) => handleCreateSkill(e, catId)} className="flex gap-2 pt-2 border-t border-slate-50">
                          <input
                            type="text"
                            placeholder="Nama sub-keahlian baru..."
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            required
                            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500 transition-all"
                          />
                          <button
                            type="submit"
                            className="bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-100 py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            <PlusCircle size={14} className="stroke-[2.5]" />
                            <span>Tambah Skill</span>
                          </button>
                        </form>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Category Form Panel */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading mb-4">
              Buat Kategori Baru
            </h3>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelistrikan"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-md shadow-teal-500/5"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>Simpan Kategori</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
