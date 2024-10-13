const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { removeAllFilesInDir } = require('./utils/file-handler.js')

// Create uploads directory if not exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
} else {
    removeAllFilesInDir(uploadDir)
}

// Create output directory if not exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
} else {
    removeAllFilesInDir(outputDir)
}

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set up multer for file handling (save images to 'uploads' folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Route to upload and process images
app.post('/upload', upload.array('images', 50), async (req, res) => {
    try {
        const files = req.files;
        const { width, quality } = req.body;

        if (!files || !width || !quality) {
            return res.status(400).send('Missing files, width, or quality.');
        }

        const numericWidth = parseInt(width, 10);
        const numericQuality = parseInt(quality, 10);

        if (isNaN(numericWidth) || isNaN(numericQuality) || numericQuality < 1 || numericQuality > 100) {
            return res.status(400).send('Invalid width or quality values.');
        }

        // Process each image (resize and convert to WebP)
        const promises = files.map((file) => {
            const outputFilePath = path.join(outputDir, `${path.parse(file.originalname).name}.webp`);

            return sharp(file.path)
                .resize(numericWidth) // Resize to custom width
                .toFormat('webp', { quality: numericQuality }) // Convert to WebP with custom quality
                .toFile(outputFilePath);
        });

        await Promise.all(promises);

        res.send('Images processed and converted to WebP successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing images.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});