import axios from "axios";

const GITHUB_API_URL="https://api.github.com";

const githubApi=axios.create({
    baseURL:GITHUB_API_URL,
    headers:{
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    },
});

export const getGithubProfile=async(username:string)=>{
    const response=await githubApi.get(`/users/${encodeURIComponent(username)}`);
    return response.data;
};

export const getGithubRepositories=async(username:string)=>{
    const response=await githubApi.get(`/users/${encodeURIComponent(username)}/repos`,{
        params:{
            sort:"updated",
            direction:"desc",
            per_page:10,
            type:"owner"
        },
    },
    );

       return response.data;
}

export const getGithubEvents=async(username:string)=>{
    const response=await githubApi.get(`/users/${encodeURIComponent(username)}/events/public`,{
        params:{
            per_page:30,
        },
    });

    return response.data;
}