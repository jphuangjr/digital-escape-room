import type en from "../en/shell";

const messages: Record<keyof typeof en, string> = {
  "shell.app.browser": "Navegador",
  "shell.app.notes": "Notas",
  "shell.app.email": "Correo",
  "shell.app.files": "Archivos",
  "shell.app.decoder": "Decodificador",
  "shell.dock.label": "Dock",
  "shell.dock.appAria": "{app}{locked, select, true { (bloqueado)} other {}}{unread, plural, =0 {} one {, # sin leer} other {, # sin leer}}",
  "shell.dock.room": "Sala",
  "shell.dock.roomAria": "Sala: {online} en línea{unread, plural, =0 {} one {, # mensaje sin leer} other {, # mensajes sin leer}}",
  "shell.desktop.label": "Escritorio",
  "shell.window.close": "Cerrar ventana",
  "shell.home.title": "Inicio",
  "shell.status.homeAria": "Pantalla de inicio",
  "shell.status.laptop": "Laptop de Ada",
  "shell.status.phase": "{status, select, voting {Votación en curso} finished {Caso cerrado} other {Investigación abierta}}",
  "shell.status.roomAria": "Detalles de la sala, {online} en línea",
  "shell.status.unreadAria": "{count, plural, one {# mensaje sin leer} other {# mensajes sin leer}}",
  "shell.toast.decoderLocked": "El Decodificador está bloqueado. Sigue investigando los sitios.",
  "shell.toast.decoderUnlocked": "¡Decodificador desbloqueado! Búscalo en tu dock.",
  "shell.toast.open": "Abrir",
  "shell.toast.reply": "Responder",
  "shell.toast.newEmail": "{kind, select, voicemail {Nuevo mensaje de voz: {subject}} other {Nuevo correo: {subject}}}",
};

export default messages;
