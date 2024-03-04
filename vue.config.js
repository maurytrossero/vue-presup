const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: [
    'vue-router', // Transpilar vue-router
    'axios' // Transpilar axios
    // Agrega más dependencias si es necesario
  ]
});
