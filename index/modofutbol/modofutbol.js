document.addEventListener("DOMContentLoaded", () => {
    const inputBusqueda = document.querySelector(".input-field");
    const btnJugar = document.querySelector(".btn-primary");

    if (btnJugar) {
        btnJugar.addEventListener("click", () => {
            if (inputBusqueda) {
                const filtro = inputBusqueda.value.trim();
                localStorage.setItem("filtroFutbol", filtro);
            }
        });
    }
});
