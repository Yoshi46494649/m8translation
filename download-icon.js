const https = require('https');
const fs = require('fs');
const path = require('path');

// Download a known working PNG icon from ServiceM8
const iconUrl = 'https://www.servicem8.com/images/addon-sdk-sample-icon.png';
const iconPath = path.join(__dirname, 'public', 'servicem8-translate-icon.png');

https.get(iconUrl, (response) => {
    const fileStream = fs.createWriteStream(iconPath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
        fileStream.close();
        console.log('Icon downloaded successfully to:', iconPath);
    });
}).on('error', (err) => {
    console.error('Download failed:', err);
    
    // Fallback: create a simple solid color PNG
    createSimplePNG();
});

function createSimplePNG() {
    // Create a simple 512x512 blue PNG
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    
    // Blue gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#007cba');
    gradient.addColorStop(1, '#0066a0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // White text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('T', 256, 300);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(iconPath, buffer);
    console.log('Fallback icon created at:', iconPath);
}