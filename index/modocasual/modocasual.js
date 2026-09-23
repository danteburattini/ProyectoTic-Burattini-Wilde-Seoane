document.addEventListener("DOMContentLoaded", () => {
    const botonesToggle = document.querySelectorAll(".toggle-btn");
    const inputAmigo = document.querySelector(".input-field");
    const iconoCopiar = document.querySelector(".file-icon");
    const btnJugar = document.querySelector(".btn-primary");

    let limiteTiempo = true;

    botonesToggle.forEach(boton => {
        boton.addEventListener("click", () => {
            botonesToggle.forEach(b => b.classList.remove("active"));
            boton.classList.add("active");
            limiteTiempo = boton.textContent.trim() === "Sí";
        });
    });

    if (iconoCopiar && inputAmigo) {
        iconoCopiar.style.cursor = "pointer";
        iconoCopiar.addEventListener("click", () => {
            const enlaceDesafío = window.location.origin + "/htmls/modocasual.html?desafio=true";
            inputAmigo.value = enlaceDesafío;
            navigator.clipboard.writeText(enlaceDesafío);
            alert("¡Enlace de desafío copiado al portapapeles! Envíaselo a un amigo.");
        });
    }

    if (btnJugar) {
        btnJugar.addEventListener("click", () => {
            localStorage.setItem("config_limiteTiempo", limiteTiempo);
        });
    }
});
