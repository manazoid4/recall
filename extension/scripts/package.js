const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(__dirname, '..', 'saved-brain-extension.zip');
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created: saved-brain-extension.zip (${(archive.pointer() / 1024).toFixed(1)} KB)`);
});

archive.pipe(output);
archive.glob('**/*', { cwd: distDir });
archive.finalize();