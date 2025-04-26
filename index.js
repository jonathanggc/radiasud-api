const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

// 📤 Route /write : envoie des données dans Airtable
app.post('/write', async (req, res) => {
  const { table, data } = req.body;

  if (!table || !data) {
    return res.status(400).json({ error: "Champs 'table' et 'data' requis." });
  }

  try {
    const response = await axios.post(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`,
      { fields: data },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ status: 'ok', recordId: response.data.id });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// 📥 Route /read : lit les données Airtable avec ou sans filtre
app.post('/read', async (req, res) => {
  let { table, filter } = req.body;

  if (!table) {
    return res.status(400).json({ error: 'Le champ "table" est requis.' });
  }

  try {
    const params = {};

    // 🧠 Gérer le filtre facultatif
    if (filter && Object.keys(filter).length > 0) {
      if (typeof filter === 'string') {
        try {
          filter = JSON.parse(filter);
        } catch (err) {
          return res.status(400).json({ error: 'Filtre JSON invalide.' });
        }
      }
      const [field, value] = Object.entries(filter)[0];
      params.filterByFormula = `FIND("${value}", {${field}})`;
    }

    const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`, {
      params,
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    res.json({ records: response.data.records });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// ✅ Route GET de test
app.get('/', (req, res) => {
  res.send('API Airtable Radiasud - OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

