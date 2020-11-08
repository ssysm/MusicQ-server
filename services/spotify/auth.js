const SpotifyWebApi = require('spotify-web-api-node');

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
  redirectUri: process.env.FRONT_HOST + '/auth-callback',
};

const renewAndGetAccessToken = async (refreshAccessToken) => {
  const localSpotifyApi = new SpotifyWebApi(credentials);
  localSpotifyApi.setRefreshToken(refreshAccessToken);
  try{
    const token = await localSpotifyApi.refreshAccessToken();
    return token.body.access_token;
  }catch (e) {
    throw e;
  }
}

module.exports = {
  renewAndGetAccessToken
}
