
const tiempoSi = document.getElementById("tiempo-si");
const tiempoNo = document.getElementById("tiempo-no");
const duracion = document.getElementById("futbol-duracion");
const barraTiempo = document.getElementById("futbol-barra-tiempo");
const minutos = document.getElementById("futbol-minutos");
const jugarFutbol = document.getElementById("futbol-jugar");

let conTiempo = false;

function elegirTiempo(valor) {
    conTiempo = valor;

    tiempoSi.classList.toggle("futbol-seleccionado", valor);
    tiempoNo.classList.toggle("futbol-seleccionado", !valor);

    tiempoSi.setAttribute("aria-pressed", String(valor));
    tiempoNo.setAttribute("aria-pressed", String(!valor));

    duracion.hidden = !valor;
}

tiempoSi.addEventListener("click", function() {
    elegirTiempo(true);
});

tiempoNo.addEventListener("click", function() {
    elegirTiempo(false);
});

barraTiempo.addEventListener("input", function() {
    minutos.textContent = barraTiempo.value + " MIN";
});

jugarFutbol.addEventListener("click", function() {
    sessionStorage.setItem("modoJuego", "Fútbol");
    sessionStorage.setItem("conTiempo", String(conTiempo));
    sessionStorage.setItem("minutosJuego", barraTiempo.value);
    sessionStorage.removeItem("finTiempoJuego");
});
