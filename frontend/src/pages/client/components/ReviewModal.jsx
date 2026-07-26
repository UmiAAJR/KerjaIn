import Modal from '../../../components/ui/Modal';
import { Star } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  reviewSubmitting
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ulasan & Konfirmasi Selesai"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rating Bintang</label>
          <div className="flex gap-1.5 text-2xl text-amber-400">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className="hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <Star size={24} fill={val <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Komentar & Masukan</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Berikan ulasan Anda tentang kualitas pengerjaan jasa worker..."
            required
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#046c7a] transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={reviewSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-750 disabled:bg-slate-300 text-white text-xs font-black rounded-xl text-center shadow-md cursor-pointer transition-all"
        >
          {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan & Konfirmasi Selesai'}
        </button>
      </form>
    </Modal>
  );
}
