import type en from "../en/tour";

const messages: Record<keyof typeof en, string> = {
  "tour.next": "Siguiente",
  "tour.back": "Atrás",
  "tour.skip": "Saltar recorrido",
  "tour.done": "Abrir mi correo",
  "tour.progress": "{n} de {total}",
  "tour.replay": "Cómo jugar",
  "tour.welcome.title": "Bienvenido a la laptop de Ada",
  "tour.welcome.body": "La Dra. Ada Voss desapareció y esta es su laptop. Todos en tu sala ven la misma laptop desde su propio teléfono, y lo que uno desbloquea, lo reciben todos. Aquí va un recorrido rápido.",
  "tour.room.title": "Tu sala",
  "tour.room.body": "Toca Sala para ver quién está, quién está en línea y qué está mirando cada persona. El código de sala está arriba.",
  "tour.invite.title": "Invita a tu equipo",
  "tour.invite.body": "Toca Invitar para compartir un enlace, o pide a tus amigos que escaneen el código QR debajo de la lista de jugadores. Pueden unirse con Google o solo con un nombre.",
  "tour.chat.title": "Chat",
  "tour.chat.body": "Habla con tu equipo aquí. Cuando alguien envíe un mensaje, verás un indicador rojo en Sala.",
  "tour.hints.title": "Pistas e historial",
  "tour.hints.body": "¿Atascado? Pídele una pista a Ada: se desbloquea para toda la sala y llega como un mensaje de voz. Registro muestra lo que la sala ha encontrado e Intentos muestra cada respuesta probada, para que no se repitan.",
  "tour.email.title": "Correo: empieza aquí",
  "tour.email.body": "Te esperan el último mensaje de Ada y el correo de su hermana. Léelos primero. Los mensajes de voz con pistas de Ada también llegan aquí.",
  "tour.browser.title": "El navegador",
  "tour.browser.body": "Un pequeño internet propio. Escribe direcciones como meridian-inst.com. Cada página tiene Ver código fuente, las barras negras se pueden tocar para revelar el texto y las imágenes tienen Información del archivo.",
  "tour.notes.title": "Notas",
  "tour.notes.body": "Anota lo que encuentres. Las notas son privadas hasta que toques Compartir con la sala. Etiqueta lo importante (un nombre, un año, un ID) para que el equipo lo encuentre.",
  "tour.files.title": "Archivos",
  "tour.files.body": "Los archivos de Ada. Algunas carpetas están bloqueadas: los códigos están escondidos en la historia. Una de ellas desbloquea el Decodificador, una herramienta que necesitarás para los cifrados.",
  "tour.end.title": "Empieza por el principio",
  "tour.end.body": "Eso es todo. Las últimas palabras de Ada fueron “Empieza por el principio”. Buena suerte, detective. Puedes volver a ver este recorrido desde Sala cuando quieras.",
};

export default messages;
