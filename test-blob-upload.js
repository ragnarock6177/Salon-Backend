import fs from 'fs';
import path from 'path';

async function testUpload() {
    const filePath = path.resolve('test-image.png');
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', blob, 'test-image.png');

    try {
        console.log('Uploading test-image.png to http://localhost:3000/api/upload/blob...');
        const response = await fetch('http://localhost:3000/api/upload/blob', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        console.log('Upload successful!');
        console.log('Blob URL:', data.url);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testUpload();
