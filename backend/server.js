import "dotenv/config";
import app from './src/app.js'
import http from 'http'
import connectDB from './src/config/db.js';

connectDB();

const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app)

httpServer.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
    
})