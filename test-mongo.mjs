// test-mongo.mjs
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://appuser:xm7emnROHQTRMK9P@deals-cluster.aczhxea.mongodb.net/dealsDB?retryWrites=true&w=majority";

const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("✅ Connected!");
  const db = client.db("dealsDB");
  const count = await db.collection("offers").countDocuments();
  console.log(`📦 Offers in DB: ${count}`);
} catch (err) {
  console.error("❌ Connection failed:", err);
} finally {
  await client.close();
}
