
const tiempoSi = document.getElementById("tiempoSi");
const tiempoNo = document.getElementById("tiempoNo");
const duracion = document.getElementById("futbolDuracion");
const barraTiempo = document.getElementById("futbolBarraTiempo");
const minutos = document.getElementById("futbolMinutos");
const jugarFutbol = document.getElementById("futbolJugar");

let conTiempo = false;

function elegirTiempo(valor) {
    conTiempo = valor;

    tiempoSi.classList.toggle("opcionActiva", valor);
    tiempoNo.classList.toggle("opcionActiva", !valor);

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
