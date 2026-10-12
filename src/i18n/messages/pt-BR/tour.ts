import type en from "../en/tour";

const messages: Record<keyof typeof en, string> = {
  "tour.next": "Próximo",
  "tour.back": "Voltar",
  "tour.skip": "Pular tour",
  "tour.done": "Abrir meu e-mail",
  "tour.progress": "{n} de {total}",
  "tour.replay": "Como jogar",
  "tour.welcome.title": "Bem-vindo ao notebook da Ada",
  "tour.welcome.body": "A Dra. Ada Voss está desaparecida e este é o notebook dela. Todo mundo na sua sala está vendo o mesmo notebook no próprio celular, e tudo o que um de vocês desbloqueia, todos recebem. Aqui vai um tour rápido.",
  "tour.room.title": "Sua sala",
  "tour.room.body": "Toque em Sala para ver quem está aqui, quem está on-line e o que cada pessoa está vendo. O código da sala fica no topo.",
  "tour.invite.title": "Convide sua equipe",
  "tour.invite.body": "Toque em Convidar para compartilhar um link ou peça para seus amigos escanearem o QR code abaixo da lista de jogadores. Dá para entrar com o Google ou só com um nome.",
  "tour.chat.title": "Chat",
  "tour.chat.body": "Converse com a sua equipe aqui. Quando alguém mandar uma mensagem, você verá um indicador vermelho em Sala.",
  "tour.hints.title": "Dicas e histórico",
  "tour.hints.body": "Travou? Peça uma dica para a Ada: ela é liberada para toda a sala e chega como uma mensagem de voz. Registro mostra o que a sala já encontrou, e Tentativas mostra cada resposta testada, para vocês não repetirem uns aos outros.",
  "tour.email.title": "E-mail: comece aqui",
  "tour.email.body": "A última mensagem da Ada e o e-mail da irmã dela estão esperando por você. Leia esses primeiro. As mensagens de voz com dicas da Ada também aparecem aqui.",
  "tour.browser.title": "O navegador",
  "tour.browser.body": "Uma pequena internet só dela. Digite endereços como meridian-inst.com. Toda página tem Ver código-fonte, as barras pretas podem ser tocadas para revelar o texto e as imagens têm Informações do arquivo.",
  "tour.notes.title": "Notas",
  "tour.notes.body": "Anote o que encontrar. As notas ficam privadas até você tocar em Compartilhar com a sala. Marque as partes importantes (um nome, um ano, um ID) para a equipe encontrá-las.",
  "tour.files.title": "Arquivos",
  "tour.files.body": "Os arquivos da Ada. Algumas pastas estão bloqueadas: os códigos estão escondidos na história. Uma delas desbloqueia o Decodificador, uma ferramenta de que você vai precisar para as cifras.",
  "tour.end.title": "Comece pelo começo",
  "tour.end.body": "É isso. As últimas palavras da Ada foram “Comece pelo começo”. Boa sorte, detetive. Você pode rever este tour em Sala quando quiser.",
};

export default messages;
