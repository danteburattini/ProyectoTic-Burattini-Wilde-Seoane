
const formulario = document.getElementById("formulario-login");
const email = document.getElementById("email");
const password = document.getElementById("password");
const mensaje = document.getElementById("mensaje-login");
const boton = document.getElementById("boton-login");
const cambiar = document.getElementById("cambiar-login");
const titulo = document.getElementById("titulo-login");

const API = "http://localhost:3000";

let registro = false;

cambiar.addEventListener("click", function() {
    registro = !registro;

    mensaje.textContent = "";
    formulario.reset();

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
});

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    mensaje.textContent = "";
    mensaje.classList.remove("mensaje-exito");
    boton.disabled = true;

    const ruta = registro ? "/api/registro" : "/api/login";

    try {
        const respuesta = await fetch(API + ruta, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error || "Ocurrió un error.";
            return;
        }

        if (registro) {
            registro = false;
            titulo.textContent = "USUARIO";
            boton.textContent = "LOG IN";
            cambiar.textContent = "¿NO TENÉS CUENTA? REGISTRATE";
            password.autocomplete = "current-password";
            password.value = "";
            mensaje.textContent = "Cuenta creada. Ahora iniciá sesión.";
            mensaje.classList.add("mensaje-exito");
            return;
        }

        sessionStorage.setItem("usuario", datos.usuario.email);

        const parametros = new URLSearchParams(window.location.search);

        if (parametros.get("volver") === "competitivo") {
            window.location.href = "../modocompetitivo/modocompetitivo.html";
        } else {
            window.location.href = "../home/home.html";
        }

    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor.";
    } finally {
        boton.disabled = false;
    }
});
