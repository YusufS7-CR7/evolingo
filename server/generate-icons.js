/**
 * Generates PWA icons (192x192 and 512x512) as PNG files
 * using the Canvas API built into Node.js via the 'canvas' package.
 * Run: node generate-icons.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const radius = size * 0.18;

    // Background: emerald green
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle inner glow
    const gradient = ctx.createRadialGradient(size * 0.35, size * 0.3, 0, size / 2, size / 2, size * 0.6);
    gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    // Letter "E"
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.55}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', size / 2, size / 2 + size * 0.03);

    // Small lightning bolt accent (top-right)
    const boltSize = size * 0.18;
    const bx = size * 0.68;
    const by = size * 0.12;
    ctx.fillStyle = '#fbbf24'; // yellow
    ctx.beginPath();
    ctx.moveTo(bx + boltSize * 0.5, by);
    ctx.lineTo(bx, by + boltSize * 0.55);
    ctx.lineTo(bx + boltSize * 0.4, by + boltSize * 0.45);
    ctx.lineTo(bx - boltSize * 0.1, by + boltSize);
    ctx.lineTo(bx + boltSize * 0.4, by + boltSize * 0.5);
    ctx.lineTo(bx + boltSize * 0.1, by + boltSize * 0.5);
    ctx.closePath();
    ctx.fill();

    return canvas.toBuffer('image/png');
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
    const buffer = drawIcon(size);
    const outPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ Generated ${outPath}`);
}

console.log('PWA icons generated successfully!');
