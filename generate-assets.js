const sharp = require('sharp');
const path = require('path');

var inputFile = path.join(__dirname, 'assets', 'source.png');
var assetsDir = path.join(__dirname, 'assets');

async function generate() {
    console.log('Reading source image...');

    await sharp(inputFile)
        .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(assetsDir, 'icon.png'));
    console.log('icon.png done');

    await sharp(inputFile)
        .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('adaptive-icon.png done');

    await sharp(inputFile)
        .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .extend({
            top: 624,
            bottom: 624,
            left: 624,
            right: 624,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(path.join(assetsDir, 'splash.png'));
    console.log('splash.png done');

    await sharp(inputFile)
        .resize(196, 196, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('favicon.png done');

    console.log('\nAll assets generated successfully!');
}

generate().catch(function (err) {
    console.error('Error:', err);
    process.exit(1);
});