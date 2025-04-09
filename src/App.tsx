import React, { useState } from "react";
import { getUserRepositories, getCombinedCommitData, Repository, CommitData } from "./services/githubService";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Skeleton } from "./components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import GithubChart from './GithubChart';
import './App.css';

// Helper function to get commit color based on count (GitHub style)
const getCommitColor = (count: number) => {
  if (count === 0) return '#ebedf0';
  if (count <= 2) return '#9be9a8';
  if (count <= 5) return '#40c463';
  return '#216e39';
};

function App() {
  const [username, setUsername] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setRepositories([]);
    setCommitData([]);

    try {
      const [repos, commits] = await Promise.all([
        getUserRepositories(username),
        getCombinedCommitData(username),
      ]);
      setRepositories(repos);
      setCommitData(commits);
      console.log("Commit Data:", commits); // Debug log
    } catch (err: any) {
      setError(err.response?.status === 404 ? "User not found" : "Error fetching data");
      console.error("Error in handleSearch:", err); // Debug error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">GitHub Profile Analyzer</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="max-w-md"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* GitHub Commit Activity Chart (GitHub style) */}
          {username && !loading && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Contribution Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {commitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={commitData.slice(-90)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        interval={14}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border rounded shadow">
                                <p className="text-sm">{`${payload[0].payload.date}: ${payload[0].value} commits`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" maxBarSize={10}>
                        {commitData.slice(-90).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCommitColor(entry.count)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No contribution data available yet. This may be due to API limits or lack of public commit history.</p>
                )}
              </CardContent>
            </Card>
          )}

          {repositories.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Repositories ({repositories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositories.map((repo) => (
                    <Card key={repo.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {repo.name}
                          </a>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {repo.description && <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>}
                        <div className="flex gap-4 text-sm">
                          {repo.language && <span>{repo.language}</span>}
                          <span>⭐ {repo.stargazers_count}</span>
                          <span>🍴 {repo.forks_count}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Line Chart for Commit Trends */}
          {commitData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Commit Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={commitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default App;