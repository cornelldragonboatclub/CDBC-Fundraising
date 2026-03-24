import { MongoClient, ObjectId } from 'mongodb';

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
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const password = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'dragonboat2026';
    if (password !== adminPassword) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Missing id' });
        }

        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined');

        const db = await connectToDatabase(uri);
        const collection = db.collection('Submissions');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
