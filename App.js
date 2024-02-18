import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import ReactDOM from 'react-dom'; // Import ReactDOM
import { useAuth0, Auth0Provider } from '@auth0/auth0-react';
import './App.css'; // Import index.css file

function App() {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [following, setFollowing] = useState([]);
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

  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const delayedFetchRepos = debounce(async () => {
    try {
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=50`);
      const reposData = await reposResponse.json();
      const filteredRepos = reposData.filter(repo => repo.deployments_url);

      setRepositories(filteredRepos);
      setShowRepoList(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, 500); // Adjust debounce delay as needed

  const handleInputChange = (event) => {
    setUsername(event.target.value);
    delayedFetchRepos();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    delayedFetchRepos();
  };

  const handleBackButtonClick = () => {
    setShowRepoList(true);
  };

  const handleRepoClick = (repoName) => {
    setShowRepoList(false);
  };

  function constructGitHubPagesURL(username, repoName) {
  const baseURL = `https://${username}.github.io/${repoName}`;

  // Check if the URL already ends with ".html" or a trailing slash
  if (!baseURL.endsWith(".html") && !baseURL.endsWith("/")) {
    // Append "index.html" to the end of the URL
    return `${baseURL}/index.html`;
  }

  return (
    <div className="App">
      <div className="header">
        <img src={logo} alt="React Logo" className="logo" />
        <a className="github-button" href="https://github.com/sudo-self/gitX" data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-icon="octicon-star" data-size="large" aria-label="Star sudo-self/gitX on GitHub">Star</a>
      </div>
      {isAuthenticated ? (
        <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
      ) : (
        <button onClick={loginWithRedirect}>Sign In</button>
      )}
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
                <a href={constructGitHubPagesURL(username, repo.name)} target="_blank" rel="noopener noreferrer">View Page</a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={handleBackButtonClick}>Back</button>
        </div>
      )}
      <h2>Follow_</h2>
      <ul>
        {following.map(user => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
      <footer>ghAPI | 0auth | React | Vercel | gitXplore</footer>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-iw1f6w4a3vjsp2mh.us.auth0.com"
      clientId="kw78etqYlQX0Hq0Wg4oTGWyKIUlJD2eS"
      redirectUri="https://git-xplore.vercel.app/authorize"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

export default App;














