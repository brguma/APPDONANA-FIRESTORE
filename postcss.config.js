// 🎨 APP DONANA - PostCSS Configuration
// Configuração para processar Tailwind CSS e otimizações

module.exports = {
  plugins: [
    // 🎯 Tailwind CSS
    require('tailwindcss'),
    
    // 🔧 Autoprefixer - adiciona prefixos de navegador automaticamente
    require('autoprefixer'),
    
    // 🚀 Otimizações para produção
    ...(process.env.NODE_ENV === 'production'
      ? [
          // 🗜️ cssnano - minifica CSS em produção
          require('cssnano')({
            preset: [
              'default',
              {
                // Preserva comentários importantes
                discardComments: {
                  removeAll: true,
                },
                // Preserva custom properties
                normalizeUnicode: false,
                // Otimizações seguras
                safe: true,
              },
            ],
          }),
          
          // 🎯 PurgeCSS - remove CSS não utilizado
          require('@fullhuman/postcss-purgecss')({
            content: [
              './src/**/*.{js,jsx,ts,tsx}',
              './public/index.html',
            ],
            safelist: [
              // Preserva classes dinâmicas
              /^animate-/,
              /^transition-/,
              /^duration-/,
              /^ease-/,
              /^delay-/,
              // Preserva classes do Firebase UI (se usar)
              /^firebase/,
              /^fui-/,
              // Preserva classes de estado
              /^hover:/,
              /^focus:/,
              /^active:/,
              /^disabled:/,
              // Preserva classes responsivas
              /^sm:/,
              /^md:/,
              /^lg:/,
              /^xl:/,
              /^2xl:/,
              // Classes específicas do APP DONANA
              /^donana-/,
              /^btn-/,
              /^card-/,
              /^status-/,
              /^gradient-/,
            ],
            defaultExtractor: (content) => {
              // Extrator personalizado para capturar classes Tailwind
              const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
              const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
              return broadMatches.concat(innerMatches);
            },
          }),
        ]
      : []),
  ],
};