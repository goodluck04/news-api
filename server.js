import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors"
import { limiter } from "./config/ratelimit.js";


const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload());
app.use(express.static("public"));
app.use(helmet());
app.use(cors());
app.use(limiter);


app.get("/", (req, res) => {
    return res.json({ message: "Hello It's working" });
});

// logger
// logger.error("Hey I am just testing..");
// add this in catch block instaed of console log

// jobs import
import "./jobs/index.js";



// Import api route
import ApiRoutes from "./routes/api.js";
import rateLimit from "express-rate-limit";
import { logger } from "./config/logger.js";
app.use("/api", ApiRoutes);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
