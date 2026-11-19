
const competitivo = document.getElementById("competitivo");

competitivo.addEventListener("click", function(evento) {
    const usuario = sessionStorage.getItem("tokenSesion");

    if (!usuario) {
        evento.preventDefault();
        window.location.href = "../login/login.html?volver=competitivo";
    }
});
