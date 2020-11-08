const tokenAccessor = require('../utils/spotifyTokenAccessor');

const injectToken = async (req,res,next) => {
  const { sessionRoomID, uid } = req.user;
  const token = await tokenAccessor(sessionRoomID, uid);
  if(token !== null){
    req.user['spotify-access-token'] = token;
    next();
  }else{
    res.status(403)
        .json({
      msg: 'No valid refresh or access token found.'
    })
  }
};

module.exports = { injectToken }
