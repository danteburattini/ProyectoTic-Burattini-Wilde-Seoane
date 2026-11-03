
const puntuacion = document.getElementById("puntuacion-final");
const errorPuntaje = sessionStorage.getItem("errorPuntaje");
const puntaje = sessionStorage.getItem("puntajeFinal");

if (errorPuntaje || puntaje === null) {
    puntuacion.textContent = "--";

    document.getElementById("mensaje-final").textContent =
        errorPuntaje || "Todavía no hay una partida terminada.";
} else {
    puntuacion.textContent = Number(puntaje).toLocaleString("es-AR");
}

document.getElementById("jugar-de-nuevo").addEventListener("click", function() {
    sessionStorage.removeItem("finTiempoJuego");
    sessionStorage.removeItem("puntajeFinal");
    sessionStorage.removeItem("errorPuntaje");
});
