const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

// 📤 Écriture dans Airtable
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

// 📥 Lecture depuis Airtable avec filtre simple
app.post('/read', async (req, res) => {
  const { table, filter } = req.body;

  if (!table || !filter) {
    return res.status(400).json({ error: 'Champs "table" et "filter" requis.' });
  }

  try {
    // Transforme le premier filtre en formule Airtable (FIND)
    const [field, value] = Object.entries(filter)[0];
    const filterFormula = `FIND("${value}", {${field}})`;

    const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`, {
      params: {
        filterByFormula: filterFormula
      },
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    res.json({ records: response.data.records });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// 🆗 Test simple GET /
app.get('/', (req, res) => {
  res.send('API Airtable Radiasud - OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
