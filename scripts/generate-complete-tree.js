#!/usr/bin/env node

/**
 * Script COMPLETO para generar topic-tree.json con TODAS las ramas
 * Basado en contentStructure.md - Todas las áreas A-T
 */

const fs = require('fs');
const path = require('path');

// Colores de BRANCH_COLORS
const BRANCH_COLORS = {
  1: '#6366F1',  2: '#3B82F6',  3: '#0EA5E9',  4: '#06B6D4',
  5: '#10B981',  6: '#14B8A6',  7: '#F59E0B',  8: '#EF4444',
  9: '#EC4899',  10: '#8B5CF6',  11: '#A855F7',
};

// Función para obtener color cíclico
function getColor(order) {
  const colors = Object.values(BRANCH_COLORS);
  return colors[(order - 1) % colors.length];
}

// Función helper para crear hoja
function createLeaf(id, title, titleFr, icon = "📄", minutes = 15) {
  return {
    id,
    title,
    titleFr,
    grammar: [],
    icon,
    estimatedMinutes: minutes
  };
}

// Función helper para crear rama
function createBranch(id, order, title, titleFr, icon, leaves) {
  return {
    id,
    order,
    title,
    titleFr,
    description: "",
    icon,
    color: getColor(order),
    leaves
  };
}

const branches = [];
let order = 1;

// Cargar ramas existentes de A-F desde el archivo actual
const existingTree = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../content/fr/A1/topic-tree.json'),
  'utf8'
));

// Agregar ramas existentes
existingTree.branches.forEach(branch => {
  branches.push(branch);
  order = Math.max(order, branch.order);
});
order++; // Continuar desde el siguiente

// ============================================
// ÁREA G — ADMINISTRACIÓN Y SERVICIOS
// ============================================
branches.push(createBranch("a1-G-1", order++, "Banco", "Banque", "🏦", [
  createLeaf("a1-G-1-1", "Abrir cuenta", "Ouvrir un compte", "💳", 18),
  createLeaf("a1-G-1-2", "Usar cajero", "Utiliser le distributeur", "🏧", 14),
  createLeaf("a1-G-1-3", "Problemas con tarjeta", "Problèmes de carte", "⚠️", 14),
  createLeaf("a1-G-1-4", "Transferencias", "Virements", "💸", 11),
]));

branches.push(createBranch("a1-G-2", order++, "Correos", "Poste", "📮", [
  createLeaf("a1-G-2-1", "Enviar paquete", "Envoyer un colis", "📦", 14),
  createLeaf("a1-G-2-2", "Recibir paquete", "Recevoir un colis", "📬", 11),
  createLeaf("a1-G-2-3", "Seguimiento", "Suivi", "📍", 11),
]));

branches.push(createBranch("a1-G-3", order++, "Ayuntamiento / Mairie", "Mairie", "🏛️", [
  createLeaf("a1-G-3-1", "Pedir cita", "Prendre rendez-vous", "📅", 14),
  createLeaf("a1-G-3-2", "Certificados", "Certificats", "📜", 14),
  createLeaf("a1-G-3-3", "Empadronamiento", "Inscription sur les listes électorales", "📋", 14),
]));

branches.push(createBranch("a1-G-4", order++, "Policía / Préfecture", "Police / Préfecture", "👮", [
  createLeaf("a1-G-4-1", "Denuncia de robo", "Déclaration de vol", "🚨", 18),
  createLeaf("a1-G-4-2", "Documentos perdidos", "Documents perdus", "📄", 14),
  createLeaf("a1-G-4-3", "Trámites de residencia", "Démarches de résidence", "🏠", 18),
]));

branches.push(createBranch("a1-G-5", order++, "Otros servicios", "Autres services", "⚙️", [
  createLeaf("a1-G-5-1", "Electricidad / Gas", "Électricité / Gaz", "💡", 14),
  createLeaf("a1-G-5-2", "Internet / Teléfono", "Internet / Téléphone", "📱", 14),
  createLeaf("a1-G-5-3", "Seguros básicos", "Assurances de base", "🛡️", 11),
]));

// ============================================
// ÁREA H — SITUACIONES INCÓMODAS
// ============================================
branches.push(createBranch("a1-H-1", order++, "Comercios", "Commerces", "🏪", [
  createLeaf("a1-H-1-1", "Producto defectuoso", "Produit défectueux", "❌", 14),
  createLeaf("a1-H-1-2", "Devoluciones", "Retours", "↩️", 14),
  createLeaf("a1-H-1-3", "Dependiente estricto", "Vendeur strict", "😐", 14),
  createLeaf("a1-H-1-4", "Precio incorrecto", "Prix incorrect", "💰", 11),
]));

branches.push(createBranch("a1-H-2", order++, "Transporte", "Transport", "🚌", [
  createLeaf("a1-H-2-1", "Asiento ocupado", "Siège occupé", "💺", 11),
  createLeaf("a1-H-2-2", "Persona molesta", "Personne gênante", "😤", 14),
  createLeaf("a1-H-2-3", "Conflictos leves", "Conflits mineurs", "⚔️", 14),
]));

branches.push(createBranch("a1-H-3", order++, "Restaurantes", "Restaurants", "🍴", [
  createLeaf("a1-H-3-1", "Pedido incorrecto", "Commande incorrecte", "❌", 14),
  createLeaf("a1-H-3-2", "Espera larga", "Attente longue", "⏳", 11),
  createLeaf("a1-H-3-3", "Cuenta errónea", "Addition erronée", "🧾", 11),
]));

branches.push(createBranch("a1-H-4", order++, "Servicios", "Services", "🔧", [
  createLeaf("a1-H-4-1", "Cita cancelada", "Rendez-vous annulé", "❌", 11),
  createLeaf("a1-H-4-2", "Servicio deficiente", "Service déficient", "😕", 14),
  createLeaf("a1-H-4-3", "Pedir compensación", "Demander compensation", "💼", 14),
]));

// ============================================
// ÁREA I — COMUNICACIÓN DIGITAL
// ============================================
branches.push(createBranch("a1-I-1", order++, "Mensajería", "Messagerie", "💬", [
  createLeaf("a1-I-1-1", "WhatsApp básico", "WhatsApp de base", "📱", 14),
  createLeaf("a1-I-1-2", "Confirmar planes", "Confirmer les plans", "✅", 11),
  createLeaf("a1-I-1-3", "Mensajes ambiguos", "Messages ambigus", "🤔", 14),
  createLeaf("a1-I-1-4", "Emojis y tono", "Emojis et ton", "😊", 11),
]));

branches.push(createBranch("a1-I-2", order++, "Redes sociales", "Réseaux sociaux", "📱", [
  createLeaf("a1-I-2-1", "Grupos locales", "Groupes locaux", "👥", 11),
  createLeaf("a1-I-2-2", "Pedir ayuda online", "Demander de l'aide en ligne", "🆘", 11),
  createLeaf("a1-I-2-3", "Responder comentarios", "Répondre aux commentaires", "💬", 11),
]));

branches.push(createBranch("a1-I-3", order++, "Email personal", "Email personnel", "📧", [
  createLeaf("a1-I-3-1", "Email formal básico", "Email formel de base", "📝", 14),
  createLeaf("a1-I-3-2", "Email informal", "Email informel", "💌", 11),
  createLeaf("a1-I-3-3", "Responder y reenviar", "Répondre et transférer", "↩️", 11),
]));

// ============================================
// ÁREA J — CULTURA Y NO VERBAL
// ============================================
branches.push(createBranch("a1-J-1", order++, "Saludos físicos", "Salutations physiques", "👋", [
  createLeaf("a1-J-1-1", "La bise", "La bise", "💋", 14),
  createLeaf("a1-J-1-2", "Cuándo sí / cuándo no", "Quand oui / quand non", "🤷", 14),
  createLeaf("a1-J-1-3", "Alternativas (COVID era)", "Alternatives (ère COVID)", "🤝", 11),
]));

branches.push(createBranch("a1-J-2", order++, "Espacio personal", "Espace personnel", "🚶", [
  createLeaf("a1-J-2-1", "Distancias culturales", "Distances culturelles", "📏", 11),
  createLeaf("a1-J-2-2", "Contacto visual", "Contact visuel", "👀", 11),
  createLeaf("a1-J-2-3", "Señales de cierre", "Signaux de fermeture", "🚪", 11),
]));

branches.push(createBranch("a1-J-3", order++, "Etiqueta social", "Étiquette sociale", "🎩", [
  createLeaf("a1-J-3-1", "Tu vs Vous", "Tu vs Vous", "👤", 18),
  createLeaf("a1-J-3-2", "Formalidad en contexto", "Formalité en contexte", "🎭", 14),
  createLeaf("a1-J-3-3", "Tabúes conversacionales", "Tabous conversationnels", "🚫", 14),
]));

branches.push(createBranch("a1-J-4", order++, "Humor francés", "Humour français", "😄", [
  createLeaf("a1-J-4-1", "Ironía básica", "Ironie de base", "😏", 11),
  createLeaf("a1-J-4-2", "Responder a bromas", "Répondre aux blagues", "😊", 11),
  createLeaf("a1-J-4-3", "Sarcasmo suave", "Sarcasme doux", "😉", 11),
]));

// ============================================
// ÁREA K — RECUPERACIÓN Y SUPERVIVENCIA
// ============================================
branches.push(createBranch("a1-K-1", order++, "Bloqueo lingüístico", "Blocage linguistique", "😰", [
  createLeaf("a1-K-1-1", "Pedir repetición", "Demander répétition", "🔄", 14),
  createLeaf("a1-K-1-2", "Pedir más lento", "Demander plus lentement", "🐌", 11),
  createLeaf("a1-K-1-3", "Ganar tiempo", "Gagner du temps", "⏰", 14),
  createLeaf("a1-K-1-4", "Admitir nivel bajo", "Admettre niveau bas", "🙏", 11),
  createLeaf("a1-K-1-5", "Pedir otra palabra", "Demander un autre mot", "📝", 11),
]));

branches.push(createBranch("a1-K-2", order++, "Error social", "Erreur sociale", "😅", [
  createLeaf("a1-K-2-1", "Reparar malentendido", "Réparer malentendu", "🔧", 14),
  createLeaf("a1-K-2-2", "Disculparse por error", "S'excuser pour erreur", "🙏", 14),
  createLeaf("a1-K-2-3", "Reencauzar conversación", "Réorienter conversation", "🔄", 11),
]));

branches.push(createBranch("a1-K-3", order++, "Estrategias para bloqueos", "Stratégies pour blocages", "🧠", [
  createLeaf("a1-K-3-1", "Ganar tiempo para pensar", "Gagner du temps pour réfléchir", "💭", 14),
  createLeaf("a1-K-3-2", "Pedir ayuda educadamente", "Demander aide poliment", "🙏", 14),
]));

branches.push(createBranch("a1-K-4", order++, "Salir de conversaciones incómodas", "Sortir conversations gênantes", "🚪", [
  createLeaf("a1-K-4-1", "Señales de cierre", "Signaux de fermeture", "👋", 14),
  createLeaf("a1-K-4-2", "Cambiar de tema", "Changer de sujet", "🔄", 14),
]));

branches.push(createBranch("a1-K-5", order++, "Estrategias de comunicación", "Stratégies de communication", "💡", [
  createLeaf("a1-K-5-1", "Parafrasear", "Paraphraser", "📝", 14),
  createLeaf("a1-K-5-2", "Usar gestos", "Utiliser gestes", "👋", 11),
  createLeaf("a1-K-5-3", "Dibujar / mostrar", "Dessiner / montrer", "✏️", 11),
]));

// ============================================
// ÁREA L — AMBIGÜEDAD Y ENTRE LÍNEAS
// ============================================
branches.push(createBranch("a1-L-1", order++, "Respuestas vagas", "Réponses vagues", "🤷", [
  createLeaf("a1-L-1-1", "\"On verra\"", "\"On verra\"", "👀", 11),
  createLeaf("a1-L-1-2", "\"Peut-être\"", "\"Peut-être\"", "🤔", 11),
  createLeaf("a1-L-1-3", "\"C'est pas mal\"", "\"C'est pas mal\"", "😐", 11),
  createLeaf("a1-L-1-4", "Interpretar el \"non\" suave", "Interpréter le \"non\" doux", "🤐", 14),
]));

branches.push(createBranch("a1-L-2", order++, "Silencios y pausas", "Silences et pauses", "🤐", [
  createLeaf("a1-L-2-1", "Cuándo hablar", "Quand parler", "💬", 11),
  createLeaf("a1-L-2-2", "Cuándo callar", "Quand se taire", "🤫", 11),
  createLeaf("a1-L-2-3", "Cerrar conversación", "Fermer conversation", "🚪", 14),
]));

branches.push(createBranch("a1-L-3", order++, "Lectura de emociones", "Lecture des émotions", "😊", [
  createLeaf("a1-L-3-1", "Detectar enojo/disconformidad", "Détecter colère/mécontentement", "😠", 14),
  createLeaf("a1-L-3-2", "Responder a elogios", "Répondre aux compliments", "😊", 14),
]));

// ============================================
// ÁREA M — IDENTIDAD PERSONAL
// ============================================
branches.push(createBranch("a1-M-1", order++, "Historia personal", "Histoire personnelle", "📖", [
  createLeaf("a1-M-1-1", "De dónde vienes", "D'où tu viens", "🌍", 14),
  createLeaf("a1-M-1-2", "Por qué estás aquí", "Pourquoi tu es ici", "❓", 14),
  createLeaf("a1-M-1-3", "Qué haces ahora", "Ce que tu fais maintenant", "💼", 14),
  createLeaf("a1-M-1-4", "Planes futuros", "Plans futurs", "🔮", 14),
]));

branches.push(createBranch("a1-M-2", order++, "Gustos y preferencias", "Goûts et préférences", "❤️", [
  createLeaf("a1-M-2-1", "Comida favorita", "Nourriture favorite", "🍕", 11),
  createLeaf("a1-M-2-2", "Música y cine", "Musique et cinéma", "🎬", 11),
  createLeaf("a1-M-2-3", "Deportes y hobbies", "Sports et loisirs", "⚽", 14),
  createLeaf("a1-M-2-4", "Viajes", "Voyages", "✈️", 11),
]));

branches.push(createBranch("a1-M-3", order++, "Historias personales breves", "Histoires personnelles courtes", "📝", [
  createLeaf("a1-M-3-1", "Responder a \"¿Por qué Francia?\"", "Répondre à \"Pourquoi la France?\"", "🇫🇷", 14),
  createLeaf("a1-M-3-2", "Hablar de familia", "Parler de la famille", "👨‍👩‍👧", 14),
]));

branches.push(createBranch("a1-M-4", order++, "Opiniones simples", "Opinions simples", "💭", [
  createLeaf("a1-M-4-1", "Me gusta / no me gusta", "J'aime / je n'aime pas", "👍👎", 11),
  createLeaf("a1-M-4-2", "Prefiero X a Y", "Je préfère X à Y", "⚖️", 11),
  createLeaf("a1-M-4-3", "Opinar sin ofender", "Donner opinion sans offenser", "💬", 14),
]));

// ============================================
// ÁREA N — SEGURIDAD PERSONAL
// ============================================
branches.push(createBranch("a1-N-1", order++, "Personas invasivas", "Personnes envahissantes", "🚫", [
  createLeaf("a1-N-1-1", "Decir no firmemente", "Dire non fermement", "✋", 14),
  createLeaf("a1-N-1-2", "Salir de situación", "Sortir de situation", "🏃", 14),
  createLeaf("a1-N-1-3", "Pedir ayuda", "Demander de l'aide", "🆘", 14),
]));

branches.push(createBranch("a1-N-2", order++, "Situaciones de emergencia", "Situations d'urgence", "🚨", [
  createLeaf("a1-N-2-1", "Perder documentos", "Perdre documents", "📄", 14),
  createLeaf("a1-N-2-2", "Pedir ayuda a policía", "Demander aide à police", "👮", 14),
]));

branches.push(createBranch("a1-N-3", order++, "Estafas y engaños", "Arnaques et tromperies", "⚠️", [
  createLeaf("a1-N-3-1", "Reconocer estafa", "Reconnaître arnaque", "👁️", 11),
  createLeaf("a1-N-3-2", "Rechazar vendedores", "Refuser vendeurs", "✋", 11),
  createLeaf("a1-N-3-3", "Denunciar", "Dénoncer", "📞", 14),
]));

// ============================================
// ÁREA O — CLIMA Y ESTACIONES
// ============================================
branches.push(createBranch("a1-O-1", order++, "Preparación diaria", "Préparation quotidienne", "☀️", [
  createLeaf("a1-O-1-1", "Consultar el tiempo", "Consulter météo", "🌤️", 14),
  createLeaf("a1-O-1-2", "Actividades según clima", "Activités selon météo", "🌧️", 14),
]));

branches.push(createBranch("a1-O-2", order++, "Emergencias climáticas", "Urgences climatiques", "⛈️", [
  createLeaf("a1-O-2-1", "Alertas meteorológicas", "Alertes météorologiques", "⚠️", 14),
  createLeaf("a1-O-2-2", "Transporte en tormenta", "Transport en tempête", "🌧️", 14),
]));

branches.push(createBranch("a1-O-3", order++, "Hablar del tiempo", "Parler du temps", "🌤️", [
  createLeaf("a1-O-3-1", "Describir el clima", "Décrire météo", "☀️", 14),
  createLeaf("a1-O-3-2", "Previsión", "Prévision", "📊", 11),
  createLeaf("a1-O-3-3", "Comentarios típicos", "Commentaires typiques", "💬", 11),
]));

branches.push(createBranch("a1-O-4", order++, "Estaciones y festividades", "Saisons et fêtes", "🎄", [
  createLeaf("a1-O-4-1", "Las 4 estaciones", "Les 4 saisons", "🍂", 11),
  createLeaf("a1-O-4-2", "Fiestas francesas", "Fêtes françaises", "🎉", 14),
  createLeaf("a1-O-4-3", "Vacaciones", "Vacances", "🏖️", 11),
]));

// ============================================
// ÁREA P — CULTURA Y OCIO
// ============================================
branches.push(createBranch("a1-P-1", order++, "Museos y exposiciones", "Musées et expositions", "🎨", [
  createLeaf("a1-P-1-1", "Comprar entradas", "Acheter billets", "🎫", 14),
  createLeaf("a1-P-1-2", "Preguntar por obras", "Demander œuvres", "🖼️", 14),
]));

branches.push(createBranch("a1-P-2", order++, "Cine y espectáculos", "Cinéma et spectacles", "🎬", [
  createLeaf("a1-P-2-1", "Reservar butacas", "Réserver places", "🎭", 14),
  createLeaf("a1-P-2-2", "Problemas técnicos durante función", "Problèmes techniques pendant spectacle", "🔧", 14),
]));

// ============================================
// ÁREA Q — TRABAJO AVANZADO
// ============================================
branches.push(createBranch("a1-Q-1", order++, "Reuniones de equipo", "Réunions d'équipe", "👥", [
  createLeaf("a1-Q-1-1", "Pedir la palabra", "Demander la parole", "✋", 14),
  createLeaf("a1-Q-1-2", "Desacuerdos profesionales", "Désaccords professionnels", "💼", 14),
]));

branches.push(createBranch("a1-Q-2", order++, "Comunicación con clientes", "Communication avec clients", "🤝", [
  createLeaf("a1-Q-2-1", "Quejas de clientes", "Plaintes clients", "😤", 14),
  createLeaf("a1-Q-2-2", "Seguimiento post-venta", "Suivi post-vente", "📞", 14),
]));

// ============================================
// ÁREA R — COMUNICACIÓN DIGITAL PROFUNDA
// ============================================
branches.push(createBranch("a1-R-1", order++, "Videollamadas profesionales", "Visioconférences professionnelles", "💻", [
  createLeaf("a1-R-1-1", "Problemas técnicos", "Problèmes techniques", "🔧", 14),
  createLeaf("a1-R-1-2", "Intervenciones en grupo", "Interventions en groupe", "👥", 14),
]));

branches.push(createBranch("a1-R-2", order++, "Redes sociales comunitarias", "Réseaux sociaux communautaires", "🌐", [
  createLeaf("a1-R-2-1", "Pedir ayuda en grupos locales", "Demander aide groupes locaux", "🆘", 14),
  createLeaf("a1-R-2-2", "Responder comentarios negativos", "Répondre commentaires négatifs", "💬", 14),
]));

// ============================================
// ÁREA S — TIEMPO LIBRE Y HOBBIES
// ============================================
branches.push(createBranch("a1-S-1", order++, "Deportes y actividades", "Sports et activités", "⚽", [
  createLeaf("a1-S-1-1", "Unirse a clubes locales", "Rejoindre clubs locaux", "🏃", 14),
  createLeaf("a1-S-1-2", "Alquilar equipos", "Louer équipements", "🎾", 14),
]));

branches.push(createBranch("a1-S-2", order++, "Eventos culturales", "Événements culturels", "🎭", [
  createLeaf("a1-S-2-1", "Festivales callejeros", "Festivals de rue", "🎪", 14),
  createLeaf("a1-S-2-2", "Mercados de artesanía", "Marchés artisanaux", "🎨", 14),
]));

branches.push(createBranch("a1-S-3", order++, "Cine y teatro", "Cinéma et théâtre", "🎬", [
  createLeaf("a1-S-3-1", "Comprar entradas", "Acheter billets", "🎫", 14),
  createLeaf("a1-S-3-2", "Elegir película", "Choisir film", "🎞️", 11),
  createLeaf("a1-S-3-3", "Comentar después", "Commenter après", "💬", 14),
]));

branches.push(createBranch("a1-S-4", order++, "Museos y turismo", "Musées et tourisme", "🗺️", [
  createLeaf("a1-S-4-1", "Información turística", "Informations touristiques", "ℹ️", 14),
  createLeaf("a1-S-4-2", "En el museo", "Au musée", "🏛️", 14),
  createLeaf("a1-S-4-3", "Fotos y recuerdos", "Photos et souvenirs", "📸", 11),
]));

// ============================================
// ÁREA T — FAMILIA Y RELACIONES
// ============================================
branches.push(createBranch("a1-T-1", order++, "Familia", "Famille", "👨‍👩‍👧", [
  createLeaf("a1-T-1-1", "Miembros de familia", "Membres famille", "👨‍👩‍👧", 14),
  createLeaf("a1-T-1-2", "Hablar de tu familia", "Parler de ta famille", "💬", 14),
  createLeaf("a1-T-1-3", "Preguntar por familia", "Demander famille", "❓", 11),
]));

branches.push(createBranch("a1-T-2", order++, "Relaciones", "Relations", "💑", [
  createLeaf("a1-T-2-1", "Estado civil", "État civil", "💍", 11),
  createLeaf("a1-T-2-2", "Hablar de pareja", "Parler partenaire", "💕", 11),
  createLeaf("a1-T-2-3", "Amigos cercanos", "Amis proches", "👥", 11),
]));

const topicTree = {
  id: "fr-a1-topic-tree",
  languageCode: "fr",
  levelCode: "A1",
  trunk: {
    title: "Puedo sobrevivir en situaciones cotidianas muy simples",
    titleFr: "Je peux survivre dans des situations quotidiennes très simples"
  },
  branches: branches
};

const outputPath = path.join(__dirname, '../content/fr/A1/topic-tree.json');
fs.writeFileSync(outputPath, JSON.stringify(topicTree, null, 2), 'utf8');

console.log(`✅ Generado topic-tree.json COMPLETO con ${branches.length} ramas`);
console.log(`📁 Archivo: ${outputPath}`);
console.log(`\n📊 Resumen:`);
console.log(`   - Áreas: A-T (todas las áreas principales)`);
console.log(`   - Ramas totales: ${branches.length}`);
console.log(`   - Hojas totales: ${branches.reduce((acc, b) => acc + b.leaves.length, 0)}`);

