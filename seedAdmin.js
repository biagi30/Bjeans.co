const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const password = await bcrypt.hash('admin123', 10);
  
  await db.collection('users').updateOne(
    { email: 'admin@bjeans.co' },
    { 
      $set: { 
        name: 'Admin', 
        email: 'admin@bjeans.co', 
        password, 
        role: 'admin', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      } 
    },
    { upsert: true }
  );
  
  console.log('Admin seeded! (admin@bjeans.co / admin123)');
  await client.close();
}

seed().catch(console.error);
