const express= require("express")
const cors=require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app=express();


const port=process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hm8fata.mongodb.net/?appName=Cluster0`;

app.get('/', (req, res) => {
  res.send('Hey Start With Car Rental')
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
    
    // await client.connect();

    const carDB=client.db('cardb');
    const carCollection=carDB.collection('cars'); 
    const bookingCollection=carDB.collection('carsbooking')

app.get('/allcars', async (req, res) => {
  try {
    const search = req.query.search || ""
    const category = req.query.category || ""
    const status = req.query.status || ""
    const sort = req.query.sort || ""
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8
    const skip = (page - 1) * limit

    const matchQuery = {}

    if (search) {
      matchQuery.carName = { $regex: search, $options: "i" }
    }
    if (category) {
      matchQuery.category = category
    }
    if (status) {
      matchQuery.status = status
    }

    let sortStage = {}
    if (sort === "priceAsc") sortStage = { rentNum: 1 }
    else if (sort === "priceDesc") sortStage = { rentNum: -1 }
    else if (sort === "latest") sortStage = { createdAt: -1 }

    const totalCount = await carCollection.countDocuments(matchQuery)

    const cars = await carCollection.aggregate([
      { $match: matchQuery },
      { $addFields: { rentNum: { $toInt: "$rent" } } },
      { $sort: Object.keys(sortStage).length ? sortStage : { _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray()

    res.send({
      cars,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    })
  } catch (error) {
    res.status(500).send({ message: "Server Error" })
  }
})

app.get('/dashboard/car-stats', async (req, res) => {
  try {
    const totalCars = await carCollection.countDocuments()
    const bookedCars = await carCollection.countDocuments({ status: "Booked" })
    const availableCars = await carCollection.countDocuments({ status: "Available" })
    const suvCars = await carCollection.countDocuments({ category: "SUV" })
    const sedanCars = await carCollection.countDocuments({ category: "Sedan" })
    const hatchbackCars = await carCollection.countDocuments({ category: "Hatchback" })
    const electricCars = await carCollection.countDocuments({ category: "Electric" })
    const luxuryCars = await carCollection.countDocuments({ category: "Luxury" })

    res.send({
      totalCars,
      bookedCars,
      availableCars,
      suvCars,
      sedanCars,
      hatchbackCars,
      electricCars,
      luxuryCars
    })
  } catch (error) {
    res.status(500).send({ message: "Failed to load dashboard stats" })
  }
})



    app.get('/latestcars',async(req,res)=>
    {
      const cursor=carCollection.find().sort({createdAt:-1}).limit(8);
      const cars=await cursor.toArray()
      res.send(cars)
    })
    app.get('/cardetails/:id',async(req,res)=>
    {
      const id=req.params.id
    

      const query={_id:new ObjectId(id)}
       const car=await carCollection.findOne(query);
     res.send(car);
    })
    app.get('/mycars',async(req,res)=>
    {
      const email=req.query.email;
  
      const query={}
      query.providerEmail=email;
      const cursor= carCollection.find(query)
      const cars=await cursor.toArray()
      res.send(cars)

    })
    app.get('/mybooking',async(req,res)=>
    {
      const email = req.query.email;
      const query={}
      query.bookedby=email;
      const cursor=bookingCollection.find(query)
       const mybooking=await cursor.toArray();
       res.send(mybooking)
      
    })

    app.post('/cars',async(req,res)=>
    {
        const car=req.body;
         const result=await carCollection.insertOne(car);
            res.send(result);

    })

    app.post('/bookingcars',async(req,res)=>
    {
      const newBooking=req.body;
      const result=await bookingCollection.insertOne(newBooking);
      res.send(result)
    })
    app.patch('/bookcar',async(req,res)=>
    {
      const id=req.body._id
      
      const filter={_id: new ObjectId(id)}
     
      const result =await carCollection.updateOne(filter,{$set: {status:req.body.status}})
res.send(result);
    })


    app.patch('/updatecars',async(req,res)=>
    {
      const updatedCar=req.body
      const id=updatedCar._id
     
       const filter = { _id: new ObjectId(id) };
       delete updatedCar._id;

  const result = await carCollection.updateOne(
    filter,
    { $set: updatedCar }
  );
      res.send(result)

     
    })
    app.delete('/cars/:id',async(req,res)=>
    {
       const id=req.params.id;
      
     const query={_id:new ObjectId(id)};
     const result=await carCollection.deleteOne(query);
     res.send(result)
          
    })
    app.delete('/booking/:id',async(req,res)=>
    {
      const id=req.params.id;
     
     const query={_id:new ObjectId(id)};
     const result=await bookingCollection.deleteOne(query);
     res.send(result);
    })
    
    // await client.db("admin").command({ ping: 1 });
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