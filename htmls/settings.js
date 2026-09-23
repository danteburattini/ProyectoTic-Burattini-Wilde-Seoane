document.addEventListener("DOMContentLoaded", () => {
    const btnCerrarSesion = document.getElementById("btn-logout") || document.querySelector(".btn-danger");
    const selectVolumen = document.getElementById("config-volumen");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogueado");
            localStorage.removeItem("nombreUsuario");
            alert("Sesión cerrada correctamente.");
            window.location.href = "home.html";
        });
    }

    if (selectVolumen) {
        selectVolumen.addEventListener("change", () => {
            localStorage.setItem("config_volumen", selectVolumen.value);
        });
    }
});
