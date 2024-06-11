const sharp = require('sharp');
const outputDir = 'public/assets/favicons'; // Replace with your desired output directory
const path = require('path')
const pngFiles = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'apple-touch-icon-120x120.png',
  'android-chrome-144x144.png',
  // Add other PNG icons if needed
];

pngFiles.forEach(file => {
  sharp(path.join(outputDir, file))
    .toFormat('webp')
    .toFile(path.join(outputDir, file.replace('.png', '.webp')), (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Converted ${file} to WebP format.`);
      }
    });
});