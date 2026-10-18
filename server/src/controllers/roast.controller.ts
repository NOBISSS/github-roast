import type { Request,Response } from "express";

import{
    getGithubEvents,
    getGithubProfile,
    getGithubRepositories
} from "../services/github.service";

import { generateRoast } from "../services/ai.service";

export const getRoastData = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid GitHub username.",
      });
    }

    const [profile, repositories, events] = await Promise.all([
      getGithubProfile(username),
      getGithubRepositories(username),
      getGithubEvents(username),
    ]);

    const roast = await generateRoast({
      profile,
      repositories,
      events,
    });

    return res.status(200).json({
      success: true,
      message: "Your GitHub roast is ready! 🔥",
      data: {
        profile,
        repositories,
        events,
        roast,
      },
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

// export const getRoastData=async(req:Request,res:Response)=>{
//     try{
//         const username=req.params.username;
//         if(!username || typeof username !== "string"){
//             return res.status(400).json({
//                 success:false,
//                 message:"Please Provide a Valid Github username"
//             });
//         }

//         const [profile,repositories,events]=await Promise.all([
//             getGithubProfile(username),
//             getGithubRepositories(username),
//             getGithubEvents(username),
//         ])

//         return res.status(200).json({
//             success:true,
//             message:"Github data fetched successfully",
//             data:{
//                 profile,
//                 repositories,
//                 events,
//             }
//         });
//     }catch(error:unknown){
//         if (axiosIsNotFound(error)) {
//             return res.status(404).json({
//                 success: false,
//                 message: "GitHub user not found. Check the username and try again.",
//             });
//         }

//         console.error("GitHub API error:", error);

//         return res.status(502).json({
//             success: false,
//             message: "Unable to fetch GitHub data. Please try again later.",
//         });
//     }
// };

function axiosIsNotFound(error: unknown): boolean {
     return (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "status" in error.response &&
        error.response.status === 404
    );
}