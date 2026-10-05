// Colombia o IA: versión web del juego original en Java.
// Sin dependencias ni Node.js: se abre index.html directamente en el navegador.

const TOTAL_RONDAS = 10;

// Equivalente a Frase.java
class Frase {
  constructor(mensaje, clasificacion) {
    this.mensaje = mensaje;
    this.clasificacion = clasificacion;
  }

  getMensaje() {
    return this.mensaje;
  }

  getClasificacion() {
    return this.clasificacion;
  }
}

// Equivalente a SeleccionDeOpciones.java (banco de preguntas).
// Como en Java, getListaIa() y getListaCol() devuelven la misma lista.
class SeleccionDeOpciones {
  constructor() {
    this.listaDeFrases = [
      new Frase("La votacion para prohibir la chancleta en fiestas patronales", "ia"),
      new Frase("El articulado de TransMilenio atrapado en el parqueadero de un centro comercial", "ia"),
      new Frase("El festival de la empanada con embajadores invitados por error", "ia"),
      new Frase("El peaje comunitario que aceptaba plátano verde como tarifa", "ia"),
      new Frase("El loro citado como testigo que fue expulsado por desacato", "ia"),
      new Frase("Policía multa a quien compre (empanadas) en la calle", "col"),
      new Frase("Joven fingió embarazo de nueve bebés con una barriga hecha de trapos", "col"),
      new Frase("Antanas Mockus bajándose los pantalones en pleno Congreso", "col"),
      new Frase("El presidente llamo al creador de una novela para definir el rumbo de la protagonista", "col"),
      new Frase("Hipopótamos caminando por las calles de un pueblo en Antioquia", "col")
    ];
  }

  getListaIa() {
    return this.listaDeFrases;
  }

  getListaCol() {
    return this.listaDeFrases;
  }
}

// Equivalente a Main.java: lógica del juego sin tocar el DOM.
class Juego {
  constructor(banco, aleatorio = Math.random) {
    this.banco = banco;
    this.aleatorio = aleatorio;
    this.orden = [];
    this.reiniciar();
  }

  // Orden aleatorio de la partida (Fisher-Yates): cada frase sale una sola vez
  mezclar() {
    const copia = [...this.banco.getListaIa()];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(this.aleatorio() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    this.orden = copia;
  }

  reiniciar() {
    this.ronda = 0;
    this.aciertos = 0;
    this.mezclar();
  }

  // La ronda actual toma la siguiente frase del orden mezclado
  sortearFrase() {
    return this.orden[this.ronda];
  }

  haTerminado() {
    return this.ronda >= TOTAL_RONDAS;
  }

  // Equivalente a Main.comprobar: compara la respuesta exacta ("col" / "ia")
  // y devuelve el mensaje que Java imprimía.
  comprobar(respuesta, frase) {
    if (respuesta === frase.getClasificacion()) {
      this.aciertos++;
      return { acierto: true, mensaje: "Bravo es " + frase.getClasificacion() };
    }
    return {
      acierto: false,
      mensaje:
        "Soy un fracasado, dios este tipo si que es un fracasado era: " +
        frase.getClasificacion(),
    };
  }
}

// ---- Interfaz (solo se ejecuta en el navegador) ----

if (typeof document !== "undefined") {
  const elementos = {
    ronda: document.getElementById("ronda"),
    aciertos: document.getElementById("aciertos"),
    frase: document.getElementById("frase"),
    retroalimentacion: document.getElementById("retroalimentacion"),
    botones: document.querySelectorAll("[data-respuesta]"),
    reiniciar: document.getElementById("reiniciar"),
  };

  const juego = new Juego(new SeleccionDeOpciones());
  let fraseActual = null;

  function actualizarMarcador() {
    elementos.ronda.textContent = `Ronda ${Math.min(juego.ronda + 1, TOTAL_RONDAS)} de ${TOTAL_RONDAS}`;
    elementos.aciertos.textContent = `Aciertos: ${juego.aciertos}`;
  }

  function mostrarRonda() {
    fraseActual = juego.sortearFrase();
    elementos.frase.textContent = fraseActual.getMensaje();
    actualizarMarcador();
  }

  function terminar() {
    fraseActual = null;
    elementos.frase.textContent = "Fin del juego";
    elementos.botones.forEach((b) => (b.disabled = true));
    elementos.reiniciar.hidden = false;
    actualizarMarcador();
  }

  function responder(respuesta) {
    if (!fraseActual || juego.haTerminado()) return;

    const resultado = juego.comprobar(respuesta, fraseActual);
    juego.ronda++;
    elementos.retroalimentacion.textContent = resultado.mensaje;
    elementos.retroalimentacion.classList.remove("ok", "mal");
    elementos.retroalimentacion.classList.add(resultado.acierto ? "ok" : "mal");

    if (juego.haTerminado()) {
      terminar();
    } else {
      mostrarRonda();
    }
  }

  function reiniciar() {
    juego.reiniciar();
    elementos.retroalimentacion.textContent = "";
    elementos.retroalimentacion.classList.remove("ok", "mal");
    elementos.botones.forEach((b) => (b.disabled = false));
    elementos.reiniciar.hidden = true;
    mostrarRonda();
  }

  elementos.botones.forEach((boton) =>
    boton.addEventListener("click", () => responder(boton.dataset.respuesta))
  );
  elementos.reiniciar.addEventListener("click", reiniciar);

  mostrarRonda();
}
