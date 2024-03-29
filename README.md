### Domain <a href="https://xplor.sudo-self.com">xplor.sudo-self.com</a><br>
### Vercel <a href="https://git-xplore.vercel.app/">git-xplore.vercel.app</a><br>
![Screenshot 2024-02-16 at 9 52 25 AM](https://github.com/sudo-self/gitX/assets/119916323/8490263d-9104-4f5a-852c-e11dd13e5982)
![Screenshot 2024-02-16 at 9 52 50 AM](https://github.com/sudo-self/gitX/assets/119916323/2e259849-e444-4758-b33d-cf4377596ee0)
![Screenshot 2024-02-16 at 2 04 41 AM](https://github.com/sudo-self/gitX/assets/119916323/491d15eb-a065-4dbe-ae58-d04c8d9d3cf8)
![Screenshot 2024-02-16 at 9 27 12 AM](https://github.com/sudo-self/gitX/assets/119916323/2fc24d7c-191a-4c06-b448-2368441da3b1)
![Screenshot 2024-02-16 at 1 36 16 AM](https://github.com/sudo-self/gitX/assets/119916323/d38d308c-9f51-4366-8e2e-32551ebe6144)
![Screenshot 2024-02-16 at 1 35 25 AM](https://github.com/sudo-self/gitX/assets/119916323/481b5050-9a8d-4570-b92f-f4368c059d99)
![Screenshot 2024-02-16 at 12 31 47 AM](https://github.com/sudo-self/gitX/assets/119916323/692d0933-a321-4b3c-bbfa-0bd4205f504d)
![Screenshot 2024-02-16 at 12 31 22 AM](https://github.com/sudo-self/gitX/assets/119916323/f05fc968-43c9-4247-a7fb-a1a2e19e74ad)
![Screenshot 2024-02-16 at 9 46 08 AM](https://github.com/sudo-self/gitX/assets/119916323/777e7f69-80a9-4769-850f-3fd868222670)




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
### Index.js

```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-iw1f6w4a3vjsp2mh.us.auth0.com"
      clientId="kw78etqYlQX0Hq0Wg4oTGWyKIUlJD2eS"
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
```
### Logo.svg

```
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="257.000000pt" height="300.000000pt" viewBox="0 0 257.000000 300.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.10, written by Jesse Roper 2024
</metadata>
<g transform="translate(0.000000,300.000000) scale(0.050000,-0.050000)"
fill="#000000" stroke="none">
<path d="M2174 5846 c-7 -11 -96 -25 -198 -31 -220 -14 -267 -27 -234 -67 30
-37 24 -38 -322 -89 -365 -53 -520 -88 -620 -139 -97 -50 -106 -85 -15 -59
134 39 132 3 -4 -60 -300 -141 -721 -538 -692 -654 7 -26 -1 -95 -17 -152 -65
-231 -38 -349 37 -163 22 55 57 123 76 150 l36 48 -10 -90 c-31 -280 -33 -378
-10 -461 l25 -89 26 138 c26 135 54 193 80 166 8 -7 -2 -92 -21 -188 -66 -338
-87 -1290 -34 -1471 44 -146 68 -858 32 -917 -9 -14 -15 -439 -10 -663 1 -43
41 -47 41 -5 0 87 41 9 77 -145 57 -248 93 -321 215 -440 60 -57 108 -118 108
-135 0 -16 7 -28 15 -26 8 2 49 -29 90 -69 99 -96 261 -155 427 -155 79 0 154
-12 191 -31 72 -38 84 -31 59 35 -46 122 32 118 101 -5 51 -91 152 -109 250
-45 48 31 52 31 70 0 53 -94 447 74 702 299 41 36 86 62 100 56 57 -22 275
454 275 601 0 30 9 47 20 40 11 -7 20 -32 20 -55 0 -34 5 -38 25 -18 47 47 46
903 -2 1137 -44 213 -32 367 45 626 49 162 62 389 31 551 -15 85 -26 307 -27
567 -2 438 -21 537 -74 384 -30 -85 -61 -58 -45 39 7 49 4 79 -9 79 -11 0 -26
-38 -33 -85 -30 -197 -32 -202 -66 -168 -32 32 -6 289 35 343 8 11 21 63 29
116 19 131 62 114 58 -23 -3 -120 5 -127 43 -38 l28 65 1 -124 c1 -108 24
-170 53 -141 33 33 9 352 -36 485 -17 50 -10 86 42 216 34 85 61 171 60 190
-1 20 -5 24 -11 9 -38 -93 -61 -12 -59 200 1 157 -7 243 -26 285 l-29 60 -13
-85 c-18 -116 -26 -119 -124 -40 -124 101 -232 164 -346 203 -119 40 -419 67
-436 38z m682 -278 c58 -88 104 -236 104 -332 l0 -83 53 49 52 48 -14 -80 c-8
-44 -27 -106 -42 -138 -40 -80 -39 -125 1 -92 58 48 29 -16 -54 -117 -93 -116
-122 -129 -105 -48 11 50 9 48 -24 -14 -44 -81 -99 -111 -77 -41 111 349 -142
736 -530 809 -65 13 -62 8 52 -65 126 -82 169 -131 250 -284 62 -117 70 -538
12 -665 -47 -102 -58 -94 -43 30 l11 105 -78 -160 c-43 -88 -97 -177 -121
-198 -56 -50 -54 -18 5 90 251 452 155 818 -263 1006 -159 71 -93 98 77 31
170 -67 156 -33 -18 47 -176 80 -193 85 -173 52 8 -12 -10 -7 -39 12 -103 68
-31 89 299 90 188 0 209 -4 348 -71 160 -76 159 -39 -1 42 -158 80 -154 120 5
52 81 -35 198 -144 282 -263 l36 -50 -12 70 c-7 39 -39 117 -71 175 -32 57
-58 109 -58 116 0 24 97 -64 136 -123z m-1045 -198 c326 -98 549 -433 490
-736 -46 -232 -73 -245 -87 -42 -16 243 -96 458 -201 546 -43 35 -42 15 10
-129 77 -215 64 -560 -28 -763 -31 -67 -58 -56 -47 19 49 309 35 537 -42 720
-48 112 -89 99 -46 -14 72 -189 21 -497 -120 -731 -98 -162 -131 -179 -107
-55 43 215 21 578 -40 680 -83 139 -150 165 -81 32 83 -160 106 -345 62 -492
-50 -169 -73 -148 -71 67 3 319 -38 424 -249 643 -163 168 -163 176 -3 127
234 -71 416 -195 504 -345 74 -125 89 -42 17 99 -78 152 -302 323 -425 324
-53 1 -95 32 -78 58 21 34 423 28 542 -8z m-761 -228 c211 -98 319 -303 335
-635 16 -347 -28 -369 -87 -45 -43 236 -128 411 -244 505 -100 81 -117 53 -28
-45 98 -109 134 -186 146 -308 26 -292 26 -294 0 -294 -15 0 -37 48 -52 115
-60 262 -177 420 -390 527 -155 77 -163 47 -27 -98 167 -178 257 -291 257
-324 0 -16 -59 33 -131 110 -146 156 -143 135 16 -102 119 -177 169 -288 129
-288 -46 0 -218 211 -310 380 -105 192 -163 260 -225 260 -37 0 -32 -9 33 -70
41 -39 69 -76 62 -82 -6 -7 -37 11 -68 40 -75 70 -117 81 -170 43 -44 -30 -44
-31 -3 -31 78 0 287 -301 287 -412 0 -75 -87 31 -159 194 -55 125 -84 146
-181 130 -87 -14 -106 11 -40 53 22 13 40 35 40 47 0 40 190 202 291 248 265
121 392 141 519 82z m1750 -750 c0 -5 -15 -66 -32 -135 -60 -234 29 -717 132
-717 18 0 64 -102 52 -114 -5 -5 -69 19 -142 54 -130 62 -195 68 -119 11 35
-26 11 -28 -201 -22 -132 3 -197 2 -145 -3 154 -13 101 -65 -67 -66 -39 0
-114 -13 -165 -28 -51 -15 -97 -21 -102 -13 -29 46 224 181 339 181 28 0 50 9
50 20 0 95 -283 -7 -412 -148 l-101 -112 -165 0 c-182 0 -258 27 -301 108 -46
85 -171 158 -289 168 -136 11 -165 -26 -35 -44 106 -14 283 -114 283 -161 0
-25 -12 -25 -95 2 -52 17 -147 36 -210 41 -144 13 -149 41 -10 52 58 5 -7 6
-145 2 -222 -6 -246 -3 -211 23 65 49 27 48 -97 -3 -171 -69 -183 -61 -84 61
99 121 96 114 149 357 46 209 42 202 113 166 41 -22 64 -24 90 -7 28 17 54 10
126 -32 109 -63 146 -66 174 -13 30 56 59 50 82 -18 31 -89 73 -92 148 -11 71
78 73 77 109 -36 31 -96 45 -94 156 14 103 102 138 101 95 -3 -17 -39 -30 -74
-30 -78 0 -22 78 -3 130 32 71 47 105 52 70 10 -82 -98 199 40 326 161 59 55
100 54 54 -1 -67 -81 18 -64 100 20 52 53 107 90 132 90 29 0 74 36 128 100
72 86 120 123 120 92z m-2120 -242 c14 -17 21 -35 16 -41 -18 -18 -76 15 -76
43 0 37 29 36 60 -2z m-252 -42 c23 -61 -55 -269 -89 -235 -19 19 40 267 63
267 8 0 19 -14 26 -32z m1872 -864 c0 -166 -109 -606 -149 -600 -36 5 -41 21
-41 126 0 133 -33 164 -99 91 -112 -124 -90 24 31 211 173 267 258 324 258
172z m437 37 c16 -114 -50 -185 -105 -111 -20 27 -27 27 -67 -1 -57 -40 -57
-85 0 -107 126 -48 142 -168 52 -379 -74 -173 -169 -213 -268 -114 -49 49 -72
191 -31 191 46 0 82 -27 82 -62 0 -96 59 -31 119 131 46 125 32 171 -52 171
-15 0 -40 22 -58 48 -63 97 49 242 211 273 94 19 109 14 117 -40z m-1306 -82
c135 -129 43 -530 -93 -407 -91 82 -278 463 -239 487 60 37 261 -11 332 -80z
m-476 -34 c32 -41 81 -115 108 -165 28 -49 80 -137 117 -195 78 -124 69 -144
-39 -95 -95 43 -135 22 -145 -75 -18 -185 -117 -61 -148 187 -53 423 -25 513
107 343z m2142 18 c14 -101 -68 -212 -91 -123 -15 56 -62 50 -91 -12 -21 -48
-18 -57 46 -109 141 -115 20 -499 -157 -499 -72 0 -144 76 -144 152 0 103 93
120 108 20 9 -61 38 -36 84 72 57 132 60 189 10 205 -145 46 -67 319 95 337
115 12 133 7 140 -43z m-2543 -2 c77 -47 102 -124 64 -195 -25 -46 -23 -53 26
-89 205 -149 176 -437 -44 -437 -128 0 -152 39 -210 330 -28 143 -60 286 -70
318 -38 112 100 154 234 73z m1236 -31 c0 -25 -79 -37 -142 -21 -85 21 -53 54
47 47 52 -3 95 -15 95 -26z m-134 -256 c4 -76 -4 -128 -25 -160 -17 -26 -41
-100 -53 -164 -21 -117 -48 -173 -132 -277 -60 -74 -58 -128 9 -199 47 -50 48
-56 12 -37 -132 68 -146 158 -44 288 66 84 117 195 116 249 0 23 -10 15 -28
-24 -65 -143 -201 -230 -362 -230 -56 0 -87 -8 -79 -20 7 -11 61 -20 121 -20
74 0 109 -8 109 -25 1 -98 48 -181 136 -239 55 -35 75 -56 49 -50 -56 13 -60
-19 -4 -36 23 -7 85 3 139 22 77 28 109 31 144 14 104 -50 216 -51 216 -2 0
11 -16 14 -35 7 -19 -7 4 22 50 64 63 59 87 98 97 161 l13 84 106 0 c147 0
154 32 10 45 -153 14 -232 62 -303 185 -37 65 -58 86 -57 60 0 -55 65 -194
107 -229 115 -95 95 -301 -31 -301 -13 0 -5 20 20 46 60 64 55 98 -36 237 -48
73 -88 167 -102 235 -13 61 -40 140 -61 174 -61 101 -41 268 33 268 34 0 35
-9 10 -98 -15 -51 -12 -80 11 -120 l30 -52 -8 66 c-9 82 21 106 36 30 49 -235
96 -310 223 -356 53 -19 133 -51 177 -70 112 -49 271 -80 411 -80 111 0 148
-20 97 -51 -12 -8 -112 -21 -222 -29 -274 -22 -322 -69 -55 -54 222 12 315 45
377 132 83 116 128 82 51 -39 -65 -104 -109 -119 -397 -141 -232 -18 -241 -21
-325 -90 -86 -70 -116 -123 -57 -101 26 10 27 5 9 -29 -40 -75 -7 -85 37 -10
24 41 35 69 24 62 -11 -7 -15 1 -8 17 28 73 508 165 508 98 0 -30 -50 -45
-157 -47 -212 -3 -401 -125 -321 -207 10 -10 18 -53 18 -95 0 -140 -107 -100
-197 74 -49 95 -57 45 -10 -70 17 -45 27 -87 20 -93 -25 -26 -70 13 -83 71
-17 78 -50 100 -50 34 0 -27 9 -55 20 -62 11 -7 20 -21 20 -33 0 -28 -82 0
-131 45 -48 44 -77 30 -49 -23 17 -32 8 -35 -100 -35 -128 0 -135 5 -89 65 32
42 39 91 12 91 -9 0 -27 -23 -39 -50 -36 -78 -194 -148 -237 -105 -31 30 -31
36 1 85 19 29 32 72 28 96 -5 36 -17 25 -66 -61 -77 -134 -160 -151 -174 -35
-4 38 0 84 10 102 49 87 -63 181 -236 199 -166 16 -210 27 -210 49 0 64 384
-1 485 -82 95 -76 124 -60 44 24 -90 94 -121 104 -372 118 -261 15 -339 45
-403 156 -50 85 -4 89 90 7 104 -90 143 -103 351 -116 261 -16 229 26 -39 51
-309 30 -338 68 -66 86 175 12 239 25 315 65 52 27 126 55 164 62 92 17 204
129 235 234 l25 85 7 -70 7 -69 35 99 c21 61 31 135 26 187 -7 68 -2 86 19 79
17 -6 29 -49 33 -122z m64 -814 c-38 -24 -65 3 -48 48 12 32 16 33 46 3 28
-29 28 -35 2 -51z m-1253 -106 c6 -25 20 -123 31 -219 25 -214 66 -371 78
-295 9 57 44 104 44 59 1 -98 44 -384 68 -450 l29 -79 2 114 c1 128 37 316 59
316 28 0 197 -290 326 -560 127 -264 223 -410 256 -390 9 6 -3 48 -28 95 -70
134 -152 371 -152 441 l0 64 71 -75 c93 -98 111 -95 72 14 -34 95 -28 119 24
100 34 -14 381 -387 436 -469 18 -28 39 -44 46 -37 22 21 -41 142 -118 227
-63 68 -68 135 -5 72 46 -46 83 -25 40 23 -158 174 -111 206 64 45 l120 -110
6 75 c14 191 45 157 94 -104 21 -109 28 -211 20 -266 -16 -105 14 -101 60 8
43 103 94 445 79 532 -10 61 -7 75 20 75 40 0 110 -145 111 -229 0 -90 28 -41
88 154 29 96 62 175 73 175 42 0 15 -349 -53 -670 -40 -190 201 256 294 544
48 149 72 199 89 185 26 -21 56 169 82 506 15 207 33 220 66 50 13 -69 42
-190 63 -270 42 -157 53 -416 13 -290 -36 111 -49 73 -60 -171 -9 -203 -20
-258 -76 -400 -88 -223 -137 -220 -69 4 52 172 34 267 -19 103 -11 -34 -16
-35 -34 -10 -14 21 -23 22 -30 5 -55 -135 -437 -553 -578 -632 -49 -27 -33 18
40 114 81 106 171 276 171 324 0 19 -31 -9 -73 -65 -40 -55 -131 -143 -202
-198 -70 -54 -141 -110 -155 -124 -41 -37 -77 -31 -59 10 92 219 98 356 8 180
-71 -138 -67 -137 -116 -28 -40 91 -98 152 -76 81 7 -21 21 -100 31 -176 11
-76 31 -145 45 -154 19 -12 19 -22 -2 -46 -55 -67 -85 -20 -131 208 l-26 130
-2 -99 c-2 -119 -22 -102 -71 59 -43 145 -101 264 -157 325 -70 77 -76 50 -14
-72 120 -236 70 -430 -83 -321 -33 23 -65 37 -72 30 -7 -7 8 -27 32 -44 25
-18 69 -53 99 -79 l54 -46 -64 1 c-68 2 -112 46 -271 271 -96 137 -101 199 -9
109 109 -106 102 -76 -48 211 -193 370 -206 381 -189 166 16 -193 57 -314 171
-509 95 -162 95 -204 1 -110 -140 140 -219 262 -293 452 -91 236 -118 272 -99
136 l13 -100 -52 60 -52 60 13 -80 c7 -44 14 -86 16 -93 2 -7 -6 -16 -17 -20
-30 -11 -68 189 -83 432 l-14 220 -37 -87 c-56 -133 -64 -86 -26 142 19 113
37 269 39 346 7 187 30 236 58 124z m217 -49 c17 -19 46 -62 65 -95 18 -33 28
-42 21 -20 -34 108 -35 162 -1 121 61 -75 101 -351 51 -351 -11 0 -20 38 -20
85 -1 61 -6 77 -19 55 -25 -38 -44 -18 -110 113 -66 134 -60 176 13 92z m1985
0 c-8 -19 -32 -93 -53 -165 l-37 -130 8 122 c5 68 19 142 32 165 27 52 72 59
50 8z m42 -115 c-56 -131 -103 -176 -78 -75 22 92 48 153 82 190 55 61 53 20
-4 -115z m-1733 -227 c2 -94 -2 -105 -28 -83 -32 27 -45 338 -15 368 18 18 41
-134 43 -285z m1563 121 c-12 -88 -20 -172 -17 -187 4 -15 -9 -26 -29 -24 -22
2 -35 -12 -35 -35 0 -21 -9 -38 -20 -38 -22 0 -27 245 -7 365 23 138 50 79 43
-95 -3 -94 1 -170 9 -170 8 0 15 58 15 129 0 122 29 249 52 226 6 -6 1 -83
-11 -171z m-1644 -54 c-1 -79 -4 -89 -17 -50 -23 71 -23 243 0 190 9 -22 17
-85 17 -140z m336 -59 c38 -8 69 -5 76 8 27 43 51 19 51 -49 0 -72 -31 -91
-75 -47 -18 18 -30 18 -52 0 -45 -37 -133 5 -133 63 0 58 19 80 48 56 12 -9
50 -23 85 -31z m283 -69 c-6 -54 -47 -74 -93 -45 -22 15 -21 29 6 82 40 76 97
51 87 -37z m140 74 c57 -57 29 -159 -41 -152 -58 5 -65 12 -61 63 7 92 56 135
102 89z m200 -104 c-5 -33 -23 -43 -81 -48 -91 -8 -105 52 -30 131 l44 48 37
-45 c20 -25 33 -63 30 -86z m127 79 c29 -62 10 -111 -43 -111 -23 0 -47 14
-53 31 -15 38 23 129 53 129 11 0 31 -22 43 -49z m128 -49 c-8 -23 -26 -42
-40 -42 -39 0 -54 56 -29 104 30 56 89 2 69 -62z m198 52 c25 -41 11 -54 -77
-74 -71 -16 -72 -15 -72 50 0 73 106 90 149 24z m11 -137 c0 -24 -17 -45 -41
-52 -25 -6 -37 -21 -31 -38 12 -31 -24 -35 -67 -8 -18 12 -43 8 -69 -10 -54
-38 -72 -36 -72 8 0 53 63 103 148 117 40 6 78 19 84 29 17 28 48 -1 48 -46z
m388 -128 c-47 -232 -92 -303 -80 -130 5 72 19 133 30 137 12 4 22 27 22 51 1
72 24 137 43 118 10 -10 4 -85 -15 -176z m-1502 142 c30 -16 68 -24 83 -19 17
7 40 -11 59 -45 26 -49 31 -51 31 -15 1 65 26 74 65 24 29 -39 35 -40 36 -11
0 40 41 46 76 11 50 -50 15 -138 -41 -103 -14 9 -68 17 -121 18 -52 1 -105 12
-117 24 -12 12 -34 17 -50 11 -15 -6 -40 0 -55 12 -15 13 -40 21 -55 18 -16
-4 -29 15 -33 49 -8 64 32 73 122 26z m728 -53 c15 -15 25 -15 35 0 21 34 51
26 51 -14 0 -68 -79 -115 -81 -49 -1 28 -6 25 -24 -11 -24 -51 -61 -49 -72 4
-15 77 41 120 91 70z m-260 -88 c-6 -36 -1 -75 12 -88 15 -15 16 -22 0 -22
-58 0 -113 167 -61 186 44 15 60 -9 49 -76z m146 49 c0 -59 -42 -99 -81 -79
-64 35 -50 100 21 100 33 0 60 -10 60 -21z m-1089 -800 c28 -45 100 -135 160
-200 130 -141 141 -186 26 -101 -80 58 -217 248 -246 339 -21 67 4 51 60 -38z
m1847 -166 c-119 -107 -338 -248 -410 -263 l-58 -13 70 61 c39 33 77 61 86 61
19 1 133 82 284 202 127 100 150 61 28 -48z m-512 -198 c-70 -137 -74 -142
-85 -87 -10 54 -13 55 -40 24 -45 -55 -146 -103 -138 -65 8 33 287 273 318
273 11 0 -14 -65 -55 -145z"/>
<path d="M1200 3208 c0 -41 147 -249 164 -232 27 27 0 177 -37 214 -29 29
-127 42 -127 18z"/>
<path d="M440 3102 c0 -51 20 -102 40 -102 25 0 42 62 29 103 -15 49 -69 48
-69 -1z"/>
<path d="M509 2839 c-19 -32 51 -299 79 -299 68 0 94 119 51 233 -31 80 -99
115 -130 66z"/>
<path d="M1178 1965 c10 -19 33 -53 50 -75 43 -55 43 5 1 66 -38 53 -80 61
-51 9z"/>
<path d="M1423 1769 c-27 -61 -28 -69 -6 -69 14 0 63 85 63 111 0 29 -37 1
-57 -42z"/>
<path d="M4039 793 c-175 -47 -300 -174 -295 -299 2 -71 -30 -134 -69 -134
-19 0 -14 34 15 105 8 19 5 35 -5 35 -11 0 -31 -26 -44 -59 -27 -63 -101 -141
-101 -105 0 13 28 77 61 143 156 306 87 383 -227 253 -458 -190 -639 -365
-508 -488 54 -51 232 -90 328 -72 122 23 88 44 -82 51 -363 15 -340 155 58
354 455 227 513 214 391 -87 -56 -136 -57 -138 -64 -70 -10 104 -48 65 -42
-43 4 -66 -9 -128 -45 -208 -55 -125 -60 -149 -30 -149 11 0 46 58 78 129 48
106 69 132 115 141 105 22 216 57 277 87 56 27 58 27 32 -4 -39 -47 -11 -67
35 -25 36 32 38 31 49 -7 10 -41 74 -59 74 -21 0 11 -10 20 -22 20 -46 0 -2
51 53 60 31 6 53 19 48 30 -9 21 -29 21 -124 2 -45 -9 -55 -4 -55 29 0 56 -26
48 -80 -26 l-48 -65 -16 70 c-31 143 81 260 289 304 201 42 222 -46 92 -390
-68 -178 -97 -215 -97 -120 0 51 -1 52 -29 15 -17 -22 -30 -28 -30 -14 -1 14
-11 25 -22 25 -12 0 -19 -25 -15 -55 5 -44 15 -54 51 -50 29 3 45 -6 45 -25 0
-17 8 -30 19 -30 30 0 81 85 81 134 0 94 64 126 250 126 l170 0 0 -90 c0 -50
9 -90 20 -90 11 0 20 25 20 55 l1 55 37 -48 c65 -84 271 -49 258 44 -11 77
-130 73 -163 -6 -24 -56 -29 -59 -54 -29 -27 33 14 89 65 89 9 0 16 9 16 20 0
13 -32 15 -85 7 -78 -12 -83 -11 -57 20 36 44 11 68 -37 38 -30 -18 -40 -17
-49 7 -9 24 -20 25 -53 7 -35 -18 -47 -15 -70 14 -27 35 -29 35 -41 -8 -7 -25
-22 -45 -32 -45 -11 0 -15 13 -10 28 21 54 -14 53 -58 -2 -64 -80 -74 -51 -28
80 89 252 4 353 -241 287z"/>
<path d="M4335 306 c-44 -11 -46 -46 -2 -46 31 0 31 -3 0 -37 -39 -42 -25 -63
40 -63 50 0 64 31 22 45 -20 7 -19 15 2 41 14 18 21 42 14 53 -14 22 -18 22
-76 7z"/>
<path d="M4472 250 c-18 -27 -30 -51 -27 -51 114 -27 152 -6 123 69 -18 47
-59 39 -96 -18z"/>
<path d="M4235 269 c-8 -9 -15 -43 -15 -76 0 -44 6 -55 22 -39 11 11 18 46 15
75 -4 30 -14 48 -22 40z"/>
</g>
</svg>
```
### npm install<br>
### npm start<br>



### App.css

```

body {
  background-color: #cfe0f2; /* Set background color of the body */
  margin: 0; /* Remove default body margin */
  font-family: Arial, sans-serif; /* Specify a fallback font */
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.logo {
  width: 100px; /* Adjust width as needed */
  height: auto;
  color: #fff;
}


.App {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh; 
}


.github-link {
  font-size: 18px;
  color: #ffffff;
  text-decoration: none;
}

.github-link:hover {
  text-decoration: underline;
}


.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add a subtle box shadow */
  margin-bottom: 20px; /* Add margin at the bottom */
}
```
