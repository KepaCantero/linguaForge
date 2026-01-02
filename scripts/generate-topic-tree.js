#!/usr/bin/env node

/**
 * Script para generar topic-tree.json completo basado en contentStructure.md
 * Ejecutar: node scripts/generate-topic-tree.js
 */

const fs = require('fs');
const path = require('path');

// Colores de BRANCH_COLORS
const BRANCH_COLORS = {
  1: '#6366F1',  2: '#3B82F6',  3: '#0EA5E9',  4: '#06B6D4',
  5: '#10B981',  6: '#14B8A6',  7: '#F59E0B',  8: '#EF4444',
  9: '#EC4899',  10: '#8B5CF6',  11: '#A855F7',
};

// Estructura completa de áreas y ramas según contentStructure.md
const structure = {
  "ÁREA A": [
    { id: "a1-A-1", title: "Aeropuerto / Estación", titleFr: "Aéroport / Gare", icon: "✈️", leaves: 4 },
    { id: "a1-A-2", title: "Transporte con desconocidos", titleFr: "Transport avec des inconnus", icon: "🚇", leaves: 4 },
    { id: "a1-A-3", title: "Orientación urbana", titleFr: "Orientation urbaine", icon: "🗺️", leaves: 4 },
    { id: "a1-A-4", title: "Primeras horas en la ciudad", titleFr: "Premières heures en ville", icon: "🏙️", leaves: 3 },
    { id: "a1-A-5", title: "Jet lag y adaptación", titleFr: "Décalage horaire et adaptation", icon: "😴", leaves: 3 },
  ],
  "ÁREA B": [
    { id: "a1-B-1", title: "Airbnb / Alojamiento temporal", titleFr: "Airbnb / Logement temporaire", icon: "🏠", leaves: 6, special: "a1-B-1-1=leaf-1-1-greetings" },
    { id: "a1-B-2", title: "Hotel", titleFr: "Hôtel", icon: "🏨", leaves: 4 },
    { id: "a1-B-3", title: "Hostel / Albergue", titleFr: "Auberge de jeunesse", icon: "🛏️", leaves: 3 },
    { id: "a1-B-4", title: "Piso compartido", titleFr: "Colocation", icon: "🏘️", leaves: 5 },
    { id: "a1-B-5", title: "Alquiler largo plazo", titleFr: "Location longue durée", icon: "🏡", leaves: 5 },
    { id: "a1-B-6", title: "Vecinos", titleFr: "Voisins", icon: "👥", leaves: 4 },
    { id: "a1-B-7", title: "Relaciones con vecinos", titleFr: "Relations avec les voisins", icon: "🏢", leaves: 2 },
  ],
  "ÁREA C": [
    { id: "a1-C-1", title: "Supermercado", titleFr: "Supermarché", icon: "🛒", leaves: 4 },
    { id: "a1-C-2", title: "Panadería / Pastelería", titleFr: "Boulangerie / Pâtisserie", icon: "🥖", leaves: 3 },
    { id: "a1-C-3", title: "Mercado / Frutería", titleFr: "Marché / Primeur", icon: "🍎", leaves: 3 },
    { id: "a1-C-4", title: "Carnicería / Pescadería", titleFr: "Boucherie / Poissonnerie", icon: "🥩", leaves: 3 },
    { id: "a1-C-5", title: "Restaurante / Café", titleFr: "Restaurant / Café", icon: "🍽️", leaves: 8 },
    { id: "a1-C-6", title: "Comida en casa", titleFr: "Cuisine à la maison", icon: "👨‍🍳", leaves: 3 },
    { id: "a1-C-7", title: "Pedidos por app", titleFr: "Commandes par app", icon: "📱", leaves: 2 },
  ],
  "ÁREA D": [
    { id: "a1-D-1", title: "Farmacia", titleFr: "Pharmacie", icon: "💊", leaves: 4 },
    { id: "a1-D-2", title: "Médico / Clínica", titleFr: "Médecin / Clinique", icon: "👨‍⚕️", leaves: 5 },
    { id: "a1-D-3", title: "Dentista", titleFr: "Dentiste", icon: "🦷", leaves: 2 },
    { id: "a1-D-4", title: "Emergencias", titleFr: "Urgences", icon: "🚑", leaves: 4 },
    { id: "a1-D-5", title: "Bienestar mental", titleFr: "Bien-être mental", icon: "🧘", leaves: 3 },
    { id: "a1-D-6", title: "Salud preventiva", titleFr: "Santé préventive", icon: "💉", leaves: 2 },
  ],
  "ÁREA E": [
    { id: "a1-E-1", title: "Búsqueda de empleo", titleFr: "Recherche d'emploi", icon: "💼", leaves: 3 },
    { id: "a1-E-2", title: "Entrevista de trabajo", titleFr: "Entretien d'embauche", icon: "🤝", leaves: 4 },
    { id: "a1-E-3", title: "Primer día laboral", titleFr: "Premier jour de travail", icon: "📅", leaves: 4 },
    { id: "a1-E-4", title: "Comunicación laboral", titleFr: "Communication professionnelle", icon: "📧", leaves: 4 },
    { id: "a1-E-5", title: "Errores laborales", titleFr: "Erreurs professionnelles", icon: "⚠️", leaves: 5 },
    { id: "a1-E-6", title: "Estudios / Formación", titleFr: "Études / Formation", icon: "📚", leaves: 5 },
  ],
  "ÁREA F": [
    { id: "a1-F-1", title: "Conocer gente", titleFr: "Rencontrer des gens", icon: "👋", leaves: 4 },
    { id: "a1-F-2", title: "Small talk", titleFr: "Conversation légère", icon: "💬", leaves: 4 },
    { id: "a1-F-3", title: "Escalada social", titleFr: "Montée sociale", icon: "📈", leaves: 4 },
    { id: "a1-F-4", title: "Citas románticas", titleFr: "Rendez-vous romantiques", icon: "💕", leaves: 5 },
    { id: "a1-F-5", title: "Invitaciones", titleFr: "Invitations", icon: "🎫", leaves: 4 },
    { id: "a1-F-6", title: "Fiestas y eventos", titleFr: "Fêtes et événements", icon: "🎉", leaves: 4 },
    { id: "a1-F-7", title: "Conflictos sociales", titleFr: "Conflits sociaux", icon: "😤", leaves: 4 },
    { id: "a1-F-8", title: "Regalos y cortesía", titleFr: "Cadeaux et courtoisie", icon: "🎁", leaves: 2 },
  ],
  "ÁREA G": [
    { id: "a1-G-1", title: "Banco", titleFr: "Banque", icon: "🏦", leaves: 4 },
    { id: "a1-G-2", title: "Correos", titleFr: "Poste", icon: "📮", leaves: 3 },
    { id: "a1-G-3", title: "Ayuntamiento / Mairie", titleFr: "Mairie", icon: "🏛️", leaves: 3 },
    { id: "a1-G-4", title: "Policía / Préfecture", titleFr: "Police / Préfecture", icon: "👮", leaves: 3 },
    { id: "a1-G-5", title: "Otros servicios", titleFr: "Autres services", icon: "⚙️", leaves: 3 },
  ],
  "ÁREA H": [
    { id: "a1-H-1", title: "Comercios", titleFr: "Commerces", icon: "🏪", leaves: 4 },
    { id: "a1-H-2", title: "Transporte", titleFr: "Transport", icon: "🚌", leaves: 3 },
    { id: "a1-H-3", title: "Restaurantes", titleFr: "Restaurants", icon: "🍴", leaves: 3 },
    { id: "a1-H-4", title: "Servicios", titleFr: "Services", icon: "🔧", leaves: 3 },
  ],
  "ÁREA I": [
    { id: "a1-I-1", title: "Mensajería", titleFr: "Messagerie", icon: "💬", leaves: 4 },
    { id: "a1-I-2", title: "Redes sociales", titleFr: "Réseaux sociaux", icon: "📱", leaves: 3 },
    { id: "a1-I-3", title: "Email personal", titleFr: "Email personnel", icon: "📧", leaves: 3 },
  ],
  "ÁREA J": [
    { id: "a1-J-1", title: "Saludos físicos", titleFr: "Salutations physiques", icon: "👋", leaves: 3 },
    { id: "a1-J-2", title: "Espacio personal", titleFr: "Espace personnel", icon: "🚶", leaves: 3 },
    { id: "a1-J-3", title: "Etiqueta social", titleFr: "Étiquette sociale", icon: "🎩", leaves: 3 },
    { id: "a1-J-4", title: "Humor francés", titleFr: "Humour français", icon: "😄", leaves: 3 },
  ],
  "ÁREA K": [
    { id: "a1-K-1", title: "Bloqueo lingüístico", titleFr: "Blocage linguistique", icon: "😰", leaves: 5 },
    { id: "a1-K-2", title: "Error social", titleFr: "Erreur sociale", icon: "😅", leaves: 3 },
    { id: "a1-K-3", title: "Estrategias para bloqueos", titleFr: "Stratégies pour les blocages", icon: "🧠", leaves: 2 },
    { id: "a1-K-4", title: "Salir de conversaciones incómodas", titleFr: "Sortir de conversations gênantes", icon: "🚪", leaves: 2 },
    { id: "a1-K-5", title: "Estrategias de comunicación", titleFr: "Stratégies de communication", icon: "💡", leaves: 3 },
  ],
  "ÁREA L": [
    { id: "a1-L-1", title: "Respuestas vagas", titleFr: "Réponses vagues", icon: "🤷", leaves: 4 },
    { id: "a1-L-2", title: "Silencios y pausas", titleFr: "Silences et pauses", icon: "🤐", leaves: 3 },
    { id: "a1-L-3", title: "Lectura de emociones", titleFr: "Lecture des émotions", icon: "😊", leaves: 2 },
  ],
  "ÁREA M": [
    { id: "a1-M-1", title: "Historia personal", titleFr: "Histoire personnelle", icon: "📖", leaves: 4 },
    { id: "a1-M-2", title: "Gustos y preferencias", titleFr: "Goûts et préférences", icon: "❤️", leaves: 4 },
    { id: "a1-M-3", title: "Historias personales breves", titleFr: "Histoires personnelles courtes", icon: "📝", leaves: 2 },
    { id: "a1-M-4", title: "Opiniones simples", titleFr: "Opinions simples", icon: "💭", leaves: 3 },
  ],
  "ÁREA N": [
    { id: "a1-N-1", title: "Personas invasivas", titleFr: "Personnes envahissantes", icon: "🚫", leaves: 3 },
    { id: "a1-N-2", title: "Situaciones de emergencia", titleFr: "Situations d'urgence", icon: "🚨", leaves: 2 },
    { id: "a1-N-3", title: "Estafas y engaños", titleFr: "Arnaques et tromperies", icon: "⚠️", leaves: 3 },
  ],
  "ÁREA O": [
    { id: "a1-O-1", title: "Preparación diaria", titleFr: "Préparation quotidienne", icon: "☀️", leaves: 2 },
    { id: "a1-O-2", title: "Emergencias climáticas", titleFr: "Urgences climatiques", icon: "⛈️", leaves: 2 },
    { id: "a1-O-3", title: "Hablar del tiempo", titleFr: "Parler du temps", icon: "🌤️", leaves: 3 },
    { id: "a1-O-4", title: "Estaciones y festividades", titleFr: "Saisons et fêtes", icon: "🎄", leaves: 3 },
  ],
  "ÁREA P": [
    { id: "a1-P-1", title: "Museos y exposiciones", titleFr: "Musées et expositions", icon: "🎨", leaves: 2 },
    { id: "a1-P-2", title: "Cine y espectáculos", titleFr: "Cinéma et spectacles", icon: "🎬", leaves: 2 },
  ],
  "ÁREA Q": [
    { id: "a1-Q-1", title: "Reuniones de equipo", titleFr: "Réunions d'équipe", icon: "👥", leaves: 2 },
    { id: "a1-Q-2", title: "Comunicación con clientes", titleFr: "Communication avec les clients", icon: "🤝", leaves: 2 },
  ],
  "ÁREA R": [
    { id: "a1-R-1", title: "Videollamadas profesionales", titleFr: "Visioconférences professionnelles", icon: "💻", leaves: 2 },
    { id: "a1-R-2", title: "Redes sociales comunitarias", titleFr: "Réseaux sociaux communautaires", icon: "🌐", leaves: 2 },
  ],
  "ÁREA S": [
    { id: "a1-S-1", title: "Deportes y actividades", titleFr: "Sports et activités", icon: "⚽", leaves: 2 },
    { id: "a1-S-2", title: "Eventos culturales", titleFr: "Événements culturels", icon: "🎭", leaves: 2 },
    { id: "a1-S-3", title: "Cine y teatro", titleFr: "Cinéma et théâtre", icon: "🎬", leaves: 3 },
    { id: "a1-S-4", title: "Museos y turismo", titleFr: "Musées et tourisme", icon: "🗺️", leaves: 3 },
  ],
  "ÁREA T": [
    { id: "a1-T-1", title: "Familia", titleFr: "Famille", icon: "👨‍👩‍👧", leaves: 3 },
    { id: "a1-T-2", title: "Relaciones", titleFr: "Relations", icon: "💑", leaves: 3 },
  ],
};

// Función para generar hojas basadas en el ID de la rama
function generateLeaves(branchId, count, special = null) {
  const leaves = [];
  const [level, area, branchNum] = branchId.split('-');
  
  for (let i = 1; i <= count; i++) {
    const leafId = `${branchId}-${i}`;
    
    // Si hay una hoja especial (como leaf-1-1-greetings), usar ese ID
    if (special && i === 1) {
      const specialId = special.split('=')[1];
      leaves.push({
        id: specialId,
        title: `Hoja ${i}`,
        titleFr: `Feuille ${i}`,
        grammar: [],
        icon: "📄",
        estimatedMinutes: 15
      });
    } else {
      leaves.push({
        id: leafId,
        title: `Hoja ${i}`,
        titleFr: `Feuille ${i}`,
        grammar: [],
        icon: "📄",
        estimatedMinutes: 15
      });
    }
  }
  
  return leaves;
}

// Generar el árbol completo
let order = 1;
const branches = [];

Object.entries(structure).forEach(([areaName, areaBranches]) => {
  areaBranches.forEach((branchDef) => {
    const color = BRANCH_COLORS[order] || BRANCH_COLORS[1];
    const leaves = generateLeaves(branchDef.id, branchDef.leaves, branchDef.special);
    
    branches.push({
      id: branchDef.id,
      order: order++,
      title: branchDef.title,
      titleFr: branchDef.titleFr,
      description: "",
      icon: branchDef.icon,
      color: color,
      leaves: leaves
    });
  });
});

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

// Escribir el archivo
const outputPath = path.join(__dirname, '../content/fr/A1/topic-tree.json');
fs.writeFileSync(outputPath, JSON.stringify(topicTree, null, 2), 'utf8');

console.log(`✅ Generado topic-tree.json con ${branches.length} ramas`);
console.log(`📁 Archivo: ${outputPath}`);

