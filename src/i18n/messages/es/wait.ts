import type en from "../en/wait";

const messages: Record<keyof typeof en, string> = {
  "wait.tips.label": "Mientras esperas",
  "wait.tips.gathering": "¿Esperando a tu equipo? Comparte el código o el código QR de abajo.",

  "wait.ada.boot1": "Autodiagnóstico de arranque… ok",
  "wait.ada.boot2": "Montando /home/ada… ok",
  "wait.ada.boot3": "Restaurando la última sesión…",
  "wait.ada.tip1": "Todos ven la misma laptop. Divídanse: uno lee el correo mientras otro explora los archivos.",
  "wait.ada.tip2": "Lo que uno desbloquea se abre para toda la sala a la vez.",
  "wait.ada.tip3": "Lee con calma. Los nombres, las fechas y las frases raras suelen importar más adelante.",
  "wait.ada.tip4": "Las notas son privadas hasta que las compartes. Manda a la sala lo que valga la pena.",
  "wait.ada.tip5": "¿Atascados? Pídele una pista a Ada desde Sala. Llega como mensaje de voz para todos.",

  "wait.train.departures": "Salidas",
  "wait.train.platform": "Andén {n}",
  "wait.train.status": "Embarcando",
  "wait.train.tip1": "Que cada uno tome una pared y cuente lo que ve. Cada sala tiene cuatro.",
  "wait.train.tip2": "Lo que cualquiera recoge se comparte con todo el equipo.",
  "wait.train.tip3": "Prueben sus cosas entre sí. Dos objetos corrientes pueden formar algo útil.",
  "wait.train.tip4": "Tres códigos fallidos seguidos bloquean una cerradura un minuto, así que revisen antes lo que ya se probó.",
  "wait.train.tip5": "¿Atascados? Llamen a Teodor. Las notas del mozo de noche son cada vez más claras.",

  "wait.atlas.tip1": "No hace falta ir juntos. Repártanse y cuenten en el chat lo que encuentren.",
  "wait.atlas.tip2": "Todo lo que lees se copia en tu cuaderno, así puedes revisar una pista sin volver atrás.",
  "wait.atlas.tip3": "Lo que cualquiera encuentra se comparte con todo el equipo.",
  "wait.atlas.tip4": "Tres intentos fallidos seguidos bloquean una cerradura un minuto, así que revisen antes lo que ya se probó.",
  "wait.atlas.tip5": "¿Atascados? Las notas del Cartógrafo ayudan con el lugar donde estás.",
};

export default messages;
