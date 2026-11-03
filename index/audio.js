
const rutaAudio = document.currentScript.src;

const sonidoClick = new Audio(new URL("../sonidos/click.wav", rutaAudio));
const musicaFondo = new Audio(new URL("../sonidos/musica.mp3", rutaAudio));

sonidoClick.volume = 0.35;
musicaFondo.volume = 0.08;
musicaFondo.loop = true;

musicaFondo.preload = "auto";

function guardarTiempoMusica() {
    if (musicaFondo.readyState > 0) {
        sessionStorage.setItem("tiempoMusica", musicaFondo.currentTime);
    }
}

function actualizarAudio() {
    if (localStorage.getItem("musica") === "false") {
        musicaFondo.pause();
    } else if (sessionStorage.getItem("musicaIniciada") === "true" && musicaFondo.paused) {
        musicaFondo.play().catch(function() {});
    }
}

musicaFondo.addEventListener("loadedmetadata", function() {
    const tiempo = Number(sessionStorage.getItem("tiempoMusica")) || 0;

    if (musicaFondo.duration > 0) {
        musicaFondo.currentTime = tiempo % musicaFondo.duration;
    }

    actualizarAudio();
});

musicaFondo.addEventListener("timeupdate", guardarTiempoMusica);

window.addEventListener("pagehide", guardarTiempoMusica);

function reproducirClick() {
    if (localStorage.getItem("sfx") === "false") {
        return false;
    }

    sonidoClick.pause();
    sonidoClick.currentTime = 0;
    sonidoClick.play().catch(function() {});

    return true;
}

document.addEventListener("click", function(evento) {
    sessionStorage.setItem("musicaIniciada", "true");
    actualizarAudio();

    const enlace = evento.target.closest("a");
    const boton = evento.target.closest("button");

    if (enlace && !evento.defaultPrevented && !evento.ctrlKey && !evento.metaKey && !evento.shiftKey && !evento.altKey && enlace.target !== "_blank" && enlace.origin === window.location.origin && enlace.hash !== window.location.hash) {
        if (localStorage.getItem("sfx") !== "false") {
            evento.preventDefault();
            reproducirClick();

            let navegando = false;

            function cambiarPagina() {
                if (!navegando) {
                    navegando = true;
                    guardarTiempoMusica();
                    window.location.href = enlace.href;
                }
            }

            sonidoClick.addEventListener("ended", cambiarPagina, { once: true });
            setTimeout(cambiarPagina, 500);
        }
    } else if (enlace || boton) {
        reproducirClick();
    }
});

document.addEventListener("change", function(evento) {
    if (evento.target.id === "musica") {
        actualizarAudio();
    }
});

actualizarAudio();
