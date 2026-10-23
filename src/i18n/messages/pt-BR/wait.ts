import type en from "../en/wait";

const messages: Record<keyof typeof en, string> = {
  "wait.tips.label": "Enquanto você espera",
  "wait.tips.gathering": "Esperando o seu time? Compartilhe o código ou o QR code abaixo.",

  "wait.ada.boot1": "Autoteste de inicialização… ok",
  "wait.ada.boot2": "Montando /home/ada… ok",
  "wait.ada.boot3": "Restaurando a última sessão…",
  "wait.ada.tip1": "Todo mundo vê o mesmo notebook. Dividam-se: um lê os e-mails enquanto outro explora os arquivos.",
  "wait.ada.tip2": "Tudo o que um de vocês desbloqueia abre para a sala inteira de uma vez.",
  "wait.ada.tip3": "Leia com calma. Nomes, datas e frases estranhas costumam importar mais tarde.",
  "wait.ada.tip4": "As notas são privadas até você compartilhar. Mande as boas descobertas para a sala.",
  "wait.ada.tip5": "Travou? Peça uma dica para a Ada em Sala. Ela chega como mensagem de voz para todos.",

  "wait.train.departures": "Partidas",
  "wait.train.platform": "Plataforma {n}",
  "wait.train.status": "Embarque",
  "wait.train.tip1": "Cada um pega uma parede e conta o que vê. Toda sala tem quatro.",
  "wait.train.tip2": "Tudo o que alguém pega é compartilhado com o time todo.",
  "wait.train.tip3": "Experimentem as coisas umas nas outras. Dois objetos comuns podem virar algo útil.",
  "wait.train.tip4": "Três códigos errados seguidos travam uma fechadura por um minuto, então vejam antes o que já foi tentado.",
  "wait.train.tip5": "Travou? Chame o Teodor. Os bilhetes do carregador noturno ficam mais claros a cada um.",

  "wait.atlas.tip1": "Vocês não precisam ficar juntos. Espalhem-se e contem no chat o que encontrarem.",
  "wait.atlas.tip2": "Tudo o que você lê é copiado no seu caderno, então dá para rever uma pista sem voltar.",
  "wait.atlas.tip3": "Tudo o que alguém encontra é compartilhado com o time todo.",
  "wait.atlas.tip4": "Três tentativas erradas seguidas travam uma fechadura por um minuto, então vejam antes o que já foi tentado.",
  "wait.atlas.tip5": "Travou? As notas do Cartógrafo ajudam no lugar onde você está.",
};

export default messages;
