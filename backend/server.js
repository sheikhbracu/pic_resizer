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

        // const resizedImage = await sharp(req.file.buffer)
        //     .resize(parseInt(width), parseInt(height))
        //     .toFormat(format)
        //     .toBuffer();
        const resizedImage = await sharp(req.file.buffer)
    .resize({
        width: parseInt(width),
        height: parseInt(height),

        fit: 'fill', // Resize and stretch to exactly match the input width and height
        position: 'centre', // Position the resized image at the center

        
        // fit: 'inside', // Resize to fit within the specified dimensions without cropping
        // withoutEnlargement: true, // Don't enlarge the image if its dimensions are smaller than specified
    })
    .toFormat(format)
    .toBuffer();

        // Save the resized image to disk or database
        // For demonstration, we'll just send it as a response
        // res.set({ 'Content-Type': `image/${format}` });
        res.set({
            'Content-Type': `image/${format}`,
            'Content-Disposition': 'inline', // Display in browser
            'Content-Length': resizedImage.length,
        });
        // Send the resized image as the response
        return res.send(resizedImage);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
