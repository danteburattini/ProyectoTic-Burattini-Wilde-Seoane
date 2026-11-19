
const tiempoSi = document.getElementById("tiempo-si-casual");
const tiempoNo = document.getElementById("tiempo-no-casual");
const contenedorTiempo = document.getElementById("tiempo-casual");
const barraMinutos = document.getElementById("barra-minutos-casual");
const minutosTexto = document.getElementById("minutos-casual");
const jugarCasual = document.getElementById("jugar-casual");

let conTiempo = true;

function elegirTiempo(valor) {
    conTiempo = valor;

    tiempoSi.classList.toggle("seleccionado", valor);
    tiempoNo.classList.toggle("seleccionado", !valor);

    tiempoSi.setAttribute("aria-pressed", String(valor));
    tiempoNo.setAttribute("aria-pressed", String(!valor));

    contenedorTiempo.hidden = !valor;
}

tiempoSi.addEventListener("click", function() {
    elegirTiempo(true);
});

tiempoNo.addEventListener("click", function() {
    elegirTiempo(false);
});

barraMinutos.addEventListener("input", function() {
    minutosTexto.textContent = barraMinutos.value + " MIN";
});

jugarCasual.addEventListener("click", function() {
    sessionStorage.setItem("modoJuego", "Casual");
    sessionStorage.setItem("conTiempo", String(conTiempo));
    sessionStorage.setItem("minutosJuego", barraMinutos.value);

    sessionStorage.removeItem("finTiempoJuego");
    sessionStorage.removeItem("puntajeFinal");
    sessionStorage.removeItem("errorPuntaje");
});

const crearDesafio = document.getElementById("crear-desafio");
const invitacion = document.getElementById("invitacion-desafio");
const enlaceAmigo = document.getElementById("enlace-amigo");
const estadoDesafio = document.getElementById("estado-desafio");

function enlaceDeJuego(codigo) {
    const enlace = new URL("../juego/juego.html", window.location.href);
    enlace.searchParams.set("desafio", codigo);
    return enlace.href;
}

crearDesafio.addEventListener("click", async function() {
    crearDesafio.disabled = true;
    invitacion.hidden = true;
    estadoDesafio.textContent = "Creando desafío...";

    try {
        const servidor = "http://" + window.location.hostname + ":3000";
        const respuesta = await fetch(servidor + "/api/desafios", { method: "POST" });
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.error);

        enlaceAmigo.value = enlaceDeJuego(datos.enlace);
        document.getElementById("jugar-desafio").href = enlaceAmigo.value;
        document.getElementById("aviso-local").hidden =
            window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        invitacion.hidden = false;
        estadoDesafio.textContent = "";
    } catch (error) {
        estadoDesafio.textContent = "No se pudo crear el desafío. Revisá que el servidor esté abierto.";
    } finally {
        crearDesafio.disabled = false;
    }
});

document.getElementById("copiar-desafio").addEventListener("click", async function() {
    try {
        await navigator.clipboard.writeText(enlaceAmigo.value);
        estadoDesafio.textContent = "Enlace copiado.";
    } catch {
        enlaceAmigo.select();
        estadoDesafio.textContent = "Copiá el enlace seleccionado.";
    }
});
