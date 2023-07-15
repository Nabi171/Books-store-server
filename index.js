require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.euxm4cs.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9x2y8za.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('book-catalogue');
    const productCollection = db.collection('books');

    app.get('/books', async (req, res) => {
      const cursor = productCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });

    app.post('/books', async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);

      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await productCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await productCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.put('/book/:id', async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
    
      try {
        const result = await productCollection.updateOne({ _id: ObjectId(id) }, { $set: updatedBook });
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error updating the book.');
      }
    });

    app.post('/review/:id', async (req, res) => {
      const productId = req.params.id;
      const review = req.body.review;

      // console.log(productId);
      // console.log(comment);

      const result = await productCollection.updateOne(
        { _id: ObjectId(productId) },
        { $push: { reviews: review} }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Product not found or review not added');
        res.json({ error: 'Product not found or review not added' });
        return;
      }

      console.log('review added successfully');
      res.json({ message: 'review added successfully' });
    });

    app.get('/review/:id', async (req, res) => {
      const productId = req.params.id;

      const result = await productCollection.findOne(
        { _id: ObjectId(productId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('wellcome to bookcatalogue!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
