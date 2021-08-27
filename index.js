/* eslint-disable operator-linebreak */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const URI =
  'mongodb+srv://kristina:Kristina123@cluster0.4o8st.mongodb.net/August2021Test?retryWrites=true&w=majority';

const client = new MongoClient(URI);

app.get('/', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('August2021Test')
      .collection('users')
      .find()
      .toArray();
    await con.close();
    return res.send(data);
  } catch (err) {
    res.status(500).send({ err });
  }
});

// GET /memberships
app.get('/memberships', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('August2021Test')
      .collection('services')
      .find()
      .toArray();
    await con.close();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'GET request failed', e: err });
  }
});

// POST /memberships
app.post('/memberships', async (req, res) => {
  if (!req.body.name || !req.body.price || !req.body.description) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }

  try {
    const con = await client.connect();
    const dbRes = await con
      .db('August2021Test')
      .collection('services')
      .insertOne({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
      });
    await con.close();
    return res.send(dbRes);
  } catch (err) {
    return res
      .status(500)
      .send({ error: 'POST membership request was refused' });
  }
});

// DELETE /memberships/:id
app.delete('/memberships/:id', async (req, res) => {
  try {
    const con = await client.connect();
    const dbRes = await con
      .db('August2021Test')
      .collection('services')
      .deleteOne({ _id: ObjectId(req.params.id) });
    await con.close();
    res.send(dbRes);
  } catch (e) {
    res.send(500).send({ error: 'DELETE request refused' });
  }
});

// POST /users/
app.post('/users', async (req, res) => {
  if (
    !req.body.name ||
    !req.body.surname ||
    !req.body.email ||
    !req.body.service_id
  ) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }

  try {
    const con = await client.connect();
    const dbRes = await con.db('August2021Test').collection('users').insertOne({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      service_id: req.body.service_id,
    });
    await con.close();
    return res.send(dbRes);
  } catch (err) {
    return res.status(500).send({ error: 'POST users request was refused' });
  }
});

// GET /users/:order?
// GET /users/asc
// GET /users/desc
// View users (paspaudus ant sort - pasikeičia filtravimas A-Z <-> Z-A)
app.get('/users/:order?', async (req, res) => {
  if (
    !req.params.order ||
    (req.params.order.toLocaleLowerCase() !== 'asc' &&
      req.params.order.toLocaleLowerCase() !== 'desc')
  ) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }

  try {
    const con = await client.connect();
    const data = await con
      .db('August2021Test')
      .collection('users')
      .find({})
      .sort({ name: req.params.order.toLowerCase() === 'desc' ? -1 : 1 })
      .toArray();
    await con.close();
    return res.send(data);
  } catch (err) {
    return res.status(500).send(err);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));
