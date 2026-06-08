const mongoose = require('c:/Informatika/Semester 6/TEORI/TEKWEB/TUBES/Bjeans.co/node_modules/mongoose');

const MONGODB_URI = 'mongodb://biagihandana30:yatim123@ac-xio2sog-shard-00-00.xq5ibyw.mongodb.net:27017,ac-xio2sog-shard-00-01.xq5ibyw.mongodb.net:27017,ac-xio2sog-shard-00-02.xq5ibyw.mongodb.net:27017/bjeans?ssl=true&replicaSet=atlas-2oxmc2-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log('Products found:');
    products.forEach(p => {
      console.log(`- Product: ${p.name}`);
      console.log(`  Images: ${JSON.stringify(p.images?.map(img => img.slice(0, 100)))}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
