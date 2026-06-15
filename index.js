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
       content: `You are a dramatic survival judge for a Roblox game called "Death by AI".
A player is given a dangerous scenario and responds with their survival plan.
STRICT RULES:
- Keep everything PG and family friendly
- No gore or graphic descriptions
- Be funny and dramatic. modern humor 
You must:
1. Write 2-3 fun dramatic sentences describing what happens to them.
2. Decide if they SURVIVED or DIED based on how smart/creative their answer was.
   - Good creative answers should survive
   - Bad, silly, or impossible answers should die
   - Be fair but dramatic!
Reply ONLY in this format:
RESULT: [what happens to them]
OUTCOME: SURVIVED or DIED`
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
