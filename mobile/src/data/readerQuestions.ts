import type { Question } from "../services/readerGame";

// Banco local de demostración. La pantalla recibe estas preguntas a través del tipo Question.
export const readerQuestions: readonly Question[] = [
  {
    id: "rayuela", category: "Autores", prompt: "¿Quién escribió Rayuela?",
    correct: "Julio Cortázar", distractors: ["Jorge Luis Borges", "Adolfo Bioy Casares", "Ernesto Sábato", "Manuel Puig", "Juan José Saer"],
    hint: "También escribió el cuento Casa tomada.",
    fact: "Rayuela propone más de un recorrido de lectura.",
  },
  {
    id: "maria-elena", category: "Autores", prompt: "¿Quién creó a Manuelita, la tortuga?",
    correct: "María Elena Walsh", distractors: ["Silvina Ocampo", "Elsa Bornemann", "Graciela Montes", "Laura Devetach", "Ema Wolf"],
    hint: "También escribió la Canción de tomar el té.",
    fact: "En la canción, Manuelita viaja desde Pehuajó hasta París.",
  },
  {
    id: "policial", category: "Géneros", prompt: "¿Qué género gira alrededor de la investigación de un delito?",
    correct: "Policial", distractors: ["Romance", "Fantasía", "Aventura", "Costumbrismo", "Realismo mágico"],
    hint: "Las pistas y los sospechosos ayudan a resolver el enigma.",
    fact: "En un relato de enigma, el lector puede seguir las pistas junto al detective.",
  },
  {
    id: "ciencia-ficcion", category: "Géneros", prompt: "¿Qué género suele imaginar cómo cambiaría la vida con nuevas tecnologías?",
    correct: "Ciencia ficción", distractors: ["Poesía lírica", "Biografía", "Crónica de viajes", "Novela histórica", "Ensayo autobiográfico"],
    hint: "Los robots y los viajes espaciales son motivos frecuentes.",
    fact: "El género también explora sociedades posibles y las consecuencias de sus decisiones.",
  },
  {
    id: "edicion", category: "Editoriales", prompt: "¿Qué tarea forma parte del trabajo de una editorial?",
    correct: "Preparar manuscritos para su publicación",
    distractors: ["Prestar libros a socios", "Organizar préstamos entre bibliotecas", "Asignar lugares a lectores en una sala", "Catalogar préstamos de una biblioteca", "Restaurar manuscritos para un museo"],
    hint: "Pensá en lo que pasa entre la entrega de un manuscrito y su llegada a las librerías.",
    fact: "Editar un libro puede incluir corrección, diseño de tapa y diagramación.",
  },
  {
    id: "sello", category: "Editoriales", prompt: "¿Qué identifica un sello editorial?",
    correct: "La marca bajo la que se publica un libro",
    distractors: ["El número de páginas", "La ubicación del libro en una biblioteca", "El año de nacimiento del autor", "El idioma original del texto", "El formato físico del ejemplar"],
    hint: "Podés encontrarlo en la tapa o en la página de créditos.",
    fact: "Una misma editorial puede publicar con varios sellos para distintos públicos.",
  },
  {
    id: "firma", category: "Feria", prompt: "¿En qué actividad podés pedirle a un autor que dedique tu ejemplar?",
    correct: "Firma de libros", distractors: ["Montaje de stands", "Lectura silenciosa", "Intercambio de fichas", "Taller de encuadernación", "Montaje de una muestra"],
    hint: "Conviene llevar un ejemplar y tener a mano el nombre de la persona a quien va dedicado.",
    fact: "Una dedicatoria puede incluir el nombre del lector y un mensaje del autor.",
  },
  {
    id: "stands", category: "Feria", prompt: "¿Cómo se llaman los espacios donde los expositores muestran su catálogo?",
    correct: "Stands", distractors: ["Auditorios", "Depósitos", "Camarines", "Pasillos", "Boleterías"],
    hint: "Suelen aparecer numerados en el mapa del predio.",
    fact: "En un stand se pueden descubrir colecciones y conversar con quienes las publican.",
  },
];
