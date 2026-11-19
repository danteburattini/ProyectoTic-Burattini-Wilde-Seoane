# Argentum Time Guesser | Guía para defender el frontend

**Si tenés poco tiempo**, leé primero «El recorrido de una partida», «Fetch, API y endpoints» y las preguntas del final. Después abrí los archivos y buscá los nombres de las funciones que aparecen en la guía.

## La idea del proyecto

Argentum Time Guesser muestra cinco fotos de Argentina. En cada ronda elegís un lugar en el mapa y un año. En Casual podés jugar sin cuenta, en Fútbol salen fotos de partidos y en Competitivo iniciás sesión y tu mejor puntaje aparece en el ranking. En Casual también podés compartir un enlace para que otra persona juegue con las mismas cinco fotos. Cada persona ve su propio resultado.

## Qué hace cada parte

| Parte | Qué hace en este proyecto |
| --- | --- |
| HTML | Define las pantallas, los botones, los enlaces, los formularios y el espacio para el mapa. |
| CSS | Aplica colores, tamaños y posiciones. El archivo principal es `estilos/argentumtimeguessr.css`. |
| JavaScript del frontend | Responde a los clics, actualiza la pantalla, guarda preferencias y hace pedidos al servidor. |
| Backend | Elige las fotos, valida la sesión y las respuestas, calcula los puntos y guarda las partidas competitivas. Corre en el puerto 3000. |

**HTML semántico** significa que la etiqueta describe para qué sirve esa parte de la pantalla. En el menú, `nav` agrupa los enlaces. En el juego, `figure` contiene la foto y `output` muestra el año elegido. En el login, `form` reúne los campos y `label` le da un nombre a cada uno. En el resultado, `details` permite abrir el desglose y `ol` enumera las rondas. Las clases conservan el diseño al aplicar el CSS. Un `div` sigue siendo apropiado para agrupar elementos solo por su posición, como el contenedor donde Leaflet dibuja el mapa.

En CSS, una **clase** como `.juego-fotografia` se puede reutilizar. Un **ID** como `#mapa-juego` apunta a un elemento concreto de esa página. **Flexbox** ordena elementos dentro de un contenedor. Las reglas **`@media`** ajustan el diseño a pantallas angostas. El JavaScript agrega o quita la clase `modo-claro` y el CSS aplica los colores correspondientes.

## El recorrido de una partida

1. En el menú elegís un modo. La pantalla de ese modo guarda la elección en `sessionStorage`. Casual y Fútbol también guardan si activaste el reloj y cuántos minutos elegiste.
2. `iniciarPartida()` desactiva **Continuar**, carga el contorno de Argentina y llama a `solicitarJuego("iniciar", ...)`. El servidor devuelve `partidaId` y una lista de fotos. Cada foto tiene un ID de ronda y su URL.
3. `mostrarRonda()` cambia la foto, actualiza el número de ronda y limpia la selección anterior. El navegador carga la foto cuando el código asigna la URL a `foto.src`.
4. Cuando hacés clic en el mapa, Leaflet devuelve latitud y longitud. El juego verifica que el punto esté dentro del contorno y, si es válido, pone un marcador. El deslizador y las flechas actualizan el año.
5. Al tocar **Continuar**, el juego pide una ubicación si todavía falta. Si ya hay una, `respuestaActual()` arma un objeto con los campos `id`, `latClick`, `lngClick` y `añoClick`. El programa lo agrega a la lista `respuestas`. Si quedan fotos, muestra la siguiente.
6. `terminarPartida()` manda el modo, el ID de partida y la lista de respuestas al backend. El backend devuelve el total y el detalle de cada ronda. El frontend guarda esos datos en `sessionStorage` y abre la pantalla final. Ahí se leen y se muestran, con enlaces al lugar y a la fuente de cada foto.

La variable `ronda` empieza en **0** porque las listas de JavaScript empiezan en esa posición. En pantalla se muestra `ronda + 1` para que la primera diga **1/5**. El indicador de puntos durante la partida queda en 0 porque el código actual pide el cálculo al terminar. El puntaje que importa aparece en la pantalla final.

### Mapa, reloj y puntaje

- **Leaflet** es la biblioteca que muestra el mapa, detecta clics y dibuja el marcador. **OpenStreetMap** aporta las imágenes del mapa que se cargan por partes al moverlo o hacer zoom. El **GeoJSON** que se pide desde GitHub contiene las coordenadas del borde argentino. El código comprueba si una ubicación cae dentro del borde contando cruces con una línea imaginaria. Si hay varios polígonos, acepta el punto cuando cae dentro de alguno.
- **Reloj.** El código calcula una hora de fin a partir de `Date.now()` y de los minutos elegidos. `setInterval` vuelve a calcular cuánto falta a partir de esa hora. Cuando llega a cero, el juego finaliza. Si marcaste un lugar en la ronda actual, toma esa respuesta. Las que quedan vacías valen cero. Con los efectos activados, se intenta reproducir la alarma. Competitivo no usa reloj.
- **Puntaje.** El servidor compara el año elegido con el año guardado y mide la distancia entre los dos puntos geográficos. Hay hasta 5.000 puntos por año y 5.000 por ubicación en cada ronda. El año correcto y una distancia de hasta 15 km dan los respectivos máximos. Cinco rondas perfectas suman 50.000 puntos.

## Fetch, API y endpoints

Una **API** es el conjunto de operaciones que el servidor ofrece al frontend. Un **endpoint** es una operación concreta. Se identifica por el método y la ruta, por ejemplo `POST /api/juego/iniciar`. La **URL completa** en tu compu es `http://localhost:3000/api/juego/iniciar`. `localhost` significa «esta computadora».

`fetch` es la función del navegador que manda el pedido HTTP. Este ejemplo es una versión corta del inicio de una partida Casual. En el proyecto, `solicitarJuego()` también agrega el token si hay una cuenta iniciada.

```js
const respuesta = await fetch("http://localhost:3000/api/juego/iniciar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo: "Casual" })
});

const datos = await respuesta.json();
if (!respuesta.ok) {
    throw new Error(datos.error);
}
```

| Línea | Qué significa |
| --- | --- |
| `fetch(url, opciones)` | Manda el pedido a esa URL. Las opciones indican cómo mandarlo. |
| `method: "POST"` | Pide que el servidor haga una acción. Acá crea una partida. Con `GET` normalmente se consultan datos. Si omitís el método en `fetch`, usa `GET`. |
| `headers` | Son datos adicionales sobre el pedido. `Content-Type` avisa que el cuerpo está escrito en JSON. |
| `body` | Es lo que le mandás al servidor. `JSON.stringify` convierte el objeto de JavaScript en texto JSON. |
| `await fetch(...)` | Espera la respuesta dentro de una función `async`. El navegador puede seguir atendiendo otras cosas durante la espera. |
| `await respuesta.json()` | Lee el cuerpo de la respuesta e interpreta el texto JSON. En el código se usa el objeto resultante para leer propiedades como `datos.fotos`. |
| `respuesta.ok` | Es verdadero si el servidor respondió con un código de éxito entre 200 y 299. Un rechazo como 401 puede llegar como respuesta normal de `fetch`. Por eso el código revisa `ok`. |
| `throw new Error(...)` | Salta al `catch` más cercano. Ahí se muestra un mensaje si falló la conexión o si se decidió tratar la respuesta como error. |

Una **promesa** representa un resultado que todavía puede estar pendiente. `fetch` y `respuesta.json()` devuelven promesas. `try` contiene el intento, `catch` maneja el error y `finally` se ejecuta al terminar el intento en los dos casos. Por ejemplo, en el login `finally` vuelve a habilitar el botón.

| Endpoint propio | Qué manda el frontend | Qué vuelve o qué hace |
| --- | --- | --- |
| `POST /api/registro` | Correo y contraseña en JSON. | Crea la cuenta. Después el usuario inicia sesión. |
| `POST /api/login` | Correo y contraseña en JSON. | Devuelve el usuario y un token si los datos son correctos. |
| `POST /api/logout` | El token en la cabecera `Authorization`. | Cierra esa sesión. |
| `GET /api/ranking` | El token en `Authorization`. | Devuelve la clasificación y el puesto personal. El frontend muestra hasta seis filas de los veinte resultados que recibe. |
| `POST /api/juego/iniciar` | Modo y, si entró desde un enlace compartido, el código de desafío. | Crea una partida y devuelve su ID y las cinco fotos. |
| `GET /api/juego/foto/:partidaId/:id` | Los identificadores incluidos en la URL que usa la etiqueta `img`. | Devuelve el archivo de imagen. |
| `POST /api/juego/finalizar` | Modo, ID de partida y respuestas en JSON. | Devuelve el puntaje y el desglose. En Competitivo también guarda el resultado. |
| `POST /api/desafios` | Un pedido para generar el enlace. | Sortea cinco fotos de Casual y devuelve el código para compartirlas. |

Un **token** es el código que entrega el servidor al iniciar sesión. El navegador lo guarda y lo envía como `Authorization: Bearer ...` en pedidos posteriores. El frontend usa su presencia para decidir qué pantalla mostrar. El backend valida si ese código sigue siendo válido. Si Competitivo recibe un **401**, el juego vuelve al login. Un **404** puede significar que el desafío venció o que ya no existe.

### Qué pasa con el enlace para amigos

1. **Enfrentarte a un amigo** hace un `POST /api/desafios`. El servidor guarda una selección ordenada de cinco fotos y devuelve un código.
2. `enlaceDeJuego()` usa `new URL` para construir la dirección de la pantalla de juego. `searchParams.set("desafio", codigo)` agrega `?desafio=...`. El botón de copiar usa el portapapeles del navegador. Si el navegador no permite copiar, selecciona el texto para copiarlo a mano.
3. Al abrirlo, `juego.js` lee el código con `URLSearchParams` y lo envía al iniciar. Ambos reciben las mismas fotos y cada pedido crea un `partidaId` distinto. Cada jugador termina con su resultado habitual.

El enlace vence después de 24 horas y el servidor lo conserva en memoria. Un reinicio lo invalida. Las personas tienen que acceder al mismo servidor. Un enlace con `localhost` sirve para probar en la misma compu.

## JavaScript básico que aparece en el código

| Concepto | Ejemplo y uso |
| --- | --- |
| `const` / `let` | `const botonContinuar` guarda la referencia al botón. `let ronda = 0` permite cambiar el número de ronda. Podés modificar el texto de un botón guardado en un `const`. La variable sigue apuntando al mismo botón. |
| Objeto | `{ modo: "Casual" }` tiene una propiedad llamada `modo`. `respuestaActual()` devuelve un objeto por cada ronda. |
| Lista o array | `fotos` y `respuestas` guardan varios elementos. `fotos[ronda]` busca uno y `respuestas.push(...)` agrega uno al final. |
| Función y parámetro | En `mostrarFoto(ruta)`, `ruta` es el dato que recibe la función. `return` devuelve un valor o termina la función. |
| Condición | `if (!ubicacion)` pregunta si falta el punto. `!` invierte una condición, `&&` exige las dos y `\|\|` acepta alguna de las dos. |
| Comparar y asignar | `=` guarda un valor en una variable. `===` compara valor y tipo. Por eso el reloj compara con el texto `"true"` que leyó del almacenamiento. |
| Operador ternario | `registro ? "/api/registro" : "/api/login"` elige una ruta según si está activado el registro. Se puede explicar como un `if/else` corto. |
| Bucles | `for...of` recorre los resultados para armar la lista final. Un `for` con índice arma las filas del ranking y se detiene al llegar a seis. `some()` devuelve verdadero si algún elemento cumple una condición. |
| DOM | Es la página representada como elementos que JavaScript puede leer o cambiar. `getElementById` busca por ID y `querySelector` usa un selector como `.lista-ranking`. |
| Cambiar la pantalla | `textContent` cambia texto, `value` lee o cambia un campo, `hidden` oculta un elemento y `disabled` desactiva un control. `classList` permite cambiar clases de CSS. |
| Eventos | `addEventListener("click", ...)` registra una acción para un clic, `input` reacciona al mover el deslizador y `submit` al enviar un formulario. `preventDefault()` evita su comportamiento habitual, por ejemplo que el formulario recargue la página. |
| Crear elementos | El ranking y el detalle crean `li` con `document.createElement()`, les ponen texto y los agregan con `append()`. El texto de usuario se pone con `textContent` para que el navegador lo trate como texto. |
| Convertir tipos | `Number(barraAnio.value)` transforma el texto del campo en un número. `String(conTiempo)` transforma el booleano en texto antes de guardarlo. |
| Moverse entre pantallas | `window.location.href = ...` abre otra página. `location.replace(...)` la abre reemplazando la entrada actual del historial. |

### Dónde se guardan las cosas

- **Variables de la pantalla**, como `ronda`, `ubicacion` y `respuestas`. Se vuelven a inicializar cuando recargás la página de juego.
- **`sessionStorage`**. Lo usa el navegador para mantener datos durante la sesión de la pestaña y pasarlos entre páginas del mismo origen. El proyecto guarda modo, reloj, token y resultado final. Guarda texto. Por eso la lista se escribe con `JSON.stringify()` y se recupera con `JSON.parse()`.
- **`localStorage`**. Las preferencias de música, efectos y tema siguen guardadas al volver a abrir el sitio en el mismo navegador. Son ajustes del jugador.
- **Backend**. El ranking se guarda del lado del servidor. El token guardado en el navegador y la sesión validada por el servidor son dos cosas: el navegador conserva el código y el servidor decide si todavía lo acepta.

## Qué mirar en cada archivo

| Archivo | Lo que podés explicar |
| --- | --- |
| [home.js](index/home/home.js) | Si tocás Competitivo sin token, abre el login y agrega `?volver=competitivo` para regresar al modo después. |
| [modocasual.js](index/modocasual/modocasual.js) | Selección del reloj, minutos, guardado de la configuración y enlace para amigos. |
| [modofutbol.js](index/modofutbol/modofutbol.js) | Guarda Fútbol como modo y la configuración del reloj. La pantalla de juego es la misma. |
| [modocompetitivo.js](index/modocompetitivo/modocompetitivo.js) | Pide sesión, llama al ranking y crea las filas con los resultados devueltos. |
| [login.js](index/login/login.js) | Alterna entre registro e ingreso, manda el formulario con `fetch`, captura errores, guarda el token y maneja el cierre. |
| [juego.js](index/juego/juego.js) | Maneja el mapa, la selección del año, la foto, las rondas, el reloj y los pedidos para iniciar y finalizar. |
| [pantallafinal.js](index/pantallafinal/pantallafinal.js) | Muestra el total y el desglose guardados. Al pulsar **Jugar de nuevo**, limpia el resultado y el reloj anterior. |
| [tutorial.js](index/tutorial/tutorial.js) | Cambia entre las instrucciones, habilita un mapa de práctica y vuelve al modo de origen. |
| [settings.js](index/settings/settings.js) y [tema.js](index/tema.js) | Guardan las opciones y aplican el tema visual. |
| [audio.js](index/audio.js) | Reproduce música y sonidos según los ajustes. Guarda el tiempo actual de la música para retomarla al cambiar de página. |

## Qué cambios se hicieron durante el trabajo

- Se conectaron los flujos de Casual, Fútbol y Competitivo con el servidor. Se corrigieron las rutas de los catálogos y el directorio de fotos del servidor.
- Se revisaron años y lugares, se retiraron entradas dudosas del catálogo jugable y se amplió el conjunto que usa el sorteo. Actualmente hay ocho fotos de Casual y nueve de Fútbol. Competitivo usa el catálogo de Casual.
- Se conectaron registro, inicio y cierre de sesión y ranking. El ranking que aparece en pantalla sale del servidor.
- Se agregó el desglose de la partida, con año correcto, distancia, puntos y enlaces. Se revisó el flujo de reloj, tutorial y ajustes.
- Se reorganizó el HTML de las ocho pantallas con elementos semánticos y se simplificaron partes del JavaScript. Se conservó la apariencia mediante las clases de CSS.
- Se agregó el enlace de Casual que comparte una selección de fotos. La versión final de esta función conserva el resultado individual de cada partida.

## Preguntas que te pueden hacer

**«¿Cuál es la diferencia entre API, endpoint y fetch?»**  
«La API es el conjunto de operaciones. Un endpoint es una de esas operaciones, como iniciar el juego. Fetch es la función que usa mi navegador para hacerle ese pedido.»

**«¿Por qué hay dos await?»**  
«Uno espera la respuesta del servidor y el otro espera a que se lea e interprete el cuerpo como JSON.»

**«¿Por qué usan POST para iniciar si quieren fotos?»**  
«Porque el servidor crea una partida y le asigna un ID. Después el navegador usa GET para cargar cada imagen.»

**«¿Por qué hay que mandar el ID de partida y el de la foto?»**  
«El ID de partida indica a qué partida pertenecen las respuestas. El ID de foto identifica la ronda. Con esos datos el backend puede verificar que las respuestas correspondan a las fotos que entregó.»

**«¿El navegador decide cuánto saqué?»**  
«El servidor calcula los puntos. El navegador junta mis elecciones, las manda y muestra el resultado que vuelve.»

**«¿Cómo hace el mapa para saber si marqué en Argentina?»**  
«Leaflet me da la latitud y longitud. El código usa un archivo con el contorno del país y comprueba de qué lado del borde quedó el punto.»

**«¿Dónde guardaste la contraseña?»**  
«El frontend la lee del formulario y la manda al servidor para que la valide. Después conserva el token en la sesión de la pestaña. El backend guarda un hash de la contraseña para las cuentas nuevas.»

**«¿Qué pasa si se cae el servidor?»**  
«El pedido falla y el frontend muestra un mensaje. La pantalla final deja el puntaje sin calcular si no recibió el resultado.»

**«¿Por qué puedo recibir otras fotos al volver a jugar?»**  
«En una partida normal el servidor vuelve a sortear cinco del catálogo. Si abro el mismo enlace de amigos, toma la selección que guardó al crear ese enlace.»

**«¿Cómo muestro que el frontend se comunica con el backend?»**  
«Abro F12, entro a la pestaña Red y empiezo una partida. Busco `iniciar` para mostrar el modo que envié y las cinco fotos que devolvió el servidor. Al terminar busco `finalizar` y muestro el puntaje.» Hacé esta práctica en Casual para que en la pantalla de la presentación no aparezcan credenciales ni tokens.
