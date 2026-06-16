const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/judge", async (req, res) => {
  const { scenario, answer } = req.body;

  if (!scenario || !answer) {
    return res.status(400).json({ error: "Missing scenario or answer" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are a dramatic survival judge for a Roblox game called "Death by AI".
A player is given a dangerous scenario and responds with their survival plan.
STRICT RULES:
- Keep everything PG and family friendly
- No gore or graphic descriptions
- Be funny and dramatic, modern humor, humoruous to both teens and children, sarcastic and slightly judgy at times
- Be fair but sometimes unpredictable. Come up with crazy solutions to how their idea failed or worked. 
You must:
1. Write 1-2 short fun dramatic sentences describing what happens to them.
2. Decide if they SURVIVED or DIED based on how smart/creative their answer was.
- Good creative answers should survive
- Bad stupid answers should die
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

    const resultMatch = text.match(/RESULT:\s*(.+)/);
    const outcomeMatch = text.match(/OUTCOME:\s*(SURVIVED|DIED)/);

    const result = resultMatch ? resultMatch[1].trim() : "Something happened...";
    const outcome = outcomeMatch ? outcomeMatch[1].trim() : "DIED";

    res.json({ result, outcome });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI call failed" });
  }
});

app.get("/", (req, res) => res.send("Proxy is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
