# Contenido de Ejercicios Core v2.0 - Check-in

Este archivo contiene el contenido JSON para los ejercicios nuevos (Shard Detection, Pragma Strike, Echo Stream, Glyph Weaving, Resonance Path) para la primera matriz "Check-in".

## Estructura de Archivos Necesarios

### Audios (`/public/audio/fr/a1/airbnb/checkin/`)

#### Shard Detection
- `shard-1.mp3` - "Bonjour, je suis votre invité." (4.5s)
- `shard-2.mp3` - "Où puis-je mettre mes valises?" (5.2s)
- `shard-3.mp3` - "J'ai réservé pour deux nuits." (3.8s)
- `shard-4.mp3` - "À quelle heure est le check-in?" (4.1s)
- `shard-5.mp3` - "Merci beaucoup pour l'accueil." (4.7s)

#### Echo Stream
- `echo-1.mp3` - "Bonjour, je suis votre invité. J'ai réservé pour deux nuits." (12.5s)
- `echo-2.mp3` - "Où puis-je mettre mes valises? Et à quelle heure est le check-in?" (15.3s)
- `echo-3.mp3` - "Merci beaucoup pour l'accueil. L'appartement est très beau." (18.2s)
- `echo-4.mp3` - "Excusez-moi, où se trouve la salle de bain, s'il vous plaît?" (14.7s)
- `echo-5.mp3` - "Pourriez-vous me donner le mot de passe WiFi? Merci beaucoup." (16.8s)

#### Glyph Weaving
- `glyph-1.mp3` - "Bonjour, je suis votre invité." (BPM: 90)
- `glyph-2.mp3` - "Où puis-je mettre mes valises?" (BPM: 85)
- `glyph-3.mp3` - "Merci beaucoup pour l'accueil." (BPM: 95)

#### Resonance Path
- `resonance-1.mp3` - "Bonjour, je suis votre invité."
- `resonance-2.mp3` - "Où puis-je mettre mes valises?"
- `resonance-3.mp3` - "Merci beaucoup pour l'accueil."

### Imágenes (`/public/images/exercises/checkin/`)

#### Shard Detection
- `handshake.jpg` - Saludo/apretón de manos
- `keys.jpg` - Llaves
- `luggage.jpg` - Maletas/equipaje
- `calendar.jpg` - Calendario/fechas
- `clock.jpg` - Reloj/hora

#### Pragma Strike
- `situation-1.jpg` - Situación: Llegada tarde
- `situation-2.jpg` - Situación: Pregunta sobre necesidades
- `situation-3.jpg` - Situación: Preguntar por el baño
- `situation-4.jpg` - Situación: Escuchar reglas
- `situation-5.jpg` - Situación: Preguntar por WiFi

## Notas de Producción

### Audios
- Formato: MP3, 44.1kHz, 128kbps mono
- Voz recomendada: Charlotte (francés neutral, tono amable)
- Velocidad: 0.9x-1.0x para A1
- Duración máxima por frase: 8 segundos (Shard Detection)

### Imágenes
- Formato: JPG/WebP
- Resolución: Mínimo 400x400px
- Tema: Situaciones reales de check-in en Airbnb
- Estilo: Fotografías reales, no ilustraciones

### Power Words (Echo Stream)
- Palabras clave contextuales importantes
- Timestamps precisos con tolerancia de ±0.5s
- Enfocadas en vocabulario esencial A1

### Patrones de Entonación (Resonance Path)
- Valores normalizados 0-100
- Basados en frecuencia fundamental (F0)
- Capturados de hablantes nativos franceses

### BPM (Glyph Weaving)
- Rango: 85-95 BPM para A1
- Ritmo claro y constante
- Sincronizado con pronunciación natural

## Uso

El contenido se carga automáticamente cuando se accede a la matriz "Check-in" usando `exerciseContentLoader.ts`.

```typescript
import { loadExerciseContent } from '@/services/exerciseContentLoader';

const content = await loadExerciseContent('fr-a1-airbnb', 'matrix-1-checkin');
const shardExercises = content.exercises.shardDetection;
```

