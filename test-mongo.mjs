// test-mongo.mjs
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('MONGODB_URI exists:', !!uri);
console.log('URI starts with:', uri ? uri.substring(0, 20) + '...' : 'No URI');

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    console.log('🔄 Connecting to MongoDB...');
    
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db('dealsDB');
    console.log('📊 Database "dealsDB" accessed');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
