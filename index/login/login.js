
const formulario = document.getElementById("formularioLogin");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mensaje = document.getElementById("mensajeLogin");
const boton = document.getElementById("botonLogin");
const cambiar = document.getElementById("cambiarLogin");
const titulo = document.getElementById("tituloLogin");

const API = window.location.port === "3000" ? window.location.origin : "http://localhost:3000";

let registro = false;

function mostrarFormulario() {
    if (registro) {
        titulo.textContent = "REGISTRO";
        boton.textContent = "REGISTRARSE";
        cambiar.textContent = "¿YA TENÉS CUENTA? INICIÁ SESIÓN";
        password.autocomplete = "new-password";
    } else {
        titulo.textContent = "USUARIO";
        boton.textContent = "LOG IN";
        cambiar.textContent = "¿NO TENÉS CUENTA? REGISTRATE";
        password.autocomplete = "current-password";
    }
}

cambiar.addEventListener("click", function() {
    registro = !registro;
    mensaje.textContent = "";
    formulario.reset();
    mostrarFormulario();
});

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    mensaje.textContent = "";
    mensaje.classList.remove("mensajeExito");
    boton.disabled = true;

    const ruta = registro ? "/api/registro" : "/api/login";

    return fetch(API + ruta, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email.value.trim(),
            password: password.value
        })
    }).then(async function(respuesta) {
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "Ocurrió un error.";
            return;
        }

        if (registro) {
            registro = false;
            mostrarFormulario();
            password.value = "";
            mensaje.textContent = "Cuenta creada. Ahora iniciá sesión.";
            mensaje.classList.add("mensajeExito");
            return;
        }

        sessionStorage.setItem("usuario", datos.usuario.email);
        sessionStorage.setItem("tokenSesion", datos.token);

        const parametros = new URLSearchParams(window.location.search);

        if (parametros.get("volver") === "competitivo") {
            window.location.href = "../modocompetitivo/modocompetitivo.html";
        } else {
            window.location.href = "../home/home.html";
        }
    }).then(undefined, function() {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    }).finally(function() {
        boton.disabled = false;
    });
});

const cerrarSesion = document.getElementById("cerrarSesion");
const tokenActual = sessionStorage.getItem("tokenSesion");
cerrarSesion.hidden = !tokenActual;

cerrarSesion.addEventListener("click", function() {
    fetch(API + "/api/logout", {
        method: "POST",
        headers: { Authorization: "Bearer " + tokenActual },
        keepalive: true
    }).then(undefined, function() {});
    sessionStorage.removeItem("tokenSesion");
    sessionStorage.removeItem("usuario");
    window.location.href = "../home/home.html";
});
