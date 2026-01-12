import { motion } from 'framer-motion';
import { CircularMeter } from './CircularMeter';

interface CognitiveLoadSectionProps {
  intrinsic: number;
  germane: number;
  extraneous: number;
}

export function CognitiveLoadSection({ intrinsic, germane, extraneous }: CognitiveLoadSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative h-48"
    >
      <h2 className="text-center text-lg font-bold text-white mb-6">Carga Cognitiva</h2>

      {/* Three circular meters */}
      <div className="flex justify-center items-center gap-8">
        <CircularMeter value={intrinsic} label="Intrínseca" color="#3B82F6" delay={0} />
        <CircularMeter value={germane} label="Germana" color="#22C55E" delay={0.1} isMain />
        <CircularMeter value={extraneous} label="Extraña" color="#F59E0B" delay={0.2} />
      </div>
    </motion.div>
  );
}
