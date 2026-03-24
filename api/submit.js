import { MongoClient } from 'mongodb';

// Cache the database connection
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
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const data = req.body;

        // Basic validation
        if (!data.fullName || !data.email || !data.netId || !data.quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Connect to MongoDB
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.warn('MONGODB_URI environment variable is not defined. Mocking success for preview.');
            return res.status(200).json({ 
                success: true, 
                message: 'Mock order submitted successfully (Add MONGODB_URI to save real data)',
                orderId: 'mock-id-' + Date.now() 
            });
        }

        const db = await connectToDatabase(uri);
        const collection = db.collection('Submissions');

        // Insert the order
        const result = await collection.insertOne({
            ...data,
            formId: data.formId || 'che-thai', // Default to che-thai if not provided
            paid: false,
            pickedUp: false,
            adminNotes: "",
            createdAt: new Date()
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Order submitted successfully',
            orderId: result.insertedId 
        });

    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
