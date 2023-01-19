import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {

  const [token, setToken] = useState("")
  const [songs, setSongs] = useState([])

  const scopes = 'user-library-read playlist-read-private playlist-modify-private playlist-modify-public'

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
    setSongs([])
  }

  const getSongs = async () => {
    const { data } = await axios.get("https://api.spotify.com/v1/me/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setSongs(data.items)
  }

  const renderArtists = () => {
    console.log("render is triggered")
    return songs.map((song => (
      <div key={song.track.id}>
        {song.track.name}
      </div>
    ))

    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify React</h1>
        {!token ?
          <a href={`${process.env.REACT_APP_AUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URL}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${scopes}`}>Login
            to Spotify</a>
          : <button onClick={logout}>Logout</button>}
          <div>
        {token ?
          <button onClick={getSongs}>Get songs list</button>

          : <p>Log in please</p>
        }
        {renderArtists()}
      </div>
      </header>
      
    </div>
  );
}

export default App;