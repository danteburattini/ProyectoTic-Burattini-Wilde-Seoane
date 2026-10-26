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

async function iniciarSesion(email, password) {
  const URL_LOCAL = 'http://localhost:3000/api/login';

  try {
    const respuesta = await fetch(URL_LOCAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error || 'Error al iniciar sesión');
    }

    console.log('Usuario logueado con éxito:', datos.usuario);
    return datos.usuario; 

  } catch (error) {
    console.error('Error de autenticación:', error.message);
    throw error;
  }
}
