import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "Voltar",
  "browser.toolbar.forward": "Avançar",
  "browser.toolbar.address": "Endereço",
  "browser.toolbar.addressPlaceholder": "Digite um endereço",
  "browser.toolbar.reload": "Recarregar",
  "browser.toolbar.menu": "Favoritos e ferramentas",
  "browser.toolbar.loading": "Carregando…",
  "browser.toolbar.bookmark": "Adicionar aos favoritos",
  "browser.toolbar.bookmarked": "Adicionado aos favoritos",
  "browser.toolbar.bookmarkRemoved": "Favorito removido",
  "browser.toolbar.viewSource": "Ver código-fonte",
  "browser.menu.bookmarks": "Favoritos",
  "browser.menu.removeBookmark": "Remover o favorito {title}",
  "browser.menu.empty": "Nenhum favorito ainda.",
  "browser.menu.bookmarkThisPage": "Adicionar esta página aos favoritos",
  "browser.loading.connecting": "Conectando a {address}…",
  "browser.error.title": "Não é possível acessar este site",
  "browser.error.unreachable": "Não foi possível encontrar o endereço IP do servidor de <addr>{address}</addr>.",
  "browser.error.timeout": "<addr>{address}</addr> demorou demais para responder.",
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
  "browser.form.cooling": "Tentativas demais. O sistema está esfriando.",
  "browser.form.connectionError": "Erro de conexão. Tente de novo.",
  "browser.form.accepted": "Aceito.",
  "browser.form.correct": "Correto!",
  "browser.form.rejected": "Recusado. Não é isso.",
  "browser.form.retryIn": "Tente de novo em {s} s.",
  "browser.form.decreaseShift": "Diminuir deslocamento",
  "browser.form.increaseShift": "Aumentar deslocamento",
  "browser.form.shiftSolved": "✓ Anúncios decifrados para a sala toda.",
  "browser.form.lockNote": "Cuidado: uma chave errada bloqueia o sistema para todos por 1 minuto. Descubra primeiro.",
  "browser.form.locked": "Bloqueado · {s} s",
  "browser.form.binaryPassed": "✓ Aprovado. Abra o Decodificador e procure a guia Binário.",
};

export default messages;
