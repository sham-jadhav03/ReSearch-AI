import "dotenv/config";
import app from './src/app.js'
import http from 'http'
import connectDB from './src/config/db.js';

connectDB();

const httpServer = http.createServer(app)

httpServer.listen(4000, ()=> {
    console.log('Server is running on port 4000');
    
})