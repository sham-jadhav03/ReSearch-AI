import express from "express";
import cors from "cors"
import morgan from "morgan"

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/", (req, res) => {
    res.send("hello from server");
});

export default app