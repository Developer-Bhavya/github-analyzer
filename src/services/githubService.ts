import axios, { AxiosError, AxiosResponse } from "axios";

const GITHUB_API_URL = "https://api.github.com";

const axiosInstance = axios.create({
  headers: { /* Authorization: "token YOUR_TOKEN" */ }, // Uncomment and add your token if needed
});

export interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface CommitActivityWeek {
  week: number; // Unix timestamp in seconds
  days: number[]; // Array of 7 numbers representing commits per day in a week
  total: number; // Total commits in the week
}

export interface CommitData {
  date: string;
  count: number;
}

export const getUserRepositories = async (username: string): Promise<Repository[]> => {
  const response = await axiosInstance.get(`${GITHUB_API_URL}/users/${username}/repos?per_page=100`);
  return response.data;
};

export const getCombinedCommitData = async (username: string): Promise<CommitData[]> => {
  try {
    const repos = await getUserRepositories(username);
    const reposToFetch = repos.slice(0, 5); // Limit to 5 repos
    console.log("Repositories to fetch commit data:", reposToFetch.map(r => r.name));

    const commitDataPromises = reposToFetch.map((repo: Repository) =>
      axiosInstance
        .get<CommitActivityWeek[]>(`${GITHUB_API_URL}/repos/${username}/${repo.name}/stats/commit_activity`)
        .then((res: AxiosResponse<CommitActivityWeek[]>) => {
          console.log(`Commit activity for ${repo.name}:`, res.data);
          return res.data;
        })
        .catch((err: AxiosError) => {
          console.error(`Error fetching commit data for ${repo.name}:`, err);
          return [];
        })
    );

    const repoCommitData = await Promise.all(commitDataPromises);
    console.log("Raw commit data from all repos:", repoCommitData);

    const commitMap = new Map<string, number>();
    repoCommitData.forEach((weeklyData: CommitActivityWeek[]) => {
      if (weeklyData && Array.isArray(weeklyData)) {
        weeklyData.forEach((week: CommitActivityWeek) => {
          const weekStart = new Date(week.week * 1000);
          week.days.forEach((count: number, dayIndex: number) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + dayIndex);
            const dateStr = date.toISOString().split("T")[0];
            const existing = commitMap.get(dateStr) || 0;
            commitMap.set(dateStr, existing + count);
          });
        });
      }
    });

    const finalCommitData = Array.from(commitMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    console.log("Final Commit Data:", finalCommitData);

    return finalCommitData;
  } catch (error: any) {
    console.error("Error fetching commit data:", error);
    return [];
  }
};
