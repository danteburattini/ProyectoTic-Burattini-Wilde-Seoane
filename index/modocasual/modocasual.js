
const tiempoSi = document.getElementById("tiempoSi");
const tiempoNo = document.getElementById("tiempoNo");
const contenedorTiempo = document.getElementById("tiempoCasual");
const barraMinutos = document.getElementById("barraMinutos");
const minutosTexto = document.getElementById("minutosCasual");
const jugarCasual = document.getElementById("jugarCasual");

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

const crearDesafio = document.getElementById("crearDesafio");
const invitacion = document.getElementById("invitacionDesafio");
const enlaceAmigo = document.getElementById("enlaceAmigo");
const estadoDesafio = document.getElementById("estadoDesafio");

function enlaceDeJuego(codigo) {
    const enlace = new URL("../juego/juego.html", window.location.href);
    enlace.searchParams.set("desafio", codigo);
    return enlace.href;
}

crearDesafio.addEventListener("click", function() {
    crearDesafio.disabled = true;
    invitacion.hidden = true;
    estadoDesafio.textContent = "Creando desafío...";

    const servidor = "http://" + window.location.hostname + ":3000";
    return fetch(servidor + "/api/desafios", { method: "POST" }).then(async function(respuesta) {
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.error);

        enlaceAmigo.value = enlaceDeJuego(datos.enlace);
        document.getElementById("jugarDesafio").href = enlaceAmigo.value;
        document.getElementById("avisoLocal").hidden =
            window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        invitacion.hidden = false;
        estadoDesafio.textContent = "";
    }).then(undefined, function() {
        estadoDesafio.textContent = "No se pudo crear el desafío. Revisá que el servidor esté abierto.";
    }).finally(function() {
        crearDesafio.disabled = false;
    });
});

document.getElementById("copiarDesafio").addEventListener("click", function() {
    return Promise.resolve().then(function() {
        return navigator.clipboard.writeText(enlaceAmigo.value);
    }).then(function() {
        estadoDesafio.textContent = "Enlace copiado.";
    }, function() {
        enlaceAmigo.select();
        estadoDesafio.textContent = "Copiá el enlace seleccionado.";
    });
});
