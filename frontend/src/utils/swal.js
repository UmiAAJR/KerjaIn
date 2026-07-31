import Swal from 'sweetalert2';

export const showAlert = (title, icon = 'info', text = '') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#046c7a',
    customClass: {
      popup: 'rounded-3xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-bold'
    }
  });
};

export const showConfirm = async (title, text = '', confirmButtonText = 'Ya, Lanjutkan', icon = 'question') => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#046c7a',
    cancelButtonColor: '#64748b',
    confirmButtonText,
    cancelButtonText: 'Batal',
    customClass: {
      popup: 'rounded-3xl font-sans',
      confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-bold',
      cancelButton: 'rounded-xl px-5 py-2.5 text-xs font-bold'
    }
  });
  return result.isConfirmed;
};

export default Swal;
