const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Excluimos la carpeta `merge/` (código de referencia de otra versión) para que
// Metro no la escanee. Tiene su propio package.json llamado "modaapp" y eso
// provoca una colisión de nombres (haste) que rompe el bundler.
config.resolver.blockList = [/[\/\\]merge[\/\\].*/];

module.exports = config;
