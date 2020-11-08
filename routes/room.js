const express = require('express');
const redis = require("redis");
const { promisify } = require("util");
const SpotifyWebApi = require('spotify-web-api-node');
const roomNanoIDGen = require('nanoid').customAlphabet(
    '1234567890', 8);
const userNanoIDGen = require('nanoid').customAlphabet(
    '1234567890', 6);
const { broadcast } = require('../services/socketio/broadcast');
const signJWT = require('../services/jwt/sign');
const tokenAccessor = require('../utils/spotifyTokenAccessor');
const { checkIfSessionUserIsHost } = require('../middlewares/guard');
const { authenticateToken } = require('../middlewares/decodeJWT');
const { EDESTADDRREQ } = require('constants');

const router = express.Router();
const client = redis.createClient();

const credentials = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_KEY,
};


const listLenAsync = promisify(client.llen).bind(client);
const listListAsync = promisify(client.lrange).bind(client);
const setListAsync = promisify(client.smembers).bind(client);
const hashGetAsync = promisify(client.hget).bind(client);
const setIsMemberAsync = promisify(client.sismember).bind(client);

router.get('/', async (req, res) => {
  const rooms = await setListAsync('room-list');
  res.send({
    rooms
  })
});

router.post('/:roomID/join', async (req,res) => {
  const { roomID } = req.params;
  const isSetExist = await setIsMemberAsync('room-list', roomID);
  if(isSetExist === 0){
    res.status(400).json({
      success: false,
      message: "Not found"
    });
    return;
  }
  const userID = userNanoIDGen();
  const jwt = signJWT({
    sessionRoomID: roomID, uid: userID
  });
  res.json({
    token: jwt, uid: userID
  })
});

router.patch('/queue/track/remove', authenticateToken, async (req,res) => {
  const { trackURI } = req.body;
  client.lrem(req.user.sessionRoomID, 0, trackURI);
  broadcast('room-io', 'refresh control', {
    roomID: req.user.sessionRoomID
  });
});

router.post('/delete', authenticateToken, checkIfSessionUserIsHost, async(req,res)=>{
  const roomID = req.user.sessionRoomID;
  client.del(roomID);
  client.srem('room-list',roomID);
  client.del('room:' + roomID + ':property')
  broadcast('room-io', 'refresh control', {
    roomID
  });
  res.json({
    success:true
  })
})

router.post('/', async (req,res) => {
  const roomID = roomNanoIDGen();
  const hostID = userNanoIDGen();
  client.hset('room:' + roomID + ':property', 'host-uid', hostID);
  client.hset('room:' + roomID + ':property', 'started-at', Date.now());
  client.hset('room:' + roomID + ':property', 'is-ended', false);
  client.sadd('room-list', roomID);
  const jwt = signJWT({
    sessionRoomID: roomID, uid: hostID
  });
  res.send({
    roomID, token: jwt, uid: hostID
  })
});

// should automate this if there's nothing playing it should play on queue
router.post('/queue', authenticateToken, async (req,res) => {
  const roomID = req.user.sessionRoomID;
  const { trackURI } = req.body;
  const localSpotifyApi = new SpotifyWebApi(credentials);
  if(trackURI.trim() === ''){
    res.status(400);
    return;
  }
  client.rpush(roomID, trackURI);
  try{
    const accessToken = await tokenAccessor(roomID, req.user.uid);
    localSpotifyApi.setAccessToken(accessToken);
    await localSpotifyApi.addToQueue(trackURI)
    broadcast('room-io', 'refresh control', {
      roomID
    });
    res.json({
      trackURI
    })
  }catch(e) {
    res.status(500).send(e.toString());
  }
});

router.get('/:roomID/detail', async (req, res) => {
  const { roomID } = req.params;
  const queLength = await listLenAsync(roomID);
  const queue = await listListAsync(roomID, 0, queLength);
  const startedAt = await hashGetAsync('room:' + roomID + ':property', 'started-at');
  const isEnded = await hashGetAsync('room:' + roomID + ':property', 'is-ended');
  const hostUID = await hashGetAsync('room:' + roomID + ':property', 'host-uid');
  res.send({
    queue, startedAt, isEnded, hostUID
  })
});

module.exports = router;
