const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // we set this secretly on Render
});

app.post("/judge", async (req, res) => {
  const { scenario, answer } = req.body;

  if (!scenario || !answer) {
    return res.status(400).json({ error: "Missing scenario or answer" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content: `You are a funny, family-friendly survival judge for a Roblox game for all ages.
STRICT RULES:
- No swearing or profanity ever
- No violence, gore, or death descriptions
- No inappropriate or adult content
- Keep everything fun, silly, and PG
- If a player's scenario or answer is inappropriate, give them 0 points and say something like "The judges disapprove of that answer!"
A player is given a survival scenario and responds with their plan.
You must:
1. Write 2-3 fun silly sentences describing what happens because of their choice.
2. Give a score from 5 to 50 based on how smart/creative their answer was. Creative answers should be rewarded, you should be fair but unpredictable.
Reply ONLY in this format:
RESULT: [what happens to them]
SCORE: [number]`
        },
        {
          role: "user",
          content: `Scenario: ${scenario}\nPlayer's answer: ${answer}`
        }
      ]
    });

    const text = completion.choices[0].message.content;

    // Parse the result and score out of the response
    const resultMatch = text.match(/RESULT:\s*(.+)/);
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);

    const result = resultMatch ? resultMatch[1].trim() : "Something happened...";
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    res.json({ result, score });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI call failed" });
  }
});

app.get("/", (req, res) => res.send("Proxy is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
