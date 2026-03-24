import { MongoClient } from 'mongodb';

let cachedDb = null;
let client = null;

async function connectToDatabase(uri) {
    if (cachedDb) return cachedDb;
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    const db = client.db('Fundraisers');
    cachedDb = db;
    return db;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Verify password via header
    const password = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'dragonboat2026';
    if (password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined');

        const db = await connectToDatabase(uri);
        const collection = db.collection('Submissions');

        const submissions = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return res.status(200).json({ success: true, submissions });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
