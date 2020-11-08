const SpotifyWebApi = require('spotify-web-api-node');

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
};

const getTrackInfo = async (trackURI,accessToken) => {
    const localSpotifyApi = new SpotifyWebApi(credentials);
    localSpotifyApi.setAccessToken(accessToken);
    const track = trackURI.split(':')[2];
    try{
      const token = await localSpotifyApi.getTrack(track,{
          market: 'ES'
      })
      return token.body;
    }catch (e) {
      throw e;
    }
}

module.exports = {
  getTrackInfo
}