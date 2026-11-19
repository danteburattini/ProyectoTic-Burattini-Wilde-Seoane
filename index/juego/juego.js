
const API = "http://" + window.location.hostname + ":3000";
const foto = document.getElementById("imagenJuego");
const numeroRonda = document.getElementById("numeroRonda");
const puntos = document.getElementById("puntosJuego");
const botonContinuar = document.getElementById("continuarJuego");
const barraAnio = document.getElementById("barraAnio");
const anioElegido = document.getElementById("anioElegido");
const reloj = document.getElementById("temporizadorJuego");
const tiempoRestante = document.getElementById("tiempoRestante");

const desafio = new URLSearchParams(window.location.search).get("desafio");
const modo = desafio ? "Casual" : sessionStorage.getItem("modoJuego") || "Casual";
if (desafio) sessionStorage.setItem("modoJuego", "Casual");
const token = sessionStorage.getItem("tokenSesion");

function volverAlLogin() {
    sessionStorage.removeItem("tokenSesion");
    sessionStorage.removeItem("usuario");
    window.location.replace("../login/login.html?volver=competitivo");
}

async function solicitarJuego(accion, datos) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    const respuesta = await fetch(API + "/api/juego/" + accion, {
        method: "POST",
        headers,
        body: JSON.stringify(datos)
    });

    if (respuesta.status === 401 && modo === "Competitivo") {
        volverAlLogin();
        return;
    }

    const resultado = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error(resultado.error || "No se pudo procesar la partida");
    }

    return resultado;
}

const mapa = L.map("mapaJuego", {
    minZoom: 3,
    maxZoom: 17,
    maxBounds: [[-56, -76], [-20, -52]],
    maxBoundsViscosity: 1
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 17
}).addTo(mapa);

mapa.fitBounds([[-55, -74], [-21, -53]]);

let geometriaArgentina = null;
let marcador = null;
let ubicacion = null;
let fotos = [];
let partidaId;
let ronda = 0;
const respuestas = [];
let finalizando = false;
let intervalo = null;

// Cada anillo es una lista de coordenadas que dibuja un borde en el mapa.
function puntoEnAnillo(punto, anillo) {
    let adentro = false;
    const x = punto.lng;
    const y = punto.lat;

    let anterior = anillo[anillo.length - 1];
    for (const actual of anillo) {
        const cruzaAltura = (actual[1] > y) !== (anterior[1] > y);

        if (cruzaAltura) {
            const cruce = actual[0] + (anterior[0] - actual[0]) *
                (y - actual[1]) / (anterior[1] - actual[1]);
            if (x < cruce) {
                adentro = !adentro;
            }
        }

        anterior = actual;
    }

    return adentro;
}

function puntoEnPoligono(punto, anillos) {
    return puntoEnAnillo(punto, anillos[0]) &&
        !anillos.slice(1).some(anillo => puntoEnAnillo(punto, anillo));
}

function estaEnArgentina(punto) {
    if (!geometriaArgentina) {
        return false;
    }

    if (geometriaArgentina.type === "Polygon") {
        return puntoEnPoligono(punto, geometriaArgentina.coordinates);
    }

    return geometriaArgentina.coordinates.some(poligono => puntoEnPoligono(punto, poligono));
}

mapa.on("click", function(evento) {
    if (!geometriaArgentina) {
        alert("El límite de Argentina todavía no se cargó.");
        return;
    }

    if (!estaEnArgentina(evento.latlng)) {
        L.popup()
            .setLatLng(evento.latlng)
            .setContent("Solo podés elegir lugares de Argentina")
            .openOn(mapa);
        return;
    }

    ubicacion = evento.latlng;

    if (marcador) {
        mapa.removeLayer(marcador);
    }

    marcador = L.marker(ubicacion).addTo(mapa);
});

barraAnio.addEventListener("input", function() {
    anioElegido.textContent = barraAnio.value;
});

document.getElementById("anioAnterior").addEventListener("click", function() {
    barraAnio.value = Math.max(Number(barraAnio.min), Number(barraAnio.value) - 1);
    anioElegido.textContent = barraAnio.value;
});

document.getElementById("anioSiguiente").addEventListener("click", function() {
    barraAnio.value = Math.min(Number(barraAnio.max), Number(barraAnio.value) + 1);
    anioElegido.textContent = barraAnio.value;
});

function mostrarFoto(ruta) {
    foto.alt = "Fotografía de la ronda";
    foto.onerror = function() {
        foto.alt = "No se pudo cargar la fotografía";
    };
    foto.src = new URL(ruta, API + "/").href;
}

function mostrarRonda() {
    numeroRonda.textContent = (ronda + 1) + "/" + fotos.length;
    puntos.textContent = "0";
    mostrarFoto(fotos[ronda].direccionFoto);

    barraAnio.value = 2026;
    anioElegido.textContent = "2026";
    ubicacion = null;

    if (marcador) {
        mapa.removeLayer(marcador);
        marcador = null;
    }
}

function respuestaActual() {
    return {
        id: fotos[ronda].id,
        latClick: ubicacion.lat,
        lngClick: ubicacion.lng,
        añoClick: Number(barraAnio.value)
    };
}

botonContinuar.addEventListener("click", function() {
    if (finalizando || fotos.length === 0) {
        return;
    }

    if (!ubicacion) {
        alert("Marcá primero una ubicación de Argentina en el mapa.");
        return;
    }

    respuestas.push(respuestaActual());
    ronda++;

    if (ronda === fotos.length) {
        terminarPartida(false);
    } else {
        mostrarRonda();
    }
});

function guardarRespuestasPendientes() {
    if (ubicacion && ronda < fotos.length) {
        respuestas.push(respuestaActual());
    }
}

function sonarAlarma() {
    if (localStorage.getItem("sfx") === "false") {
        return Promise.resolve();
    }

    const alarma = new Audio("../../sonidos/alarma-reloj-nueva.wav");
    alarma.volume = 0.4;

    return new Promise(function(resolver) {
        const limite = setTimeout(resolver, 3400);

        alarma.onended = function() {
            clearTimeout(limite);
            resolver();
        };

        alarma.onerror = resolver;
        alarma.play().then(undefined, resolver);
    });
}

async function terminarPartida(porTiempo) {
    if (finalizando) {
        return;
    }

    finalizando = true;
    clearInterval(intervalo);
    botonContinuar.disabled = true;
    botonContinuar.textContent = "FINALIZANDO...";

    if (porTiempo) {
        guardarRespuestasPendientes();
    }

    const sonido = porTiempo ? sonarAlarma() : Promise.resolve();

    const irAlResultado = await solicitarJuego("finalizar", { modo, partidaId, respuestas }).then(function(datos) {
        if (!datos) {
            return false;
        }

        sessionStorage.setItem("puntajeFinal", String(datos.puntaje_final));
        sessionStorage.setItem("rondasFinales", JSON.stringify(datos.rondas));
        sessionStorage.removeItem("errorPuntaje");
        return true;
    }).then(undefined, function() {
        sessionStorage.removeItem("puntajeFinal");
        sessionStorage.removeItem("rondasFinales");
        sessionStorage.setItem(
            "errorPuntaje",
            "No se pudo calcular el puntaje. Revisá el backend."
        );
        return true;
    });

    if (!irAlResultado) {
        return;
    }

    await sonido;

    sessionStorage.removeItem("finTiempoJuego");
    window.location.href = "../pantallafinal/pantallafinal.html";
}

function iniciarReloj() {
    if (sessionStorage.getItem("conTiempo") !== "true" || modo === "Competitivo") {
        reloj.hidden = true;
        return;
    }

    const minutos = Math.max(
        1,
        Number(sessionStorage.getItem("minutosJuego")) || 9
    );

    let fin = Number(sessionStorage.getItem("finTiempoJuego"));

    if (!fin) {
        fin = Date.now() + minutos * 60000;
        sessionStorage.setItem("finTiempoJuego", String(fin));
    }

    function actualizarReloj() {
        const segundos = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
        const minutosRestantes = Math.floor(segundos / 60);
        const segundosRestantes = String(segundos % 60).padStart(2, "0");

        tiempoRestante.dateTime = "PT" + segundos + "S";
        tiempoRestante.textContent = minutosRestantes + ":" + segundosRestantes;

        if (segundos === 0) {
            terminarPartida(true);
        }
    }

    intervalo = setInterval(actualizarReloj, 300);
    actualizarReloj();
}

async function iniciarPartida() {
    const limite = await fetch(
        "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/ARG.geo.json"
    );

    if (!limite.ok) {
        throw new Error("No se pudo cargar el contorno de Argentina");
    }

    const pais = await limite.json();
    geometriaArgentina = pais.features[0].geometry;

    const borde = L.geoJSON(pais, {
        style: {
            color: "#fbb923",
            weight: 2,
            fillOpacity: 0.04
        },
        interactive: false
    }).addTo(mapa);

    mapa.fitBounds(borde.getBounds(), {
        padding: [10, 10]
    });

    const datos = await solicitarJuego("iniciar", { modo: modo, desafio: desafio });
    if (!datos) {
        return;
    }

    if (!datos.partidaId || !Array.isArray(datos.fotos) || datos.fotos.length === 0) {
        throw new Error("El backend no devolvió fotos");
    }

    partidaId = datos.partidaId;
    fotos = datos.fotos;

    mostrarRonda();

    botonContinuar.textContent = "CONTINUAR";
    botonContinuar.disabled = false;

    iniciarReloj();
}

if (modo === "Competitivo" && !token) {
    volverAlLogin();
} else {
    botonContinuar.disabled = true;
    botonContinuar.textContent = "CARGANDO...";
    iniciarPartida().then(undefined, function(error) {
        botonContinuar.textContent = "ERROR AL CARGAR";
        alert(error.message + ". Revisá la conexión y el servidor.");
    });
}
