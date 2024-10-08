import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0,
    },
    totalTime: {
      second: 0,
      minute: 0,
    },
  });

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);

  // const url = "http://localhost:4000";
  const url = "https://spotify-backend-m6qf.onrender.com";

  const getSongsData = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`);
      setSongsData(response.data.songs);
      setTrack(response.data.songs[0]); // Set the first track as the initial track
    } catch (error) {
      console.error(error);
    }
  };

  const getAlbumsData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      setAlbumsData(response.data.albums);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        seekBar.current.style.width =
          Math.floor(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          ) + "%";
        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60),
          },
        });
      }
    };
  }, []);

  useEffect(() => {
    getSongsData();
    getAlbumsData();
  }, []);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlayStatus(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayStatus(false);
    }
  };

  const playWithId = async (id) => {
    const songToPlay = songsData.find((item) => id === item._id);
    if (songToPlay) {
      setTrack(songToPlay);
      audioRef.current.currentTime = 0; // Reset time to start
      await audioRef.current.play();
      setPlayStatus(true);
    }
  };

  const previous = async () => {
    const currentIndex = songsData.findIndex((item) => track._id === item._id);
    if (currentIndex > 0) {
      const previousTrack = songsData[currentIndex - 1];
      setTrack(previousTrack);
      audioRef.current.currentTime = 0; // Reset time to start
      await audioRef.current.play();
      setPlayStatus(true);
    }
  };

  const next = async () => {
    const currentIndex = songsData.findIndex((item) => track._id === item._id);
    if (currentIndex < songsData.length - 1) {
      const nextTrack = songsData[currentIndex + 1];
      setTrack(nextTrack);
      audioRef.current.currentTime = 0; // Reset time to start
      await audioRef.current.play();
      setPlayStatus(true);
    }
  };

  const seekSong = (e) => {
    const offsetX = e.nativeEvent.offsetX;
    const seekBgWidth = seekBg.current.offsetWidth;
    const newTime = (offsetX / seekBgWidth) * audioRef.current.duration;

    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
    songsData,
    albumsData,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
