import express from 'express';
import type { Express, Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import crypto from 'crypto'; 

const app: Express = express();
const PUERTO: number = Number(process.env.PORT ?? 3000);

app.use(express.json());


app.use(express.static('public'));

/** Ruta de control: responde 200 con el texto OK. */
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).type('text/plain').send('gol de maravilla');
});

// ==========================================
// [TODO] Registrar acá sus rutas de la API
// ==========================================


app.post('/api/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'El email y la contraseña son obligatorios.' });
    return;
  }

  if (!existsSync('./data/usuarios.json')) {
    res.status(500).json({ error: 'La base de datos de usuarios no existe.' });
    return;
  }

  const archivoData = readFileSync('./data/usuarios.json', 'utf-8');
  const usuarios = JSON.parse(archivoData);

  // Buscar al usuario en la base de datos
  const usuarioEncontrado = usuarios.find((u: any) => u.email === email);

  // CORRECCIÓN 1: Validamos PRIMERO que el usuario exista para evitar un crash de ejecución
  if (!usuarioEncontrado) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  // Ahora que sabemos que el usuario existe, podemos validar su contraseña sin peligro
  if (usuarioEncontrado.password !== password) {
    res.status(401).json({ error: 'Credenciales inválidas.' });
    return;
  }

  res.status(200).json({
    mensaje: 'Inicio de sesión exitoso',
    usuario: {
      id: usuarioEncontrado.id, // CORRECCIÓN 2: Ahora sí devolverá el ID generado en el registro
      email: usuarioEncontrado.email
    }
  });
});

app.post('/api/registro', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ error: 'El email es obligatorio para registrarse.' });
    return;
  }
  if (!password) {
    res.status(400).json({ error: 'La contraseña es obligatoria para registrarse.' });
    return;
  }

  let usuarios = [];
  if (existsSync('./data/usuarios.json')) {
    const archivoData = readFileSync('./data/usuarios.json', 'utf-8');
    usuarios = JSON.parse(archivoData);
  }

  const usuarioExiste = usuarios.find((u: any) => u.email === email);
  if (usuarioExiste) {
    res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    return;
  }

  // CORRECCIÓN 3: Agregamos un id único al guardar el usuario en el archivo JSON
  const nuevoUsuario = { 
    id: crypto.randomUUID(), 
    email, 
    password 
  };
  
  usuarios.push(nuevoUsuario);

  writeFileSync('./data/usuarios.json', JSON.stringify(usuarios, null, 2), 'utf-8');

  res.status(201).json({
    mensaje: 'Usuario registrado con éxito',
    usuario: { 
      id: nuevoUsuario.id,
      email: nuevoUsuario.email 
    }
  });
});

app.delete('/api/eliminar-cuenta', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'El email y la contraseña son obligatorios para eliminar la cuenta.' });
    return;
  }

  if (!existsSync('./data/usuarios.json')) {
    res.status(500).json({ error: 'La base de datos de usuarios no existe.' });
    return;
  }

  const archivoData = readFileSync('./data/usuarios.json', 'utf-8');
  let usuarios = JSON.parse(archivoData);

  const usuarioEncontrado = usuarios.find((u: any) => u.email === email);

  if (!usuarioEncontrado) {
    res.status(401).json({ error: 'Credenciales inválidas. No se pudo eliminar la cuenta.' });
    return;
  }
  if (usuarioEncontrado.password !== password) {
    res.status(401).json({ error: 'Credenciales inválidas. No se pudo eliminar la cuenta.' });
    return;
  }

  usuarios = usuarios.filter((u: any) => u.email !== email);
  writeFileSync('./data/usuarios.json', JSON.stringify(usuarios, null, 2), 'utf-8');

  res.status(200).json({ mensaje: 'Cuenta eliminada con éxito.' });
});

app.post('/api/logout', (req: Request, res: Response): void => {
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
});

app.use(express.static('publico'));

app.get('/api/juego/ronda-aleatoria', (req: Request, res: Response): void => {
  const modoSeleccionado = req.query.modo; 

  if (!existsSync('./data/rondas.json')) {
    res.status(500).json({ error: 'La base de datos de imágenes (rondas.json) no existe.' });
    return;
  }

  const archivoData = readFileSync('./data/rondas.json', 'utf-8');
  const todasLasRondas = JSON.parse(archivoData);

  const rondasFiltradas = modoSeleccionado 
    ? todasLasRondas.filter((r: any) => r.modo === modoSeleccionado)
    : todasLasRondas;

  if (rondasFiltradas.length === 0) {
    res.status(404).json({ error: 'No se encontraron imágenes cargadas para este modo.' });
    return;
  }

  const rondaAlAzar = rondasFiltradas[Math.floor(Math.random() * rondasFiltradas.length)];

  res.status(200).json({
    rondaId: rondaAlAzar.id,
    imagenLink: rondaAlAzar.imagenLink
  });
});

app.post('/api/juego/verificar', (req: Request, res: Response): void => {
  const { rondaId, anioElegido, latElegida, lngElegida } = req.body;

  if (!rondaId || anioElegido === undefined || latElegida === undefined || lngElegida === undefined) {
    res.status(400).json({ error: 'Faltan datos obligatorios para calcular el puntaje.' });
    return;
  }

  if (!existsSync('./data/rondas.json')) {
    res.status(500).json({ error: 'La base de datos de imágenes no existe.' });
    return;
  }

  const archivoData = readFileSync('./data/rondas.json', 'utf-8');
  const todasLasRondas = JSON.parse(archivoData);

  const rondaReal = todasLasRondas.find((r: any) => r.id === rondaId);

  if (!rondaReal) {
    res.status(404).json({ error: 'La ronda especificada no existe.' });
    return;
  }

  
  const diferenciaAnios = Math.abs(rondaReal.añoCorrecto - anioElegido);
  let puntosAnio = 5000 - (diferenciaAnios * 250); 
  if (puntosAnio < 0) puntosAnio = 0;

  
  const deg2rad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; 
  const dLat = deg2rad(rondaReal.coordenadas.lat - latElegida);
  const dLng = deg2rad(rondaReal.coordenadas.lng - lngElegida);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latElegida)) * Math.cos(deg2rad(rondaReal.coordenadas.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanciaKm = R * c;

  let puntosDistancia = 5000 - Math.round(distanciaKm * 5);
  if (puntosDistancia < 0) puntosDistancia = 0;

  const puntajeTotalRonda = puntosAnio + puntosDistancia;

  res.status(200).json({
    puntajeRonda: puntajeTotalRonda,
    puntosAnio,
    puntosDistancia,
    distanciaKm: Math.round(distanciaKm),
    respuestaCorrecta: {
      año: rondaReal.añoCorrecto,
      coordenadas: rondaReal.coordenadas,
      descripcion: rondaReal.descripcion || "Sin descripción disponible."
    }
  });
});

app.get('/api/ranking', (req: Request, res: Response): void => {
  const emailUsuario = req.query.email as string;

  if (!existsSync('./data/ranking.json')) {
    res.status(200).json({ top20: [], posicionUsuario: 0 });
    return;
  }

  const archivoData = readFileSync('./data/ranking.json', 'utf-8');
  const listaRanking = JSON.parse(archivoData);

  const top20 = listaRanking.slice(0, 20);

  let posicionUsuario = 0;
  if (emailUsuario) {
    const indice = listaRanking.findIndex((r: any) => r.email === emailUsuario);
    if (indice !== -1) {
      posicionUsuario = indice + 1; 
    }
  }

  res.status(200).json({
    top20,
    posicionUsuario
  });
});

/**
 * Guardar el puntaje final de una partida competitiva
 * Ejemplo: POST /api/ranking
 */
app.post('/api/ranking', (req: Request, res: Response): void => {
  const { email, puntajeTotal } = req.body;

  if (!email || puntajeTotal === undefined) {
    res.status(400).json({ error: 'El email y el puntajeTotal son obligatorios.' });
    return;
  }

  let listaRanking = [];
  if (existsSync('./data/ranking.json')) {
    const archivoData = readFileSync('./data/ranking.json', 'utf-8');
    listaRanking = JSON.parse(archivoData);
  }

  const usuarioIndex = listaRanking.findIndex((r: any) => r.email === email);

  if (usuarioIndex !== -1) {
  
    if (puntajeTotal > listaRanking[usuarioIndex].puntajeTotal) {
      listaRanking[usuarioIndex].puntajeTotal = puntajeTotal;
    }
  } else {
    
    listaRanking.push({
      email,
      puntajeTotal
    });
  }

  listaRanking.sort((a: any, b: any) => b.puntajeTotal - a.puntajeTotal);

  writeFileSync('./data/ranking.json', JSON.stringify(listaRanking, null, 2), 'utf-8');

  res.status(201).json({ mensaje: 'Puntaje competitivo guardado con éxito.' });
});


app.listen(PUERTO, (): void => {
  console.log(`Servidor abierto en http://localhost:${PUERTO}`);
});
