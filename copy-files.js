const fs = require('fs-extra');
const path = require('path');

const srcFile = path.resolve(__dirname, 'src/utility/documentation.html');
const destDir = path.resolve(__dirname, 'dist/utility');

// Copier le fichier
fs.ensureDirSync(destDir); // Crée le dossier destination s'il n'existe pas
fs.copyFileSync(srcFile, path.join(destDir, 'documentation.html'));

console.log('Fichier documentation.html copié avec succès dans le dossier dist.');
