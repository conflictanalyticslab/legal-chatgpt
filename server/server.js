const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/federationmetadata/saml20',express.static(__dirname + '/metadata')); //Serves resources from public folder


//authentication schema
const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .pattern(/^[a-zA-Z0-9._%+-]+@queensu\.ca$/)
    .messages({
      'string.pattern.base': 'Email must be a valid queensu.ca email address.',
    }),
});

app.post('/authenticate', (req, res) => {
  const validationResult = emailSchema.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error.details[0].message);
  }

  res.status(200).send('Authentication successful!');
});

app.post('/api/query', async (req, res) => {
  const data = req.body;

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        headers: {
          Authorization: `Bearer ${process.env.MODEL_API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error processing the request' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});