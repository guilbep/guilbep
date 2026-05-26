import sharp from 'sharp';

const src = 'src/assets/images/avatar.jpg';
const dst = 'src/assets/images/avatar.jpg';
const dstWebp = 'src/assets/images/avatar.webp';
const dstTmp = 'src/assets/images/avatar-240.jpg';

const buf = await import('fs').then(m => m.readFileSync(src));

await sharp(buf).resize(240, 240).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(dstTmp);
await sharp(buf).resize(240, 240).webp({ quality: 78, effort: 6 }).toFile(dstWebp);

const fs = await import('fs');
fs.renameSync(dstTmp, dst);
console.log('jpg:', fs.statSync(dst).size, 'bytes');
console.log('webp:', fs.statSync(dstWebp).size, 'bytes');
