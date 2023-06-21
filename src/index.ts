import express  from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes";

const app = express();
app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`The server is running at: ${process.env.PORT}`)
})