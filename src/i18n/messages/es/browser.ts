import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "Atrás",
  "browser.toolbar.forward": "Adelante",
  "browser.toolbar.address": "Dirección",
  "browser.toolbar.addressPlaceholder": "Escribe una dirección",
  "browser.toolbar.reload": "Recargar",
  "browser.toolbar.menu": "Marcadores y herramientas",
  "browser.toolbar.loading": "Cargando…",
  "browser.toolbar.bookmark": "Agregar marcador",
  "browser.toolbar.bookmarked": "Marcador agregado",
  "browser.toolbar.bookmarkRemoved": "Marcador eliminado",
  "browser.toolbar.viewSource": "Ver código fuente",
  "browser.menu.bookmarks": "Marcadores",
  "browser.menu.removeBookmark": "Eliminar el marcador {title}",
  "browser.menu.empty": "Aún no hay marcadores.",
  "browser.menu.bookmarkThisPage": "Agregar esta página a marcadores",
  "browser.loading.connecting": "Conectando con {address}…",
  "browser.error.title": "No se puede acceder a este sitio",
  "browser.error.unreachable": "No se encontró la dirección IP del servidor de <addr>{address}</addr>.",
  "browser.error.timeout": "<addr>{address}</addr> tardó demasiado en responder.",
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
  "browser.form.cooling": "Demasiados intentos. El sistema se está enfriando.",
  "browser.form.connectionError": "Error de conexión. Inténtalo de nuevo.",
  "browser.form.accepted": "Aceptado.",
  "browser.form.correct": "¡Correcto!",
  "browser.form.rejected": "Rechazado. No es eso.",
  "browser.form.retryIn": "Vuelve a intentarlo en {s} s.",
  "browser.form.previewFailed": "No se pudo generar la vista previa",
  "browser.form.decreaseShift": "Reducir desplazamiento",
  "browser.form.increaseShift": "Aumentar desplazamiento",
  "browser.form.shiftSolved": "✓ Anuncios descifrados para toda la sala.",
  "browser.form.previewLabel": "Vista previa · desplazamiento {n} (solo tú puedes verla)",
  "browser.form.binaryPassed": "✓ Aprobado. Abre el Decodificador y busca la pestaña Binario.",
};

export default messages;
