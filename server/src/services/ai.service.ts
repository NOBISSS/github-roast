import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing from the environment variables.");
}

const groq = new Groq({ apiKey });

interface RoastInput {
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
  };
  repositories: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
  }>;
  events: Array<{
    type: string;
    created_at: string;
    repo: {
      name: string;
    };
  }>;
}

export const generateRoast = async (data: RoastInput): Promise<string> => {
  const compactData = {
    profile: {
      username: data.profile.login,
      name: data.profile.name,
      bio: data.profile.bio,
      publicRepositories: data.profile.public_repos,
      followers: data.profile.followers,
      following: data.profile.following,
    },
    repositories: data.repositories.map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    })),
    recentActivity: data.events.map((event) => ({
      type: event.type,
      date: event.created_at,
      repository: event.repo.name,
    })),
  };

  const completion = await groq.chat.completions.create({
    // Verify that this model is available to your Groq account.
    model: "llama-3.3-70b-versatile",
    temperature: 0.9,
    max_completion_tokens: 700,
    messages: [
      {
        role: "system",
        content: `
You are GitHub Roast, a witty and savage developer roast comedian.

Your task is to generate a personalized, funny roast based on publicly
available GitHub profile information, repositories, and recent activity.

Rules:
- Be funny, specific, creative, and sarcastic.
- Use the supplied data rather than inventing facts.
- You may make playful jokes about low stars, repository descriptions,
  language choices, and visible activity.
- Do not claim to know private activity or the user's complete coding history.
- Do not treat missing data as proof of incompetence.
- Never invent projects, commit counts, achievements, or personal details.
- Keep the roast playful rather than hateful or threatening.
- Return only the roast, with no introduction about being an AI.
- Format the roast with a catchy heading and 5-8 short roast lines.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify(compactData),
      },
    ],
  });

  const roast = completion.choices[0]?.message?.content?.trim();

  if (!roast) {
    throw new Error("The AI returned an empty roast.");
  }

  return roast;
};