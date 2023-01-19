import './App.css';
import React, { useState, useEffect } from 'react';
import {
  AppShell,
  Header,
  Group,
  Table,
  Title,
  Button,
  MantineProvider,
  Text,
  Anchor,
  Center,
  Skeleton
} from '@mantine/core';
import {
  IconBrandSpotify,
  IconLogin,
  IconLogout,
  IconRefresh,
  IconAddressBook
} from '@tabler/icons';

import axios from 'axios';

function App() {

  const [token, setToken] = useState("")
  const [songs, setSongs] = useState([])
  const [limited, setLimited] = useState(false)
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
    await axios.get("https://api.spotify.com/v1/me/tracks?limit=15", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setSongs(res.data.items)
    }).catch(
      err => {
        if ( err.response.status === 429 ){
          console.log("Limited rate")
          console.log(err.response.status)
          setLimited(true)
        }else{
          console.log(err.response.status)
        }
      }
    )

    
  }

  const getArtistGenre = async (artistId) => {
    const { data } = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data.genres.join(", ")
  }

  const ths = (
    <tr>
      <th>Title</th>
      <th>Artits</th>
      {/* <th>Genres</th> */}
    </tr>
  )

  const rows = songs.map((song) => (
    <tr key={song.track.id}>
      <td>{song.track.name}</td>
      <td>{song.track.artists.join(", ")}</td>
      {/* <td>{getArtistGenre(song.track.artists[0].id)}</td> */}
    </tr>

  )
  )

  const renderSongs = () => {
    console.log("render is triggered")
    return (
      <Center>
        <Table striped highlightOnHover withBorder p={'lg'}>
          <thead>{ths}</thead>
          <tbody>{rows}</tbody>
        </Table>
      </Center>
    )

  }

  return (

    <MantineProvider theme={{ fontFamily: 'Open Sans', colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
      <AppShell
        padding="md"
        header={<Header height={70} p="xs">{
          <Group position='apart'>
            <Button leftIcon={<IconRefresh />} variant='subtle' onClick={getSongs()} />
            <Center>
              <Title pl={'md'} style={{
                fontFamily: 'Pacifico'
              }}>
                Genrify
              </Title>
            </Center>
            <Center>
              {!token ?
                <Button pl={'md'} color={'green'} leftIcon={<IconLogin />} component='a' href={`${process.env.REACT_APP_AUTH_URL}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=http://localhost:3000&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${scopes}`}>Login
                  to Spotify</Button>
                : <Button pr={'md'} color={'grape'} leftIcon={<IconLogout />} onClick={logout}>Log out</Button>}
            </Center>
          </Group>
        }</Header>}
        footer={
          <Group position='center' p={"md"}>
            <IconBrandSpotify />
            <Text>
              ISIALP x Spotify
            </Text>
            <IconAddressBook />
            <Anchor href='https://isialp.github.io' color={'dimmed'} >
              check us out
            </Anchor>
          </Group>
        }
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}
      >
        <Center>

          <Skeleton visible={token}>
            {renderSongs()}
          </Skeleton>

        </Center>
      </AppShell>
    </MantineProvider>

  );
}

export default App;