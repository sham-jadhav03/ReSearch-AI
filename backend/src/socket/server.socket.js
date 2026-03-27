import {Server} from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer,{
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    })

    console.log("Socket.io server is RUNNING");
    
    io.on("connection", (socket)=>{
        console.log("A user connected"+socket.id)
    })
}

export const getIo = () => {
    if(!io){
        throw new Error("Socket.io not connected")
    }
  return io;
}