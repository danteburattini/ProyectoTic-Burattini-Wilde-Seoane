
const API = "http://localhost:3000";
const foto = document.getElementById("imagen-juego");
const numeroRonda = document.getElementById("numero-ronda");
const puntos = document.getElementById("puntos-juego");
const botonContinuar = document.getElementById("continuar-juego");
const barraAnio = document.getElementById("barra-anio");
const anioElegido = document.getElementById("anio-elegido");
const reloj = document.getElementById("temporizador-juego");
const tiempoRestante = document.getElementById("tiempo-restante");

let modo = sessionStorage.getItem("modoJuego") || "Casual";

if (document.referrer.includes("/modocompetitivo/")) {
    modo = "Competitivo";
} else if (document.referrer.includes("/modofutbol/")) {
    modo = "Fútbol";
} else if (document.referrer.includes("/modocasual/")) {
    modo = "Casual";
}

sessionStorage.setItem("modoJuego", modo);

const mapa = L.map("mapa-juego", {
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
let ronda = 0;
let respuestas = [];
let finalizando = false;
let intervalo = null;

function puntoEnAnillo(punto, anillo) {
    let adentro = false;
    const x = punto.lng;
    const y = punto.lat;

    for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
        const xi = anillo[i][0];
        const yi = anillo[i][1];
        const xj = anillo[j][0];
        const yj = anillo[j][1];
        const cruza = (yi > y) !== (yj > y);

        if (cruza && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
            adentro = !adentro;
        }
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

document.getElementById("anio-anterior").addEventListener("click", function() {
    barraAnio.value = Math.max(Number(barraAnio.min), Number(barraAnio.value) - 1);
    anioElegido.textContent = barraAnio.value;
});

document.getElementById("anio-siguiente").addEventListener("click", function() {
    barraAnio.value = Math.min(Number(barraAnio.max), Number(barraAnio.value) + 1);
    anioElegido.textContent = barraAnio.value;
});

function mostrarFoto(ruta) {
    const rutas = [];

    if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
        rutas.push(ruta);
    } else {
        const limpia = ruta.replace(/^\/+/, "").replace(/^\.\//, "");

        if (limpia.startsWith("imagenes/")) {
            rutas.push("../../" + limpia);
        }

        rutas.push(new URL(limpia, API + "/").href);
        rutas.push("../../" + limpia);
    }

    let intento = 0;

    foto.onerror = function() {
        intento++;

        if (intento < rutas.length) {
            foto.src = rutas[intento];
        } else {
            foto.alt = "No se pudo cargar la fotografía";
        }
    };

    foto.src = rutas[0];
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

    for (let i = respuestas.length; i < fotos.length; i++) {
        respuestas.push({
            id: fotos[i].id,
            latClick: 0,
            lngClick: 0,
            añoClick: 0
        });
    }
}

function sonarAlarma() {
    if (localStorage.getItem("sfx") === "false") {
        return Promise.resolve();
    }

    const alarma = new Audio("../../sonidos/alarma-reloj.wav");
    alarma.volume = 0.4;

    return new Promise(function(resolver) {
        const limite = setTimeout(resolver, 3400);

        alarma.onended = function() {
            clearTimeout(limite);
            resolver();
        };

        alarma.onerror = resolver;
        alarma.play().catch(resolver);
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

    try {
        const jugador = sessionStorage.getItem("usuario") || "Invitado";

        const respuesta = await fetch(API + "/api/juego/finalizar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                modo,
                jugador,
                respuestas
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo guardar la partida");
        }

        sessionStorage.setItem("puntajeFinal", String(datos.puntaje_final));
        sessionStorage.removeItem("errorPuntaje");
    } catch (error) {
        sessionStorage.removeItem("puntajeFinal");
        sessionStorage.setItem(
            "errorPuntaje",
            "No se pudo calcular el puntaje. Revisá el backend."
        );
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

        tiempoRestante.textContent = minutosRestantes + ":" + segundosRestantes;

        if (segundos === 0) {
            terminarPartida(true);
        }
    }

    intervalo = setInterval(actualizarReloj, 300);
    actualizarReloj();
}

async function iniciarPartida() {
    botonContinuar.disabled = true;
    botonContinuar.textContent = "CARGANDO...";

    try {
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

        const respuesta = await fetch(API + "/api/juego/iniciar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                modo
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !Array.isArray(datos) || datos.length === 0) {
            throw new Error(datos.error || "El backend no devolvió fotos");
        }

        fotos = datos;
        respuestas = [];
        ronda = 0;

        mostrarRonda();

        botonContinuar.textContent = "CONTINUAR";
        botonContinuar.disabled = false;

        iniciarReloj();
    } catch (error) {
        botonContinuar.textContent = "ERROR AL CARGAR";
        alert(error.message + ". Revisá la conexión y el servidor.");
    }
}

iniciarPartida();
