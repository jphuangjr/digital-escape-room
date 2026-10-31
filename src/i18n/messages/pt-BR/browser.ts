import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "Voltar",
  "browser.toolbar.forward": "Avançar",
  "browser.toolbar.address": "Endereço",
  "browser.toolbar.addressPlaceholder": "Digite um endereço",
  "browser.toolbar.reload": "Recarregar",
  "browser.toolbar.loading": "Carregando…",
  "browser.toolbar.viewSource": "Ver código-fonte",
  "browser.loading.connecting": "Conectando a {address}…",
  "browser.error.title": "Não é possível acessar este site",
  "browser.error.unreachable": "Não foi possível encontrar o endereço IP do servidor de <addr>{address}</addr>.",
  "browser.error.timeout": "<addr>{address}</addr> demorou demais para responder.",
  "browser.history.button": "Histórico{count, plural, =0 {} one {, # site novo} other {, # sites novos}}",
  "browser.history.title": "Histórico",
  "browser.history.shared": "Compartilhado com sua equipe. Todo site novo que alguém encontrar aparece aqui.",
  "browser.history.new": "Novo",
  "browser.history.foundBy": "{isMe, select, true {Você encontrou} other {{name} encontrou}} · {when}",
  "browser.history.start": "Comece aqui",
  "browser.newTab.title": "Nova guia",

  // View Source
  "browser.source.dialog": "Código-fonte da página",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ Informações do arquivo",
  "browser.fileInfo.title": "Informações do arquivo",
  "browser.fileInfo.close": "Fechar informações do arquivo",
  "browser.fileInfo.filename": "Nome do arquivo",
  "browser.fileInfo.author": "Autor",
  "browser.fileInfo.camera": "Câmera",
  "browser.fileInfo.date": "Data",
  "browser.fileInfo.dimensions": "Dimensões",
  "browser.fileInfo.comment": "Comentário",
  "browser.redacted.hidden": "Texto censurado. Toque para revelar.",
  "browser.redacted.revealed": "Revelado: {text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.connectionError": "Erro de conexão. Tente de novo.",
  "browser.form.accepted": "Aceito.",
  "browser.form.correct": "Correto!",
  "browser.form.rejected": "Recusado. Não é isso.",
  "browser.form.decreaseShift": "Diminuir deslocamento",
  "browser.form.increaseShift": "Aumentar deslocamento",
  "browser.form.shiftSolved": "✓ Anúncios decifrados para a sala toda.",
  "browser.form.lockNote": "Cuidado: uma chave errada bloqueia o sistema para todos por 1 minuto. Descubra primeiro.",
  "browser.form.binaryPassed": "✓ Aprovado. Abra o Decodificador e procure a guia Binário.",
};

export default messages;
