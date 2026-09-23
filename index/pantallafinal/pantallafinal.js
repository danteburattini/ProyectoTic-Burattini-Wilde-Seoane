document.addEventListener("DOMContentLoaded", () => {
    const contenedorPuntaje = document.querySelector(".score-number");

    if (contenedorPuntaje) {
        const puntajeFinal = localStorage.getItem("puntajeFinal");

        if (puntajeFinal !== null) {
            const puntajeFormateado = Number(puntajeFinal).toLocaleString("es-AR");
            contenedorPuntaje.textContent = puntajeFormateado;
        } else {
            contenedorPuntaje.textContent = "0";
        }
    }
});
