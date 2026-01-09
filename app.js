require("dotenv").config();
const express = require("express");
const registerRouter = require("./routes/register.js");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/register", registerRouter);

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`http://localhost:${process.env.SERVER_PORT || 3000}/register`);
});
