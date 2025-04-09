# GitHub Profile Analyzer

A web application built with React and TypeScript that analyzes GitHub user profiles, displaying repositories and daily commit activity using the GitHub API.

## Demo
Check out the live deployment: github-analyzer-git-main-bhavya-tanejas-projects-636ca9a5.vercel.app
## How the Project is Made
This project was developed step-by-step with the following process:

- **Initial Setup**: Created a React application using Create React App with TypeScript support (`npx create-react-app github-analyzer --template typescript`).
- **API Integration**: Implemented `githubService.ts` to fetch repository and commit data from the GitHub API using Axios, with interfaces (`Repository`, `CommitActivityWeek`, `CommitData`) to type the responses.
- **UI Components**: Utilized custom UI components (`Input`, `Button`, `Card`, etc.) from a component library, styled with Tailwind CSS for a responsive layout.
- **Chart Implementation**: Added a GitHub-style bar chart and a line chart for commit activity using Recharts, integrating it into `App.tsx` after resolving dependency conflicts with `--legacy-peer-deps`.
- **Debugging**: Created `debugGithub.ts` to verify API functionality, logging repository and commit data for troubleshooting.
- **Deployment**: Deployed to Vercel with a `vercel.json` configuration to handle TypeScript 5.8.3 and react-scripts 5.0.1 peer dependency issues using `npm install --legacy-peer-deps`.


## Prerequisites
- Node.js (version 14.x or later)
- npm (comes with Node.js)
- Git (optional, for version control)
- A GitHub account (for API access, optional Personal Access Token)

## Installation
1. **Clone the Repository**:
   - Clone the repo to your local machine:
     ```bash
     git clone https://github.com/Developer-Bhavya/github-analyzer.git
