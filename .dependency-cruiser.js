/**
 * Dependency Cruiser Configuration
 * Reglas arquitectónicas para LinguaForge
 *
 * Para instalar dependency-cruiser:
 * npm i -D dependency-cruiser
 *
 * Para ejecutar manualmente:
 * npx depcruise src --config .dependency-cruiser.js
 *
 * Nota: Los componentes pueden usar servicios (service layer pattern).
 * Las reglas previenen acceso directo a datos y dependencias incorrectas.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-supabase-client-in-components',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '@supabase/supabase-js' }
    },
    {
      name: 'no-supabase-client-in-app',
      severity: 'error',
      from: { path: '^src/app' },
      to: { path: '@supabase/supabase-js' }
    },
    {
      name: 'no-supabase-ssr-in-components',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '@supabase/ssr' }
    },
    {
      name: 'no-supabase-ssr-in-app',
      severity: 'error',
      from: { path: '^src/app' },
      to: { path: '@supabase/ssr' }
    },
    {
      name: 'no-app-routes-in-services',
      severity: 'error',
      from: { path: '^src/(services|repositories)/' },
      to: { path: '^src/app' }
    },
    {
      name: 'no-components-in-services',
      severity: 'error',
      from: { path: '^src/(services|repositories)/' },
      to: { path: '^src/components' }
    },
    {
      name: 'no-fetch-in-components',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '^node_modules/node-fetch' }
    },
    {
      name: 'no-axios-in-components',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '^node_modules/axios' }
    }
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    moduleSystems: ['cjs', 'es6'],
    reporterOptions: {
      archi: {
        collapsePattern: ['^src/(components|services|store|hooks|app)/.*']
      }
    }
  }
};
