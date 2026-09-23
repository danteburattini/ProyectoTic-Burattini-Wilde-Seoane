document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogueado = false; 

    const btnCompetitivo = document.querySelector('.card-boxeo');
    const btnCasual = document.querySelector('.card-monumento');
    const btnFutbol = document.querySelector('.card-messi');

    if (btnCompetitivo) {
        btnCompetitivo.addEventListener('click', (event) => {
            if (!usuarioLogueado) {
                event.preventDefault();
                alert("¡Atención! Debés iniciar sesión con tu cuenta registrada para acceder al Modo Competitivo (Ranked).");
            }
        });
    }

    if (btnCasual) {
        btnCasual.addEventListener('click', () => {
            console.log("Accediendo a la configuración del Modo Casual...");
        });
    }

    if (btnFutbol) {
        btnFutbol.addEventListener('click', () => {
            console.log("Accediendo al Modo Especial: ¡Fútbol Argentino!");
        });
    }
});