const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const router = express.Router();

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
};

router.get('/devices', async (req, res) => {
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const devices = await localSpotifyApi.getMyDevices();
    res.json({
      devices: devices.body.devices
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

router.post('/play', async (req, res) => {
  const { deviceID } = req.body;
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const play = await localSpotifyApi.play({
      device_id: deviceID
    })
    res.json({
      play: play.body
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

//todo: sync up the play in spotify with now
router.get('/playing', async (req, res) => {
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const playing = await localSpotifyApi.getMyCurrentPlayingTrack({
      market: 'ES'
    })
    res.json({
      playing: playing.body
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

router.post('/pause', async (req, res) => {
  const { deviceID } = req.body;
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const pause = await localSpotifyApi.pause({
      device_id: deviceID
    })
    res.json({
      pause: pause.body
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

router.post('/next', async (req, res) => {
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const skip = await localSpotifyApi.skipToNext()
    res.json({
      skip: skip.body
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

router.post('/previous', async (req, res) => {
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setAccessToken(req.user['spotify-access-token']);
  try {
    const skip = await localSpotifyApi.skipToPrevious()
    res.json({
      skip: skip.body
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
});

module.exports = router;
