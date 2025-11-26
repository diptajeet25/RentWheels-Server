const express= require("express")
const cors=require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');

const app=express();


const port=process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Car-Rental:UQANfxfZKfsDO9lQ@cluster0.hm8fata.mongodb.net/?appName=Cluster0";

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();

    const carDB=client.db('cardb');
    const carCollection=carDB.collection('cars');

    app.get('/allcars',async(req,res)=>
    {
        const cursor=carCollection.find();
        const cars=await cursor.toArray();
        res.send(cars)
    })
    

    app.post('/cars',async(req,res)=>
    {
        const car=req.body;
         const result=await carCollection.insertOne(car);
            res.send(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
   // await client.close();
  }
}
run().catch(console.dir);
//

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})