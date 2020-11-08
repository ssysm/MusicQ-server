const express = require('express');
const redis = require("redis");
const SpotifyWebApi = require('spotify-web-api-node');
const authScope = require('../const/auth-scope');
const { authenticateToken } = require('../middlewares/decodeJWT');
const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
  redirectUri: process.env.SERVER_HOST + '/auth/auth-callback',
};

const spotifyApi = new SpotifyWebApi(credentials);
const router = express.Router();
const client = redis.createClient();

router.post('/generate-auth-url', authenticateToken, async(req,res) => {
  const state = `${req.user.sessionRoomID},${req.user.uid}`;
  const authorizeURL = spotifyApi.createAuthorizeURL(authScope, state);
  res.send({
    authorizeURL
  });
})

router.get('/auth-callback', async (req,res) => {
  const { code, state } = req.query;
  const localSpotifyApi = new SpotifyWebApi(credentials);
  const stateParts = state.split(',');
  const roomID = stateParts[0], userID = stateParts[1];
  const grant = await (await localSpotifyApi.authorizationCodeGrant(code)).body;
  client.set('room:' + roomID + ':token:' + userID, grant.access_token);
  client.set('room:' + roomID + ':refresh-token:' + userID, grant.refresh_token);
  client.expire('room:' + roomID + ':token:' + userID, 3000);
  res.redirect(process.env.FRONT_HOST + '/room/' + roomID + '?auth=true')
});

module.exports = router;
