const redis = require("redis");
const { promisify } = require("util");
const { renewAndGetAccessToken } = require('../services/spotify/auth')
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

const access = async (sessionRoomID, uid) => {
    const roomToken = await getAsync('room:' + sessionRoomID + ':token:' + uid);
    const refreshAccessToken = await getAsync('room:' + sessionRoomID + ':refresh-token' + uid);
    if (roomToken === null && refreshAccessToken !== null) {
        const refreshedAccessToken = await renewAndGetAccessToken(refreshAccessToken);
        client.set('room:' + sessionRoomID + ':token:' + uid, refreshedAccessToken);
        client.expire('room:' + sessionRoomID + ':token:' + uid, 3000);
        return refreshAccessToken;
    } else if (roomToken !== null) {
        return roomToken;
    } else {
        return null;
    }
};

module.exports = access;
