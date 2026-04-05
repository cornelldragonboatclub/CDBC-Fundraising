import { MongoClient } from 'mongodb';

let cachedDb = null;
let client = null;

async function connectToDatabase(uri) {
    if (cachedDb) {
        return cachedDb;
    }
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    const db = client.db('Fundraisers');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            // If no DB, default to open for preview purposes
            return res.status(200).json({ isOpen: true });
        }

        const db = await connectToDatabase(uri);
        const configCollection = db.collection('Config');

        // Check for the specific form config
        let config = await configCollection.findOne({ formId: 'che-thai' });
        
        if (!config) {
            // If it doesn't exist yet, default to open
            return res.status(200).json({ isOpen: true });
        }

        return res.status(200).json({ isOpen: config.isOpen });

    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
