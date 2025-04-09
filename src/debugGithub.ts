import axios from 'axios';

// Define the Repository interface
interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

// Function to fetch commit data and print detailed logs
export const debugCommitData = async (username: string): Promise<void> => {
  console.log(`Starting debug for username: ${username}`);
  
  try {
    // 1. Fetch repositories
    console.log('Fetching repositories...');
    const reposResponse = await axios.get<Repository[]>(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos: Repository[] = reposResponse.data;
    console.log(`Found ${repos.length} repositories`);
    
    // 2. Take first 3 repos for testing
    const testRepos = repos.slice(0, 3);
    console.log('Testing with repos:', testRepos.map((r: Repository) => r.name));
    
    // 3. Fetch commit activity for each repo
    for (const repo of testRepos) {
      console.log(`\nFetching commit activity for ${repo.name}...`);
      try {
        interface CommitActivityWeek {
          week: number;
          total: number;
          days: number[];
        }
        
        const commitResponse = await axios.get<CommitActivityWeek[]>(
          `https://api.github.com/repos/${username}/${repo.name}/stats/commit_activity`
        );
        
        const commitData = commitResponse.data;
        console.log(`Response status: ${commitResponse.status}`);
        console.log(`Data type: ${typeof commitData}, Is Array: ${Array.isArray(commitData)}`);
        console.log(`Data length: ${commitData.length}`);
        
        if (commitData.length > 0) {
          // Print sample week
          const sampleWeek = commitData[0];
          console.log('Sample week structure:', {
            week: new Date(sampleWeek.week * 1000).toISOString(),
            total: sampleWeek.total,
            days: sampleWeek.days
          });
        }
      } catch (err: any) {
        console.error(`Error fetching commit data for ${repo.name}:`, err.message);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }
      }
    }
    
    console.log('\nDebug completed');
  } catch (err: any) {
    console.error('Debug failed:', err.message);
  }
};

// Make the function available globally for browser console
(window as any).debugCommitData = debugCommitData;