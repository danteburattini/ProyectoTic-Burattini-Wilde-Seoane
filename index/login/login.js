const loginBtn = document.querySelector('.btn-yellow');
const inputs = document.querySelectorAll('.input-field');

if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    if (!inputs[0].value.trim() || !inputs[1].value.trim()) {
      e.preventDefault();
      alert('Ingresá usuario y contraseña para continuar.');
    }
  });
}