import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';

// Define interfaces
interface CommitData {
  date: string;
  count: number;
}

interface CommitActivityWeek {
  week: number;
  days: number[];
  total: number;
}

interface GithubCommitChartProps {
  username: string;
}

// Function to get color based on commit count (similar to GitHub's coloring)
const getColor = (count: number) => {
  if (count === 0) return '#ebedf0';
  if (count <= 2) return '#9be9a8';
  if (count <= 5) return '#40c463';
  return '#216e39';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', padding: '8px', border: '1px solid #ccc' }}>
        <p>{`${payload[0].payload.date}: ${payload[0].value} commits`}</p>
      </div>
    );
  }
  return null;
};

const GithubCommitChart: React.FC<GithubCommitChartProps> = ({ username }) => {
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommitData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch repositories
        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=10`);
        const repos = reposResponse.data;
        
        // 2. Fetch commit activity for each repo (limit to 5 to avoid rate limiting)
        const reposToFetch = repos.slice(0, 5);
        console.log("Fetching commit data for repos:", reposToFetch.map((r: any) => r.name));
        
        const commitPromises = reposToFetch.map((repo: any) => 
          axios.get(`https://api.github.com/repos/${username}/${repo.name}/stats/commit_activity`)
            .catch(err => {
              console.error(`Error fetching commit data for ${repo.name}:`, err);
              return { data: [] };
            })
        );
        
        const commitResponses = await Promise.all(commitPromises);
        
        // 3. Process the commit data
        const commitMap = new Map<string, number>();
        
        commitResponses.forEach(response => {
          const weeklyData = response.data;
          
          if (Array.isArray(weeklyData)) {
            weeklyData.forEach((week: CommitActivityWeek) => {
              const weekStart = new Date(week.week * 1000);
              
              week.days.forEach((count: number, dayIndex: number) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + dayIndex);
                
                const dateStr = date.toISOString().split('T')[0];
                const existing = commitMap.get(dateStr) || 0;
                commitMap.set(dateStr, existing + count);
              });
            });
          }
        });
        
        // 4. Convert to array and sort by date
        const formattedData = Array.from(commitMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        console.log("Processed commit data:", formattedData);
        setCommitData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setError("Failed to load commit data");
        setLoading(false);
      }
    };

    fetchCommitData();
  }, [username]);

  if (loading) return <div>Loading commit data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (commitData.length === 0) return <div>No commit data available</div>;

  // Get the last 90 days of data
  const recentData = commitData.slice(-90);

  return (
    <div style={{ marginTop: '24px', marginBottom: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Commit Activity (Last 90 Days)</h2>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={recentData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              interval={6}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" maxBarSize={10}>
              {recentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GithubCommitChart;