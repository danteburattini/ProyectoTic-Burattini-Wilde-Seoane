document.addEventListener("DOMContentLoaded", () => {
    const inputUsuario = document.querySelector("input[type='text']");
    const inputContraseña = document.querySelector("input[type='password']");
    const btnLogin = document.querySelector(".btn-yellow");

    if (btnLogin) {
        btnLogin.addEventListener("click", (event) => {
            const usuario = inputUsuario.value.trim();
            const contraseña = inputContraseña.value.trim();

            if (usuario === "" || contraseña === "") {
                event.preventDefault();
                alert("Por favor, completá toda la informacion necesaria antes de continuar.");
                return;
            }

            localStorage.setItem("usuarioLogueado", "true");
            localStorage.setItem("nombreUsuario", usuario);
        });
    }
});
