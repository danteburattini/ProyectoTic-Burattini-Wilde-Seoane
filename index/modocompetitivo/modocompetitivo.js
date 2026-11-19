const API = window.location.port === "3000" ? window.location.origin : "http://localhost:3000";
const tokenCompetitivo = sessionStorage.getItem("tokenSesion");
const jugarCompetitivo = document.querySelector(".boton-jugar-competitivo");

if (!tokenCompetitivo) {
    window.location.replace("../login/login.html?volver=competitivo");
} else {
    jugarCompetitivo.addEventListener("click", function() {
        sessionStorage.setItem("modoJuego", "Competitivo");
        sessionStorage.removeItem("finTiempoJuego");
        sessionStorage.removeItem("puntajeFinal");
        sessionStorage.removeItem("errorPuntaje");
    });
    cargarRanking();
}

async function cargarRanking() {
    const lista = document.querySelector(".lista-ranking");
    const estado = document.getElementById("estado-ranking");
    try {
        const respuesta = await fetch(API + "/api/ranking", {
            headers: { Authorization: "Bearer " + tokenCompetitivo }
        });
        if (!respuesta.ok) throw new Error("Ranking no disponible");
        const datos = await respuesta.json();
        lista.replaceChildren();

        const destacados = ["puesto-primero", "puesto-segundo", "puesto-tercero"];
        for (let indice = 0; indice < datos.top20.length && indice < 6; indice++) {
            const partida = datos.top20[indice];
            const fila = document.createElement("li");
            fila.className = "fila-ranking";
            const puesto = document.createElement("span");
            puesto.className = "puesto";
            puesto.setAttribute("aria-hidden", "true");
            if (destacados[indice]) puesto.classList.add(destacados[indice]);
            puesto.textContent = (indice + 1) + ".";
            const nombre = document.createElement("span");
            nombre.className = "nombre-ranking";
            nombre.textContent = partida.jugador + " · " + partida.puntaje_final.toLocaleString("es-AR");
            fila.append(puesto, nombre);
            lista.append(fila);
        }
        estado.textContent = datos.posicionJugador ? "Tu puesto: " + datos.posicionJugador :
            "Completá una partida para aparecer en el ranking.";
    } catch {
        estado.textContent = "No se pudo cargar el ranking.";
    }
}
