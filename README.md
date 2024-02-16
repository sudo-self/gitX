### <a href="https://xplor.sudo-self.com">Xplor.sudo-self.com</a>&nbsp;search usernames to view websites built with github pages.
![Screenshot 2024-02-16 at 2 04 41 AM](https://github.com/sudo-self/gitX/assets/119916323/491d15eb-a065-4dbe-ae58-d04c8d9d3cf8)
![Screenshot 2024-02-16 at 9 27 12 AM](https://github.com/sudo-self/gitX/assets/119916323/2fc24d7c-191a-4c06-b448-2368441da3b1)
![Screenshot 2024-02-16 at 1 36 16 AM](https://github.com/sudo-self/gitX/assets/119916323/d38d308c-9f51-4366-8e2e-32551ebe6144)
![Screenshot 2024-02-16 at 1 35 25 AM](https://github.com/sudo-self/gitX/assets/119916323/481b5050-9a8d-4570-b92f-f4368c059d99)
![Screenshot 2024-02-16 at 12 31 47 AM](https://github.com/sudo-self/gitX/assets/119916323/692d0933-a321-4b3c-bbfa-0bd4205f504d)
![Screenshot 2024-02-16 at 12 31 22 AM](https://github.com/sudo-self/gitX/assets/119916323/f05fc968-43c9-4247-a7fb-a1a2e19e74ad)
### App.js
```
import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import ReactDOM from 'react-dom';
import { useAuth0, Auth0Provider } from '@auth0/auth0-react';
import './App.css';
import { kv } from '@vercel/kv';

const App = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showRepoList, setShowRepoList] = useState(true);
  const [selectedRepoURL, setSelectedRepoURL] = useState('');
  const [views, setViews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch count value from KV storage
        const views = await kv.get('views');
        setViews(parseInt(views) || 0);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once after the initial render

  useEffect(() => {
    const incrementViews = async () => {
      try {
        await kv.put('views', (views + 1).toString());
        setViews(views + 1);
      } catch (error) {
        console.error('Error incrementing count:', error);
      }
    };

    incrementViews();
  }, [views]); // Increment view count whenever it changes

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
    setSelectedRepoURL('');
  };

  const handleRepoClick = (repoName) => {
    setShowRepoList(false);
    setSelectedRepoURL(`https://${username}.github.io/${repoName}`);
  };

  return (
    <div className="App">
      <div className="header">
        <img src={logo} alt="React Logo" className="logo" />
        <a className="github-button" href="https://github.com/sudo-self/gitX" data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-icon="octicon-star" data-size="large" aria-label="Star sudo-self/gitX on GitHub">Star</a>
      </div>
      {isAuthenticated ? (
        <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
      ) : (
        <button onClick={loginWithRedirect}>Sign in</button>
      )}
      {showRepoList ? (
        <div>
          <h1>git 🔍 Xplor&nbsp;{views}</h1>
          <p>view websites deployed with github pages</p>
          <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={handleInputChange} placeholder="enter username" />
            <button type="submit">Search</button>
          </form>
          <h2>Pages:</h2>
          <ul>
            {repositories.map(repo => (
              <li key={repo.id} onClick={() => handleRepoClick(repo.name)}>
                {repo.name} - <a href={`https://${username}.github.io/${repo.name}`} target="_blank" rel="noopener noreferrer">View Page</a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <button onClick={handleBackButtonClick}>Back</button>
          {selectedRepoURL && (
            <iframe title="GitHub Pages" src={selectedRepoURL} width="100%" height="500px"></iframe>
          )}
        </div>
      )}
      <h2>Followers:</h2>
      <ul>
        {following.map(user => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
      <footer>JR&nbsp;&#10084; Auth0 React Vercel kv&nbsp;&copy;2024</footer>
    </div>
  );
};

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

```

