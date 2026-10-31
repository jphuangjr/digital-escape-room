import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "Atrás",
  "browser.toolbar.forward": "Adelante",
  "browser.toolbar.address": "Dirección",
  "browser.toolbar.addressPlaceholder": "Escribe una dirección",
  "browser.toolbar.reload": "Recargar",
  "browser.toolbar.loading": "Cargando…",
  "browser.toolbar.viewSource": "Ver código fuente",
  "browser.loading.connecting": "Conectando con {address}…",
  "browser.error.title": "No se puede acceder a este sitio",
  "browser.error.unreachable": "No se encontró la dirección IP del servidor de <addr>{address}</addr>.",
  "browser.error.timeout": "<addr>{address}</addr> tardó demasiado en responder.",
  "browser.history.button": "Historial{count, plural, =0 {} one {, # sitio nuevo} other {, # sitios nuevos}}",
  "browser.history.title": "Historial",
  "browser.history.shared": "Compartido con tu equipo. Cada sitio nuevo que alguien encuentre aparece aquí.",
  "browser.history.new": "Nuevo",
  "browser.history.foundBy": "{isMe, select, true {Lo encontraste tú} other {Lo encontró {name}}} · {when}",
  "browser.history.start": "Empieza aquí",
  "browser.newTab.title": "Nueva pestaña",

  // View Source
  "browser.source.dialog": "Código fuente de la página",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ Información del archivo",
  "browser.fileInfo.title": "Información del archivo",
  "browser.fileInfo.close": "Cerrar la información del archivo",
  "browser.fileInfo.filename": "Nombre del archivo",
  "browser.fileInfo.author": "Autor",
  "browser.fileInfo.camera": "Cámara",
  "browser.fileInfo.date": "Fecha",
  "browser.fileInfo.dimensions": "Dimensiones",
  "browser.fileInfo.comment": "Comentario",
  "browser.redacted.hidden": "Texto censurado. Toca para revelarlo.",
  "browser.redacted.revealed": "Revelado: {text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.connectionError": "Error de conexión. Inténtalo de nuevo.",
  "browser.form.accepted": "Aceptado.",
  "browser.form.correct": "¡Correcto!",
  "browser.form.rejected": "Rechazado. No es eso.",
  "browser.form.decreaseShift": "Reducir desplazamiento",
  "browser.form.increaseShift": "Aumentar desplazamiento",
  "browser.form.shiftSolved": "✓ Anuncios descifrados para toda la sala.",
  "browser.form.lockNote": "Cuidado: una clave incorrecta bloquea el sistema para todos durante 1 minuto. Resuélvelo primero.",
  "browser.form.binaryPassed": "✓ Aprobado. Abre el Decodificador y busca la pestaña Binario.",
};

export default messages;
