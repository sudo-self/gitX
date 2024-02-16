import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.svg'; // Import the default React logo

function App() {
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [following, setFollowing] = useState([]); // Initialize following state as an empty array
  const [showRepoList, setShowRepoList] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const followingResponse = await fetch(`https://api.github.com/users/${username}/following?per_page=50`);
        const followingData = await followingResponse.json();

        if (Array.isArray(followingData)) {
          setFollowing(followingData);
        } else {
          console.error('Invalid following data:', followingData);
        }
      } catch (error) {
        console.error('Error fetching following data:', error);
      }
    };

    if (username) {
      fetchFollowing();
    }
  }, [username]);

  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=50`);
      const reposData = await reposResponse.json();
      const filteredRepos = reposData.filter(repo => repo.deployments_url);

      setRepositories(filteredRepos);
      setShowRepoList(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleBackButtonClick = () => {
    setShowRepoList(true);
  };

  const handleRepoClick = (repoName) => {
    // Handle clicking on a repository (if needed)
    setShowRepoList(false);
  };

  return (
    <div className="App">
      <div className="header">
        <img src={logo} alt="React Logo" className="logo" />
          <a class="github-button" href="https://github.com/sudo-self/gitX" data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-icon="octicon-star" data-size="large" aria-label="Star sudo-self/gitX on GitHub">Star</a>
           </div>
      {showRepoList ? (
        <div>
          <h1>git 🔍 Xplore</h1>

          <p>view websites deployed with github pages</p>
  <form onSubmit={handleSubmit}>
  <input type="text" value={username} onChange={handleInputChange} placeholder="enter username" />
  <button type="submit">Search</button>
</form>

          <h2>Repos_</h2>
          <ul>
            {repositories.map(repo => (
              <li key={repo.id} onClick={() => handleRepoClick(repo.name)}>
                {repo.name}
                <a href={`https://${username}.github.io/${repo.name}`} target="_blank" rel="noopener noreferrer">View Page</a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={handleBackButtonClick}>Back</button>
          {/* You can render additional details of the selected repository here */}
        </div>
      )}
      <h2>Follow_</h2>
      <ul>
        {following.map(user => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;






