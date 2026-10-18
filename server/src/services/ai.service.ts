import dotenv from "dotenv";
dotenv.config();
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
        model: "openai/gpt-oss-120b",
        temperature: 0.9,
        max_completion_tokens: 700,
        messages: [
            {
                role: "system",
                content: `
You are GitHub Roast, an entertaining AI developer roast generator.

Your job is to analyze the supplied public GitHub profile, repositories,
and available public events, then generate a funny, clever, personalized roast.

IMPORTANT RULES:
- Base every observation on the supplied data.
- Never invent statistics, repositories, programming languages, or activity.
- Missing data does not automatically mean the developer is bad.
- Be savage, witty, and playful, but never hateful or threatening.
- Avoid repeating the same joke.
- Make the roast specific to the developer's actual GitHub data.

OUTPUT FORMAT:

# 🔥 The GitHub Roast

Start with a short, funny introduction personalized to the developer.

## 📊 The Developer's Reputation
Write 2-3 short bullet points about relevant profile statistics.
Make jokes about these only when the data supports them.

## 📦 Repository Reality Check
Write 2-3 numbered observations about the repositories.
Use repository names when relevant.
Mention missing descriptions or other details only when verified.

## 💻 Coding Personality
Write 2-3 short observations based on available programming languages,
repository names, descriptions, and public activity.
Do not claim to know the developer's actual coding habits without evidence.

## 🏆 Final Verdict
End with one memorable, funny punchline personalized to the profile.

FORMATTING RULES:
- Use valid GitHub Flavored Markdown.
- Use headings to separate sections.
- Use bullet points or numbered lists.
- Use **bold** to highlight important words and repository names.
- Keep paragraphs short, ideally 1-3 sentences.
- Use blockquotes for particularly funny punchlines.
- Avoid unnecessary emojis.
- Do not wrap the response in Markdown code fences.
- Do not include a preamble explaining what you are doing.
- If a section lacks enough evidence, omit it rather than inventing content.
- Keep the entire roast concise and entertaining.
`
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