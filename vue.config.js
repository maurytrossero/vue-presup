const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: './', // 👈 ESTA ES LA CLAVE para que los assets se carguen bien en producción
  transpileDependencies: [
    'vue-router',
    'axios'
  ]
});
