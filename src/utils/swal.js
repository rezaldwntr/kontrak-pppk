import Swal from 'sweetalert2'

export const customSwal = Swal.mixin({
  customClass: {
    popup: 'swal-custom-popup',
    title: 'swal-custom-title',
    htmlContainer: 'swal-custom-html',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-secondary',
    actions: 'swal-custom-actions'
  },
  buttonsStyling: false,
  background: '#1F2024',
  color: '#E5E7EB',
  showClass: {
    popup: 'swal2-noanimation',
    backdrop: 'swal2-noanimation'
  },
  hideClass: {
    popup: '',
    backdrop: ''
  }
})
