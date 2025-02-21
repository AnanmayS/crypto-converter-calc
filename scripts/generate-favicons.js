const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

const inputSvg = path.join(__dirname, '../public/favicon.svg');
const svgBuffer = fs.readFileSync(inputSvg);

async function generateFavicons() {
  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public/', name));
    
    console.log(`Generated ${name}`);
  }

  // Also use the 32x32 version as favicon.ico
  await fs.promises.copyFile(
    path.join(__dirname, '../public/favicon-32x32.png'),
    path.join(__dirname, '../public/favicon.ico')
  );
  
  console.log('Generated favicon.ico');
}

generateFavicons().catch(console.error); 