let io = null;

const broadcast = (channelName,event,message) =>{
  if(io === null){
    return;
  }
  io.of(channelName).emit(event,message);
}

const setIO = (ioInstance) => {
  io = ioInstance;
};

module.exports = {
  broadcast,
  setIO
}
