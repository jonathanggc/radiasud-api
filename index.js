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

    if (filter && typeof filter === 'object') {
      let formulaParts = [];

      for (let field in filter) {
        const value = filter[field];

        if (typeof value === 'object' && value.between) {
          // Gestion des dates : { DateIntervention: { between: [date1, date2] } }
          const [start, end] = value.between;
          formulaParts.push(`AND(IS_AFTER({${field}}, "${start}"), IS_BEFORE({${field}}, "${end}"))`);
        } else {
          // Gestion classique : FIND
          formulaParts.push(`FIND("${value}", {${field}})`);
        }
      }

      if (formulaParts.length > 0) {
        params.filterByFormula = `AND(${formulaParts.join(',')})`;
      }
    }

    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
      }
    );

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

