const express = require("express");
const axios = require("axios");
require("dotenv").config();

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());


// Verify webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});


// Receive comments
app.post("/webhook", async (req, res) => {

  const body = req.body;

  if (body.object === "page") {

    for (const entry of body.entry) {

      const changes = entry.changes;

      for (const change of changes) {

        if (change.field === "feed") {

          const commentText = change.value.message;
          const commentId = change.value.comment_id;

          if (commentText && commentId) {

            // Generate AI reply
            const ai = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "Reply like a friendly business page in short natural language."
                },
                {
                  role: "user",
                  content: commentText
                }
              ]
            });

            const replyText = ai.choices[0].message.content;

            // Reply publicly
            await axios.post(
              `https://graph.facebook.com/v19.0/${commentId}/comments`,
              {
                message: replyText,
                access_token: process.env.PAGE_ACCESS_TOKEN
              }
            );

            console.log("Replied:", replyText);
          }
        }
      }
    }
  }

  res.sendStatus(200);
});


app.listen(process.env.PORT, () => {
  console.log("Running on port " + process.env.PORT);
});