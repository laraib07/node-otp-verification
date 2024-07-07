import { app } from './app.js';
import connectDB from './db/index.js';
import dotenv from "dotenv";

dotenv.config({
  path: './.env'
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`⚙  Server is running at port: ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Starting server failed!!", error);
  });