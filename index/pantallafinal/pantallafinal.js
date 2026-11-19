
const puntuacion = document.getElementById("puntuacion-final");
const errorPuntaje = sessionStorage.getItem("errorPuntaje");
const puntaje = sessionStorage.getItem("puntajeFinal");

const mensajeFinal = document.getElementById("mensaje-final");

function mostrarRondas(rondas) {
    const detalle = document.getElementById("detalle-rondas");
    const lista = document.getElementById("rondas-finales");

    lista.replaceChildren();

    for (const ronda of rondas) {
        const item = document.createElement("li");
        const lugar = document.createElement("strong");
        lugar.textContent = ronda.lugar + " (" + ronda.anio_real + ")";
        const datos = document.createElement("p");
        if (ronda.anio_elegido === null) {
            datos.textContent = "Sin respuesta. 0 puntos.";
        } else {
            datos.textContent =
            "Tu año: " + ronda.anio_elegido + " (" + ronda.puntos_anio.toLocaleString("es-AR") +
            " puntos). Distancia: " + ronda.distancia_km.toLocaleString("es-AR") +
            " km (" + ronda.puntos_mapa.toLocaleString("es-AR") + " puntos).";
        }
        const fuente = document.createElement("a");
        fuente.href = ronda.fuente;
        fuente.target = "_blank";
        fuente.rel = "noopener noreferrer";
        fuente.textContent = "Fuente";
        const mapa = document.createElement("a");
        mapa.href = "https://www.openstreetmap.org/?mlat=" + ronda.lat + "&mlon=" + ronda.lng +
            "#map=16/" + ronda.lat + "/" + ronda.lng;
        mapa.target = "_blank";
        mapa.rel = "noopener noreferrer";
        mapa.textContent = "Ver ubicación";
        item.append(lugar, datos, mapa, " · ", fuente);
        lista.append(item);
    }

    detalle.hidden = rondas.length === 0;
}

if (errorPuntaje || puntaje === null) {
    mensajeFinal.textContent = errorPuntaje || "Todavía no hay una partida terminada.";
} else {
    puntuacion.textContent = Number(puntaje).toLocaleString("es-AR");
    const rondas = JSON.parse(sessionStorage.getItem("rondasFinales") || "[]");
    mostrarRondas(rondas);
}

document.getElementById("jugar-de-nuevo").addEventListener("click", function() {
    sessionStorage.removeItem("finTiempoJuego");
    sessionStorage.removeItem("puntajeFinal");
    sessionStorage.removeItem("rondasFinales");
    sessionStorage.removeItem("errorPuntaje");
});
