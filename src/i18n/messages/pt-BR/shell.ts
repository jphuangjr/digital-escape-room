import type en from "../en/shell";

const messages: Record<keyof typeof en, string> = {
  "shell.app.browser": "Navegador",
  "shell.app.notes": "Notas",
  "shell.app.email": "E-mail",
  "shell.app.files": "Arquivos",
  "shell.app.decoder": "Decodificador",
  "shell.dock.label": "Dock",
  "shell.dock.appAria": "{app}{locked, select, true { (bloqueado)} other {}}{unread, plural, =0 {} one {, # não lido} other {, # não lidos}}",
  "shell.dock.room": "Sala",
  "shell.dock.roomAria": "Sala: {online} on-line{unread, plural, =0 {} one {, # mensagem não lida} other {, # mensagens não lidas}}",
  "shell.desktop.label": "Área de trabalho",
  "shell.window.close": "Fechar janela",
  "shell.home.title": "Início",
  "shell.status.homeAria": "Tela inicial",
  "shell.status.laptop": "Notebook da Ada",
  "shell.status.phase": "{status, select, voting {Votação em andamento} finished {Caso encerrado} other {Investigação aberta}}",
  "shell.status.roomAria": "Detalhes da sala, {online} on-line",
  "shell.status.unreadAria": "{count, plural, one {# mensagem não lida} other {# mensagens não lidas}}",
  "shell.toast.decoderLocked": "O Decodificador está bloqueado. Continue investigando os sites.",
  "shell.toast.decoderUnlocked": "Decodificador desbloqueado! Procure no seu dock.",
  "shell.toast.open": "Abrir",
  "shell.toast.reply": "Responder",
  "shell.toast.newEmail": "{kind, select, voicemail {Nova mensagem de voz: {subject}} other {Novo e-mail: {subject}}}",
};

export default messages;
