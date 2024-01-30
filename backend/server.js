const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { width, height, format } = req.body;

        if (!width || !height || !format) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const resizedImage = await sharp(req.file.buffer)
            .resize({
                width: parseInt(width),
                height: parseInt(height),
                fit: 'fill', // Resize and stretch to exactly match the input width and height
                position: 'centre', // Position the resized image at the center
            })
            .toFormat(format)
            .toBuffer();

        res.set({
            'Content-Type': `image/${format}`,
            'Content-Disposition': 'inline', // Display in browser
            'Content-Length': resizedImage.length,
        });

        return res.send(resizedImage);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
app.use(express.static(frontendBuildPath));

// Serve the React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
