const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient();
const router = express.Router();
const { injectToken } = require('../middlewares/injectUserAccessToken');
const { authenticateToken } = require('../middlewares/decodeJWT');
const { getTrackInfo } = require('../services/spotify/lookup');
const getAsync = promisify(client.get).bind(client);

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
};

router.get('/', function(req, res, next) {
  res.send('MusicQ');
});

router.get('/search', authenticateToken, injectToken, async (req,res) => {
  const { keyword, offset } = req.query;
  if(keyword.trim() === '') {
    res.send([])
    return;
  }
  const localSpotifyApi = new SpotifyWebApi(credentials);
  const accessToken = req.user['spotify-access-token']
  localSpotifyApi.setAccessToken(accessToken);
  const results = await localSpotifyApi.searchTracks(
      keyword, { limit: 10, offset, type: 'track', market: 'US' });
  res.send({
    results: results.body.tracks
  });
});

router.post('/track', authenticateToken, injectToken, async(req,res)=>{
  const { trackURI } = req.body;
  if(trackURI.trim() === '') {
    res.send({})
    return;
  }
  const cachedResult = await getAsync('spotify:' + trackURI);
  if(cachedResult !== null){
    res.send({
      result: JSON.parse(cachedResult)
    });
    return;
  }
  const accessToken = req.user['spotify-access-token']
  const result = await getTrackInfo(trackURI, accessToken);
  client.set('spotify:' + trackURI, JSON.stringify(result))
  res.send({
    result: result
  });
});

module.exports = router;
