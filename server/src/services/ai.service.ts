import dotenv from "dotenv";
dotenv.config();
import { ApiError } from "../utils/apiError.js";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from the environment variables.");
}

const groq = new Groq({
    apiKey,
    timeout: 30_000,
    maxRetries: 1,
});

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
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            temperature: 0.9,
            max_completion_tokens: 700,
            messages: [
                {
                    role: "system",
                    content: `
You are GitHub Roast, an entertaining AI developer roast generator.

Analyze the supplied public GitHub profile, repositories, and available
public events. Generate a funny, clever, personalized roast.

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
- Use headings, bullet points, numbered lists, and bold text.
- Keep paragraphs short.
- Use blockquotes for particularly funny punchlines.
- Do not wrap the response in Markdown code fences.
- Omit sections that lack sufficient evidence.
- Keep the roast concise and entertaining.
`,
                },
                {
                    role: "user",
                    content: JSON.stringify(compactData),
                },
            ],
        });
        const roast = completion.choices[0]?.message?.content?.trim();
        if (!roast) {
            throw new ApiError(
                502,
                "The AI returned an empty roast. Please try again.",
            );
        }
        return roast;
    } catch (error: unknown) {
        // Preserve errors that have already been classified.
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Groq.APIError) {
            const status = error.status;

            if (status === 429) {
                throw new ApiError(
                    429,
                    "The AI service is busy. Please try again later.",
                );
            }

            if (status === 401 || status === 403) {
                console.error("Groq authentication or permission failure:", {
                    status,
                    requestID: error.requestID,
                });

                throw new ApiError(
                    503,
                    "The AI service is temporarily unavailable.",
                );
            }

            if (status === 404) {
                console.error("Configured Groq model was not found.", {
                    requestID: error.requestID,
                });

                throw new ApiError(
                    503,
                    "The AI service is temporarily unavailable.",
                );
            }

            console.error("Groq API request failed:", {
                status,
                requestID: error.requestID,
            });

            throw new ApiError(
                502,
                "The AI service could not generate your roast.",
            );
        }

        if (
            error instanceof Error &&
            (error.name === "APIConnectionTimeoutError" ||
                error.name === "TimeoutError")
        ) {
            throw new ApiError(
                504,
                "The AI request timed out. Please try again.",
            );
        }

        if (error instanceof Error && error.name === "APIConnectionError") {
            throw new ApiError(
                503,
                "Unable to connect to the AI service. Please try again later.",
            );
        }

        console.error("Unexpected AI service error:", error);

        throw new ApiError(
            500,
            "An unexpected error occurred while generating your roast.",
        );
    }
};