const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs').promises;
const sharp = require('sharp');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('photos.db');

// Drop and recreate the table with the new schema
db.exec(`
    DROP TABLE IF EXISTS photos;
    
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size INTEGER,
        dimensions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Helper function to create directory if it doesn't exist
async function ensureDir(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

// Helper function to get date-based path
function getDateBasedPath(category, date) {
    const [year, month, day] = date.split('-');
    return path.join('uploads', 
        category,
        year,
        month,
        day
    );
}

// API Endpoints
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        console.log('Received upload request:', req.body);
        
        const { category, date } = req.body;
        if (!category || !date) {
            throw new Error('Category and date are required');
        }

        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Create date-based directory structure
        const datePath = getDateBasedPath(category, date);
        const thumbnailPath = path.join(datePath, 'thumbnails');
        await ensureDir(datePath);
        await ensureDir(thumbnailPath);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${req.file.originalname}`;
        const filepath = path.join(datePath, filename);
        const thumbFilename = `thumb-${filename}`;
        const thumbnailFilepath = path.join(thumbnailPath, thumbFilename);

        // Process and save original image
        const image = sharp(req.file.buffer);
        const metadata = await image.metadata();
        
        // Compress original image while maintaining reasonable quality
        await image
            .resize(2000, 2000, { 
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(filepath);

        // Generate and save thumbnail
        await image
            .resize(200, 200, { 
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 70 })
            .toFile(thumbnailFilepath);

        // Insert into database
        const stmt = db.prepare(`
            INSERT INTO photos (
                category, 
                date, 
                filename, 
                filepath, 
                thumbnail_path, 
                original_filename,
                file_size,
                dimensions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            category,
            date,
            filename,
            filepath,
            thumbnailFilepath,
            req.file.originalname,
            req.file.size,
            `${metadata.width}x${metadata.height}`
        );

        console.log('Upload successful, ID:', result.lastInsertRowid);

        res.json({
            success: true,
            id: result.lastInsertRowid,
            filename,
            filepath,
            thumbnailPath: thumbnailFilepath,
            category,
            date
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Get photos list
app.get('/api/photos', (req, res) => {
    try {
        const { category, date, page = 1, limit = 20 } = req.query;
        console.log('Fetching photos for:', { category, date, page, limit });
        
        const offset = (page - 1) * limit;
        let stmt;
        let countStmt;
        let photos;
        let totalCount;

        if (category && date) {
            stmt = db.prepare(
                'SELECT id, category, date, filename, filepath, thumbnail_path, dimensions, created_at FROM photos WHERE category = ? AND date = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
            );
            photos = stmt.all(category, date, limit, offset);
            
            countStmt = db.prepare('SELECT COUNT(*) as count FROM photos WHERE category = ? AND date = ?');
            totalCount = countStmt.get(category, date).count;
        } else {
            stmt = db.prepare(
                'SELECT id, category, date, filename, filepath, thumbnail_path, dimensions, created_at FROM photos ORDER BY created_at DESC LIMIT ? OFFSET ?'
            );
            photos = stmt.all(limit, offset);

            countStmt = db.prepare('SELECT COUNT(*) as count FROM photos');
            totalCount = countStmt.get().count;
        }

        console.log(`Found ${photos.length} photos`);

        res.json({
            photos,
            total: totalCount,
            page: parseInt(page),
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete photo
app.delete('/api/photos/:id', async (req, res) => {
    try {
        const photoId = req.params.id;
        console.log('Delete request for photo ID:', photoId);

        if (!photoId) {
            return res.status(400).json({ error: 'Photo ID is required' });
        }

        // First get photo info
        const getStmt = db.prepare('SELECT filepath, thumbnail_path FROM photos WHERE id = ?');
        const photo = getStmt.get(photoId);

        if (!photo) {
            console.log('Photo not found for deletion, ID:', photoId);
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Delete the files
        try {
            await fs.unlink(photo.filepath);
            await fs.unlink(photo.thumbnail_path);
        } catch (error) {
            console.error('Error deleting files:', error);
        }

        // Delete from database
        const deleteStmt = db.prepare('DELETE FROM photos WHERE id = ?');
        const result = deleteStmt.run(photoId);
        
        console.log('Photo deleted successfully, ID:', photoId);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://192.168.50.212:${PORT}`);
    console.log('Database initialized and ready');
});

// Handle cleanup on shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close();
    process.exit();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    db.close();
    process.exit(1);
});

// Handle promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    db.close();
    process.exit(1);
});