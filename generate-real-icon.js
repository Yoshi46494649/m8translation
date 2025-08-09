const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using Canvas API simulation
function createPNGIcon() {
    // This creates a minimal valid PNG file
    const width = 512;
    const height = 512;
    
    // PNG file signature
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8);  // bit depth
    ihdrData.writeUInt8(2, 9);  // color type (RGB)
    ihdrData.writeUInt8(0, 10); // compression
    ihdrData.writeUInt8(0, 11); // filter
    ihdrData.writeUInt8(0, 12); // interlace
    
    const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
    const ihdrChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 13]), // length
        Buffer.from('IHDR'),
        ihdrData,
        Buffer.from([ihdrCrc >> 24, (ihdrCrc >> 16) & 0xFF, (ihdrCrc >> 8) & 0xFF, ihdrCrc & 0xFF])
    ]);
    
    // Create simple blue gradient image data
    const imageData = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 3;
            const centerX = width / 2;
            const centerY = height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
            const ratio = distance / maxDistance;
            
            imageData[i] = Math.floor(0 + (127 * ratio));     // Red
            imageData[i + 1] = Math.floor(124 + (66 * ratio)); // Green  
            imageData[i + 2] = Math.floor(186 - (26 * ratio)); // Blue
        }
    }
    
    // Compress image data (simplified)
    const zlib = require('zlib');
    const deflated = zlib.deflateSync(imageData);
    
    const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), deflated]));
    const idatChunk = Buffer.concat([
        Buffer.from([
            (deflated.length >> 24) & 0xFF,
            (deflated.length >> 16) & 0xFF, 
            (deflated.length >> 8) & 0xFF,
            deflated.length & 0xFF
        ]),
        Buffer.from('IDAT'),
        deflated,
        Buffer.from([idatCrc >> 24, (idatCrc >> 16) & 0xFF, (idatCrc >> 8) & 0xFF, idatCrc & 0xFF])
    ]);
    
    // IEND chunk
    const iendCrc = crc32(Buffer.from('IEND'));
    const iendChunk = Buffer.concat([
        Buffer.from([0, 0, 0, 0]), // length
        Buffer.from('IEND'),
        Buffer.from([iendCrc >> 24, (iendCrc >> 16) & 0xFF, (iendCrc >> 8) & 0xFF, iendCrc & 0xFF])
    ]);
    
    return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(data) {
    const table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }
    
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate and save the icon
const iconBuffer = createPNGIcon();
const iconPath = path.join(__dirname, 'public', 'servicem8-icon.png');

fs.writeFileSync(iconPath, iconBuffer);
console.log('PNG icon created at:', iconPath);