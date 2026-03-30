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
        const userId = socket.handshake.auth?.userId;
        if(userId){
            socket.join(userId)
            console.log(`User ${userId} joined their room.`);
            
        }
        console.log("A user connected "+socket.id)
    })
    return io;
}

export const getIo = () => {
    if(!io){
        throw new Error("Socket.io not connected")
    }
  return io;
}