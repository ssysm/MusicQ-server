const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient();
const hashGetAsync = promisify(client.hget).bind(client);

const checkIfSessionUserIsHost = async (req,res,next) => {
  const { sessionRoomID, uid } = req.user;
  const targetRoomHostID = await hashGetAsync('room:' + sessionRoomID + ':property', 'host-uid');

  if(targetRoomHostID === uid) {
    next();
  }else{
    res.status(403).send('');
  }
};

module.exports ={
  checkIfSessionUserIsHost
}
