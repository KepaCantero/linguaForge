# Tareas — ÁREA 0 y Expansiones de Contenido

> **Última actualización:** 2025-01-01
> **Prioridad:** CRÍTICA para ÁREA 0, ALTA para expansiones
> **Filosofía:** Base absoluta antes de cualquier otro contenido

---

## 📊 RESUMEN EJECUTIVO

### ÁREA 0 — BASE ABSOLUTA (NUEVA)
- **7 Nodos** con **21+ bloques conversacionales**
- **Objetivo:** Usuarios con 0 conocimiento de francés
- **Prioridad:** 🔴 CRÍTICA (debe completarse antes de cualquier otro contenido)

### Expansiones en Áreas Existentes
- **5 Nuevas Áreas:** O (Clima), P (Cultura/Ocio), Q (Trabajo Avanzado), R (Digital Profundo), S (Tiempo Libre)
- **6 Áreas Ampliadas:** K, L, M, N, B, C, D, F
- **Total estimado:** ~50 nuevos bloques conversacionales

---

## 🎯 FASE 0 — ÁREA 0: BASE ABSOLUTA (CRÍTICA)

### TAREA 0.1 — Schema y Estructura para ÁREA 0
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 2 horas

**Descripción:**
- Crear schema específico para bloques de "Base Absoluta"
- Estructura: `inicio → desarrollo → resolución → cierre`
- Campos adicionales: `audioTags`, `culturalNotes`, `survivalStrategy`, `commonErrors`

**Archivos:**
- `src/schemas/content.ts` (extender `ConversationalBlockSchema`)
- `src/types/index.ts` (tipos para Base Absoluta)

**Criterios de aceptación:**
- [ ] Schema valida estructura de 4 fases
- [ ] Soporta notas culturales y estrategias de supervivencia
- [ ] Compatible con sistema de ejercicios existente

---

### TAREA 0.2 — NODO 0.1: Saludos y Despedidas
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque A1: Saludo formal (tienda) - "Bonjour Madame !"
- [ ] Bloque A2: Saludo informal (café con amigos) - "Salut ! Ça va ?"
- [ ] Bloque A3: Despedida formal (oficina) - "Je dois y aller maintenant."
- [ ] Bloque A4: Despedida emergencia - "Désolé, je dois partir."

**Contenido por bloque:**
- Mínimo 4 frases (inicio, desarrollo, resolución, cierre)
- Audio nativo con tags `[slow]`, `[office_background]` según contexto
- Nota cultural: "Bonjour" hasta 18h, luego "Bonsoir"
- Estrategia de supervivencia: "Je suis pressé, excusez-moi !"

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-1-saludos.json`

**Criterios de aceptación:**
- [ ] 4 bloques completos con estructura conversacional
- [ ] Audio nativo para cada bloque
- [ ] Notas culturales integradas
- [ ] Estrategias de supervivencia documentadas

---

### TAREA 0.3 — NODO 0.2: Números y Tiempo
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque B1: Comprar billete de metro - "Quatre euros cinquante"
- [ ] Bloque B2: Preguntar horario de museo - "À quelle heure ferme le musée ?"

**Contenido especial:**
- Truco auditivo: Patrones de números (soixante-dix = 60+10)
- Referencias culturales: Museos cierran 1 día a la semana
- Pronunciación crítica: "katr eu-ro san-kant"

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-2-numeros-tiempo.json`

**Criterios de aceptación:**
- [ ] 2 bloques con números 0-100
- [ ] Trucos de pronunciación integrados
- [ ] Referencias culturales sobre horarios franceses

---

### TAREA 0.4 — NODO 0.3: Verbos Clave (Los 5 Verbos)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 6 horas

**Bloques requeridos:**
- [ ] Bloque C1: Estructuras con être (ser/estar) - "Je suis espagnol"
- [ ] Bloque C2: Pedir ayuda con pouvoir (poder) - "Pourriez-vous m'aider ?"

**Verbos críticos:** être, avoir, aller, vouloir, pouvoir

**Contenido especial:**
- Error común: NO "Je suis de España" → usar gentilicio
- Estrategia: "Pourriez-vous écrire le nom ?"

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-3-verbos-clave.json`

**Criterios de aceptación:**
- [ ] 2 bloques cubriendo los 5 verbos esenciales
- [ ] Errores comunes documentados
- [ ] Estrategias de recuperación incluidas

---

### TAREA 0.5 — NODO 0.4: Frases de Supervivencia Inmediata
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque D1: "No entiendo" (farmacia) - "Je ne comprends pas bien le français"
- [ ] Bloque D2: "¿Dónde está el baño?" - "Où sont les toilettes ?"

**Contenido especial:**
- Clave psicológica: "Désolé" activa empatía francesa
- Cultural note: NUNCA "la salle de bain" en público, solo "toilettes"

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-4-supervivencia.json`

**Criterios de aceptación:**
- [ ] 2 bloques con frases críticas de supervivencia
- [ ] Notas psicológicas y culturales incluidas
- [ ] Variantes formales e informales

---

### TAREA 0.6 — NODO 0.5: Objetos Cotidianos
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque E1: En habitación Airbnb - "Il manque des serviettes de bain"
- [ ] Bloque E2: En supermercado - "Où puis-je trouver le pain ?"

**Vocabulario visual:** serviette, douche, robinet, fenêtre, rayon, caisse, panier, étiquette

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-5-objetos.json`

**Criterios de aceptación:**
- [ ] 2 bloques con vocabulario espacial
- [ ] Palabras visuales integradas con contexto
- [ ] Mínimo 15 objetos clave por bloque

---

### TAREA 0.7 — NODO 0.6: Estrategias de Recuperación
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque F1: Ganar tiempo para pensar - "C'est une question intéressante..."
- [ ] Bloque F2: Pedir repetición - "Pourriez-vous répéter plus lentement ?"

**Contenido especial:**
- Técnica psicológica: Transparencia sobre nivel genera simpatía (92% franceses)
- Frase mágica: "Je suis débutant en français, merci de votre patience."

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-6-recuperacion.json`

**Criterios de aceptación:**
- [ ] 2 bloques con estrategias de recuperación
- [ ] Técnicas psicológicas documentadas
- [ ] Frases mágicas identificadas

---

### TAREA 0.8 — NODO 0.7: Interacción Digital Básica
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 4 horas

**Bloques requeridos:**
- [ ] Bloque G1: Mensajes WhatsApp - "Salut ! C'est Alex, ton nouveau colocataire"
- [ ] Bloque G2: Correos formales - "Objet: Demande de facture d'électricité"

**Contenido especial:**
- Regla de oro: Emoji (✨) al final suaviza solicitudes
- Plantilla mágica: "Pourriez-vous..." + razón + "Merci d'avance" = 95% respuesta positiva

**Archivos:**
- `content/fr/A0/base-absoluta/nodo-0-7-digital.json`

**Criterios de aceptación:**
- [ ] 2 bloques cubriendo WhatsApp y email
- [ ] Plantillas de mensajes formales e informales
- [ ] Reglas de comunicación digital documentadas

---

### TAREA 0.9 — Integración ÁREA 0 en Sistema
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** 3 horas

**Descripción:**
- Integrar ÁREA 0 como prerrequisito para todas las demás áreas
- Actualizar `topic-tree.json` con ÁREA 0
- Modificar sistema de desbloqueo para requerir completar ÁREA 0 primero

**Archivos:**
- `content/fr/A1/topic-tree.json` (añadir ÁREA 0)
- `src/services/contentLoader.ts` (lógica de prerrequisitos)
- `src/components/tree/RadialTree.tsx` (visualización ÁREA 0)

**Criterios de aceptación:**
- [ ] ÁREA 0 aparece como primer nodo en el árbol
- [ ] Todas las demás áreas bloqueadas hasta completar ÁREA 0
- [ ] Sistema de progreso reconoce ÁREA 0

---

## 🚀 FASE 1 — EXPANSIONES EN ÁREAS EXISTENTES

### TAREA 1.1 — ÁREA O: Clima y Estaciones (NUEVA)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 6 horas

**Nodos:**
- [ ] O.1.1: Consultar el tiempo - "Quel temps fait-il aujourd'hui ?"
- [ ] O.1.2: Actividades según clima - "Il fait très chaud, où puis-je acheter une bouteille d'eau ?"
- [ ] O.2.1: Alertas meteorológicas - "J'ai vu une alerte à la télé, est-ce sérieux ?"
- [ ] O.2.2: Transporte en tormenta - "Le métro fonctionne-t-il malgré la neige ?"

**Archivos:**
- `content/fr/A1/area-O/clima-estaciones.json`

---

### TAREA 1.2 — ÁREA P: Cultura y Ocio (NUEVA)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 6 horas

**Nodos:**
- [ ] P.1.1: Comprar entradas museo - "Une entrée adulte s'il vous plaît"
- [ ] P.1.2: Preguntar por obras - "Où se trouve la Joconde ?"
- [ ] P.2.1: Reservar butacas cine - "Je voudrais deux places pour ce soir"
- [ ] P.2.2: Problemas técnicos - "L'image n'est pas claire depuis ma place"

**Archivos:**
- `content/fr/A1/area-P/cultura-ocio.json`

---

### TAREA 1.3 — ÁREA Q: Trabajo Avanzado (NUEVA)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 8 horas

**Nodos:**
- [ ] Q.1.1: Pedir la palabra en reunión - "Puis-je ajouter quelque chose ?"
- [ ] Q.1.2: Desacuerdos profesionales - "Je ne suis pas d'accord avec cette approche"
- [ ] Q.2.1: Quejas de clientes - "Je suis désolé pour le retard"
- [ ] Q.2.2: Seguimiento post-venta - "Tout va bien avec le produit ?"

**Archivos:**
- `content/fr/A1/area-Q/trabajo-avanzado.json`

---

### TAREA 1.4 — ÁREA R: Comunicación Digital Profunda (NUEVA)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 6 horas

**Nodos:**
- [ ] R.1.1: Problemas técnicos videollamada - "Je n'entends pas très bien"
- [ ] R.1.2: Intervenciones en grupo - "Je peux partager mon point de vue ?"
- [ ] R.2.1: Pedir ayuda en grupos locales - "Je cherche un médecin francophone"
- [ ] R.2.2: Responder comentarios negativos - "Pourquoi as-tu écrit cela ?"

**Archivos:**
- `content/fr/A1/area-R/comunicacion-digital.json`

---

### TAREA 1.5 — ÁREA S: Tiempo Libre y Hobbies (NUEVA)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟡 ALTA  
**Tiempo estimado:** 6 horas

**Nodos:**
- [ ] S.1.1: Unirse a clubes locales - "Je voudrais rejoindre votre club de yoga"
- [ ] S.1.2: Alquilar equipos - "Je voudrais louer un vélo pour demain"
- [ ] S.2.1: Festivales callejeros - "Où est la scène principale ?"
- [ ] S.2.2: Mercados de artesanía - "Combien coûte cette baguette de pain ?"

**Archivos:**
- `content/fr/A1/area-S/tiempo-libre.json`

---

## 🔄 FASE 2 — AMPLIACIONES EN ÁREAS EXISTENTES

### TAREA 2.1 — ÁREA K: Recuperación y Supervivencia (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] K.3.1: Ganar tiempo para pensar - "C'est intéressant..."
- [ ] K.3.2: Pedir ayuda educadamente - "Je ne comprends pas ce mot"
- [ ] K.4.1: Señales de cierre - "Je dois partir maintenant"
- [ ] K.4.2: Cambiar de tema - "Parlons de quelque chose de plus positif"

**Archivos:**
- `content/fr/A1/area-K/recuperacion-ampliada.json`

---

### TAREA 2.2 — ÁREA L: Ambigüedad y Entre Líneas (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] L.3.1: Detectar enojo/disconformidad - "Vous semblez contrarié"
- [ ] L.3.2: Responder a elogios - "J'aime ton sac ! Il est très élégant"

**Archivos:**
- `content/fr/A1/area-L/ambiguedad-ampliada.json`

---

### TAREA 2.3 — ÁREA M: Identidad Personal (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] M.3.1: Responder a "¿Por qué Francia?" - "Pourquoi la France ?"
- [ ] M.3.2: Hablar de familia - "Tu as des frères et sœurs ?"

**Archivos:**
- `content/fr/A1/area-M/identidad-ampliada.json`

---

### TAREA 2.4 — ÁREA N: Seguridad Personal (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] N.2.1: Perder documentos - "J'ai perdu mon passeport !"
- [ ] N.2.2: Pedir ayuda a policía - "Je suis perdu et j'ai besoin d'aide"

**Archivos:**
- `content/fr/A1/area-N/seguridad-ampliada.json`

---

### TAREA 2.5 — ÁREA B: Alojamiento (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] B.4.1: Saludos diarios en ascensor - "Bonjour Madame !"
- [ ] B.4.2: Quejas por ruido - "Désolé de vous déranger, mais la musique est un peu forte"

**Archivos:**
- `content/fr/A1/area-B/alojamiento-ampliada.json`

---

### TAREA 2.6 — ÁREA C: Alimentación (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] C.5.1: Problemas con entrega app - "Ma commande n'est pas arrivée"
- [ ] C.5.2: Modificar pedidos en tiempo real - "Je voudrais ajouter une bouteille d'eau"

**Archivos:**
- `content/fr/A1/area-C/alimentacion-ampliada.json`

---

### TAREA 2.7 — ÁREA D: Salud (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] D.4.1: Vacunas y chequeos - "Où puis-je me faire vacciner ?"
- [ ] D.4.2: Farmacia 24h - "Où est la pharmacie de garde ?"

**Archivos:**
- `content/fr/A1/area-D/salud-ampliada.json`

---

### TAREA 2.8 — ÁREA F: Vida Social (Ampliada)
**Estado:** `[ ]` Pendiente  
**Prioridad:** 🟢 MEDIA  
**Tiempo estimado:** 4 horas

**Nuevos nodos:**
- [ ] F.5.1: Invitaciones a casa - "Viens dîner chez moi samedi !"
- [ ] F.5.2: Agradecer hospitalidad - "Merci pour le dîner, c'était délicieux !"

**Archivos:**
- `content/fr/A1/area-F/vida-social-ampliada.json`

---

## 📋 RESUMEN DE TAREAS

### Por Fase:
- **FASE 0 (ÁREA 0):** 9 tareas - 🔴 CRÍTICA
- **FASE 1 (Nuevas Áreas):** 5 tareas - 🟡 ALTA
- **FASE 2 (Ampliaciones):** 8 tareas - 🟢 MEDIA

### Por Prioridad:
- 🔴 **CRÍTICA:** 9 tareas (ÁREA 0)
- 🟡 **ALTA:** 5 tareas (Nuevas áreas O, P, Q, R, S)
- 🟢 **MEDIA:** 8 tareas (Ampliaciones)

### Total:
- **22 tareas nuevas**
- **Tiempo estimado total:** ~90 horas
- **Bloques conversacionales:** ~70+ nuevos bloques

---

## 🎯 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Semana 1-2:** Completar FASE 0 (ÁREA 0) - Base absoluta
2. **Semana 3-4:** Implementar FASE 1 (Nuevas áreas críticas: O, P)
3. **Semana 5-6:** Completar FASE 1 (Áreas Q, R, S)
4. **Semana 7-8:** Implementar FASE 2 (Ampliaciones prioritarias: K, L, M, N)
5. **Semana 9-10:** Completar FASE 2 (Ampliaciones restantes: B, C, D, F)

---

## ✅ CRITERIOS DE CALIDAD

Cada bloque conversacional debe incluir:
- [ ] Estructura completa: inicio → desarrollo → resolución → cierre
- [ ] Mínimo 4 frases por bloque
- [ ] Audio nativo con tags contextuales
- [ ] Nota cultural relevante
- [ ] Estrategia de supervivencia (si aplica)
- [ ] Error común documentado (si aplica)
- [ ] Vocabulario visual integrado (si aplica)

---

**Última actualización:** 2025-01-01  
**Próxima revisión:** Al completar FASE 0

