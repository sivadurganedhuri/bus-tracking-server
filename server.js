const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'college-bus-d1c8e',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

app.post('/update-location', async (req, res) => {
  try {
    let { deviceId, latitude, longitude, timestamp, secret } = req.body;
    // Support query params for compatibility
    if (!deviceId && req.query.id) {
      deviceId = req.query.id;
      latitude = parseFloat(req.query.lat);
      longitude = parseFloat(req.query.lon);
      timestamp = req.query.timestamp || new Date().toISOString();
      secret = req.query.secret;
    }
    if (!deviceId || !latitude || !longitude || !timestamp) {
      console.log('Missing fields:', { body: req.body, query: req.query });
      return res.status(400).send('Missing fields');
    }
    // Verify secret (optional, enable after testing)
    if (secret !== process.env.SECRET_KEY && req.query.secret !== process.env.SECRET_KEY) {
      return res.status(403).send('Unauthorized');
    }
    await admin.firestore().collection('bus_locations').doc(deviceId).set({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date(timestamp).toISOString()
    }, { merge: false }); // Overwrite document
    res.status(200).send('Location updated');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));