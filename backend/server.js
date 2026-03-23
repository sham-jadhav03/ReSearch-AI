import "dotenv/config";
import app from './src/app.js'
import connectDB from './src/config/db.js';

connectDB();


app.listen(4000, ()=> {
    console.log('Server is runnig on port 4000');
    
})