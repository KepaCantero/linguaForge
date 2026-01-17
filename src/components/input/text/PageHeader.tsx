'use client';

import { motion } from 'framer-motion';

export function PageHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-2"
    >
      <h1 className="text-3xl font-bold text-white">
        Importar Texto
      </h1>
      <p className="text-calm-text-muted">
        Pega tu texto en francés para analizar, escuchar y estudiar en bloques
      </p>
    </motion.header>
  );
}
