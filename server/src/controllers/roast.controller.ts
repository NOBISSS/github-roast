import type { Request, Response } from "express";

import { roastCache } from "../cache/roast.cache.js";
import { deduplicateRequest } from "../cache/roast.request.js";

import {
    getGithubEvents,
    getGithubProfile,
    getGithubRepositories,
} from "../services/github.service";

import { generateRoast } from "../services/ai.service";

export const getRoastData = async (req: Request, res: Response) => {
    try {
        const username = String(req.params.username ?? "").trim();

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid GitHub username.",
            });
        }

        const cacheKey = username.toLowerCase();

        const cachedResult = roastCache.get(cacheKey);

        if (cachedResult) {
            return res.status(200).json({
                success: true,
                message: "Roast retrieved from cache! ⚡",
                data: cachedResult,
            });
        }

        //Reuse an existing in-progress request for this username
        const resultData = await deduplicateRequest(
            cacheKey,
            async () => {
                console.log(`[DEDUP] Starting new operation for: ${cacheKey}`);
                //Check the cache again in case another operation populated it
                const existingResult = roastCache.get(cacheKey);

                if (existingResult) {
                    console.log(`[CACHE] Result found for: ${cacheKey}`);
                    return existingResult;
                }

                //Fetch GitHub data.
                const [profile, repositories, events] = await Promise.all([
                    getGithubProfile(username),
                    getGithubRepositories(username),
                    getGithubEvents(username),
                ]);

                //Generate the AI roast.
                const roast = await generateRoast({
                    profile,
                    repositories,
                    events,
                });

                //Cache the completed result for 10 minutes.
                const data = {
                    profile,
                    repositories,
                    events,
                    roast,
                };

                roastCache.set(cacheKey, data, 10 * 60 * 1000);
                return data;
            },
        );

        return res.status(200).json({
            success: true,
            message: "Your GitHub roast is ready! 🔥",
            data: resultData,
        });
    } catch (error: unknown) {
        const status =
            typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof error.response === "object" &&
                error.response !== null &&
                "status" in error.response
                ? error.response.status
                : undefined;
        if (status === 404) {
            return res.status(404).json({
                success: false,
                message: "GitHub user not found. Check the username and try again.",
            });
        }
        console.error("Roast generation failed:", error);
        return res.status(502).json({
            success: false,
            message:
                "We couldn't generate your roast. Please try again in a moment.",
        });
    }
};
/*
                    Incoming request
                           |
                           v
                     Normalize name
                           |
                           v
                      Check cache
                      /          \
                   HIT            MISS
                    |               |
                    v               v
               Return result   Check pending requests
                                   /       \
                              Existing    New request
                                 |            |
                                 v            v
                              Wait       Fetch GitHub
                                 |            |
                                 |            v
                                 |        Generate roast
                                 |            |
                                 |            v
                                 |        Cache result
                                 |            |
                                 +------> Return result
*/