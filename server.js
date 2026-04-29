const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Comment Bot Running");
});

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "mytoken123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});