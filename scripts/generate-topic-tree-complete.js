#!/usr/bin/env node

/**
 * Script completo para generar topic-tree.json con todos los detalles
 * Basado en contentStructure.md
 */

const fs = require('fs');
const path = require('path');

// Colores de BRANCH_COLORS
const BRANCH_COLORS = {
  1: '#6366F1',  2: '#3B82F6',  3: '#0EA5E9',  4: '#06B6D4',
  5: '#10B981',  6: '#14B8A6',  7: '#F59E0B',  8: '#EF4444',
  9: '#EC4899',  10: '#8B5CF6',  11: '#A855F7',
};

// Estructura completa con todos los detalles
const completeStructure = {
  "A": {
    name: "Llegada y Primer Contacto",
    nameFr: "Arrivée et Premier Contact",
    branches: [
      {
        id: "a1-A-1",
        title: "Aeropuerto / Estación",
        titleFr: "Aéroport / Gare",
        icon: "✈️",
        leaves: [
          { id: "a1-A-1-1", title: "Control de frontera", titleFr: "Contrôle de frontière", icon: "🛂", minutes: 18 },
          { id: "a1-A-1-2", title: "Equipaje y aduana", titleFr: "Bagages et douane", icon: "🧳", minutes: 14 },
          { id: "a1-A-1-3", title: "Primer contacto humano", titleFr: "Premier contact humain", icon: "👋", minutes: 18 },
          { id: "a1-A-1-4", title: "Información y ayuda", titleFr: "Informations et aide", icon: "ℹ️", minutes: 13 },
        ]
      },
      {
        id: "a1-A-2",
        title: "Transporte con desconocidos",
        titleFr: "Transport avec des inconnus",
        icon: "🚇",
        leaves: [
          { id: "a1-A-2-1", title: "Taxi / VTC / Uber", titleFr: "Taxi / VTC / Uber", icon: "🚕", minutes: 18 },
          { id: "a1-A-2-2", title: "Bus y metro", titleFr: "Bus et métro", icon: "🚌", minutes: 18 },
          { id: "a1-A-2-3", title: "Tren (SNCF)", titleFr: "Train (SNCF)", icon: "🚂", minutes: 14 },
          { id: "a1-A-2-4", title: "Pedir ayuda con equipaje", titleFr: "Demander de l'aide avec les bagages", icon: "🎒", minutes: 11 },
        ]
      },
      {
        id: "a1-A-3",
        title: "Orientación urbana",
        titleFr: "Orientation urbaine",
        icon: "🗺️",
        leaves: [
          { id: "a1-A-3-1", title: "Pedir direcciones", titleFr: "Demander son chemin", icon: "📍", minutes: 18 },
          { id: "a1-A-3-2", title: "Entender indicaciones", titleFr: "Comprendre les indications", icon: "🧭", minutes: 18 },
          { id: "a1-A-3-3", title: "Confirmar que vas bien", titleFr: "Confirmer qu'on va bien", icon: "✅", minutes: 11 },
          { id: "a1-A-3-4", title: "Perderse y reorientarse", titleFr: "Se perdre et se réorienter", icon: "🤔", minutes: 14 },
        ]
      },
      {
        id: "a1-A-4",
        title: "Primeras horas en la ciudad",
        titleFr: "Premières heures en ville",
        icon: "🏙️",
        leaves: [
          { id: "a1-A-4-1", title: "Encontrar alojamiento", titleFr: "Trouver un logement", icon: "🏨", minutes: 14 },
          { id: "a1-A-4-2", title: "Comprar SIM / datos", titleFr: "Acheter une SIM / données", icon: "📱", minutes: 11 },
          { id: "a1-A-4-3", title: "Cambiar dinero", titleFr: "Changer de l'argent", icon: "💶", minutes: 11 },
        ]
      },
      {
        id: "a1-A-5",
        title: "Jet lag y adaptación",
        titleFr: "Décalage horaire et adaptation",
        icon: "😴",
        leaves: [
          { id: "a1-A-5-1", title: "Expresar cansancio", titleFr: "Exprimer la fatigue", icon: "💤", minutes: 9 },
          { id: "a1-A-5-2", title: "Pedir descanso", titleFr: "Demander du repos", icon: "🛌", minutes: 9 },
          { id: "a1-A-5-3", title: "Ajustar horarios", titleFr: "Ajuster les horaires", icon: "⏰", minutes: 11 },
        ]
      },
    ]
  },
  "B": {
    name: "Alojamiento y Convivencia",
    nameFr: "Logement et Cohabitation",
    branches: [
      {
        id: "a1-B-1",
        title: "Airbnb / Alojamiento temporal",
        titleFr: "Airbnb / Logement temporaire",
        icon: "🏠",
        leaves: [
          { id: "leaf-1-1-greetings", title: "Llegada y saludo", titleFr: "Arrivée et salutation", icon: "🤝", minutes: 20, special: true },
          { id: "a1-B-1-2", title: "Tour del espacio", titleFr: "Visite de l'espace", icon: "🚪", minutes: 18 },
          { id: "a1-B-1-3", title: "Normas de la casa", titleFr: "Règles de la maison", icon: "📋", minutes: 18 },
          { id: "a1-B-1-4", title: "Problemas técnicos", titleFr: "Problèmes techniques", icon: "🔧", minutes: 18 },
          { id: "a1-B-1-5", title: "Emergencias domésticas", titleFr: "Urgences domestiques", icon: "🚨", minutes: 14 },
          { id: "a1-B-1-6", title: "Checkout y despedida", titleFr: "Check-out et au revoir", icon: "👋", minutes: 14 },
        ]
      },
      {
        id: "a1-B-2",
        title: "Hotel",
        titleFr: "Hôtel",
        icon: "🏨",
        leaves: [
          { id: "a1-B-2-1", title: "Check-in", titleFr: "Enregistrement", icon: "📝", minutes: 18 },
          { id: "a1-B-2-2", title: "Servicios del hotel", titleFr: "Services de l'hôtel", icon: "🛎️", minutes: 14 },
          { id: "a1-B-2-3", title: "Problemas en habitación", titleFr: "Problèmes dans la chambre", icon: "🔧", minutes: 18 },
          { id: "a1-B-2-4", title: "Check-out", titleFr: "Départ", icon: "🚪", minutes: 14 },
        ]
      },
      {
        id: "a1-B-3",
        title: "Hostel / Albergue",
        titleFr: "Auberge de jeunesse",
        icon: "🛏️",
        leaves: [
          { id: "a1-B-3-1", title: "Habitación compartida", titleFr: "Chambre partagée", icon: "🛌", minutes: 14 },
          { id: "a1-B-3-2", title: "Espacios comunes", titleFr: "Espaces communs", icon: "🛋️", minutes: 14 },
          { id: "a1-B-3-3", title: "Socializar con viajeros", titleFr: "Socialiser avec les voyageurs", icon: "🌍", minutes: 18 },
        ]
      },
      {
        id: "a1-B-4",
        title: "Piso compartido",
        titleFr: "Colocation",
        icon: "🏘️",
        leaves: [
          { id: "a1-B-4-1", title: "Primera reunión", titleFr: "Première réunion", icon: "👥", minutes: 18 },
          { id: "a1-B-4-2", title: "Normas de convivencia", titleFr: "Règles de cohabitation", icon: "📜", minutes: 18 },
          { id: "a1-B-4-3", title: "Conflictos domésticos", titleFr: "Conflits domestiques", icon: "😤", minutes: 18 },
          { id: "a1-B-4-4", title: "Invitaciones y visitas", titleFr: "Invitaciones et visites", icon: "🎉", minutes: 14 },
          { id: "a1-B-4-5", title: "Gastos compartidos", titleFr: "Dépenses partagées", icon: "💰", minutes: 14 },
        ]
      },
      {
        id: "a1-B-5",
        title: "Alquiler largo plazo",
        titleFr: "Location longue durée",
        icon: "🏡",
        leaves: [
          { id: "a1-B-5-1", title: "Buscar piso", titleFr: "Chercher un appartement", icon: "🔍", minutes: 18 },
          { id: "a1-B-5-2", title: "Visita y negociación", titleFr: "Visite et négociation", icon: "🤝", minutes: 18 },
          { id: "a1-B-5-3", title: "Contrato básico", titleFr: "Contrat de base", icon: "📄", minutes: 14 },
          { id: "a1-B-5-4", title: "Relación con casero", titleFr: "Relation avec le propriétaire", icon: "👤", minutes: 18 },
          { id: "a1-B-5-5", title: "Averías y reparaciones", titleFr: "Pannes et réparations", icon: "🔨", minutes: 18 },
        ]
      },
      {
        id: "a1-B-6",
        title: "Vecinos",
        titleFr: "Voisins",
        icon: "👥",
        leaves: [
          { id: "a1-B-6-1", title: "Presentarse", titleFr: "Se présenter", icon: "👋", minutes: 11 },
          { id: "a1-B-6-2", title: "Ruidos y molestias", titleFr: "Bruits et dérangements", icon: "🔊", minutes: 14 },
          { id: "a1-B-6-3", title: "Pedir favores", titleFr: "Demander des faveurs", icon: "🙏", minutes: 11 },
          { id: "a1-B-6-4", title: "Resolver conflictos", titleFr: "Résoudre les conflits", icon: "🤝", minutes: 14 },
        ]
      },
      {
        id: "a1-B-7",
        title: "Relaciones con vecinos",
        titleFr: "Relations avec les voisins",
        icon: "🏢",
        leaves: [
          { id: "a1-B-7-1", title: "Saludos diarios en ascensor", titleFr: "Salutations quotidiennes dans l'ascenseur", icon: "🛗", minutes: 14 },
          { id: "a1-B-7-2", title: "Quejas por ruido", titleFr: "Plaintes pour le bruit", icon: "🔇", minutes: 14 },
        ]
      },
    ]
  },
  // Continuaré con las demás áreas...
};

// Función helper para generar hojas con detalles
function generateLeavesFromData(leavesData) {
  return leavesData.map(leaf => ({
    id: leaf.id,
    title: leaf.title,
    titleFr: leaf.titleFr,
    grammar: [],
    icon: leaf.icon,
    estimatedMinutes: leaf.minutes || 15
  }));
}

// Generar todas las ramas
let order = 1;
const allBranches = [];

Object.entries(completeStructure).forEach(([areaLetter, areaData]) => {
  areaData.branches.forEach(branchDef => {
    const color = BRANCH_COLORS[order] || BRANCH_COLORS[1];
    
    allBranches.push({
      id: branchDef.id,
      order: order++,
      title: branchDef.title,
      titleFr: branchDef.titleFr,
      description: "",
      icon: branchDef.icon,
      color: color,
      leaves: generateLeavesFromData(branchDef.leaves)
    });
  });
});

// Por ahora solo incluyo A y B, luego se puede expandir
const topicTree = {
  id: "fr-a1-topic-tree",
  languageCode: "fr",
  levelCode: "A1",
  trunk: {
    title: "Puedo sobrevivir en situaciones cotidianas muy simples",
    titleFr: "Je peux survivre dans des situations quotidiennes très simples"
  },
  branches: allBranches
};

const outputPath = path.join(__dirname, '../content/fr/A1/topic-tree.json');
fs.writeFileSync(outputPath, JSON.stringify(topicTree, null, 2), 'utf8');

console.log(`✅ Generado topic-tree.json con ${allBranches.length} ramas`);
console.log(`📁 Archivo: ${outputPath}`);

