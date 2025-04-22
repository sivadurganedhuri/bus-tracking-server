const express = require("express");
const admin = require("firebase-admin");
const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "college-bus-d1c8e",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

app.post("/update-location", async (req, res) => {
  try {
    const { deviceId, latitude, longitude, timestamp } = req.body;
    if (!deviceId || !latitude || !longitude || !timestamp)
      return res.status(400).send("Missing fields");
    await admin
      .firestore()
      .collection("bus_locations")
      .doc(deviceId)
      .set(
        {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date(timestamp).toISOString(),
        },
        { merge: false }
      );
    res.status(200).send("Location updated");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});

app.listen(process.env.PORT || 3000);
