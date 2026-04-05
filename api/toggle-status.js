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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { adminPassword, formId, isOpen } = req.body;

        if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const targetFormId = formId || 'che-thai';

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            return res.status(400).json({ error: 'MongoDB URI not configured' });
        }

        const db = await connectToDatabase(uri);
        const configCollection = db.collection('Config');

        // Upsert the configuration
        await configCollection.updateOne(
            { formId: targetFormId },
            { $set: { isOpen: isOpen } },
            { upsert: true }
        );

        return res.status(200).json({ success: true, isOpen });

    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
