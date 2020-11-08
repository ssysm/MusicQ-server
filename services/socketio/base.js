const roomSocketConnectionHandler = require('./roomEvent');
const { setIO } = require('./broadcast');
const ioInstance = (io) =>{
  io.of('/room-io')
    .on('connection', roomSocketConnectionHandler);
  setIO(io);
}

module.exports = ioInstance;
