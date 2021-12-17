require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileupload = require("express-fileupload")

mongoose.connect(process.env.DB_CONNECTION);
mongoose.connection.on('error', () => console.log('Error connecting to DataBase'));
mongoose.connection.on('connected', () => console.log('Connected to DataBase'));

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(fileupload({
  useTempFiles: true
}));

app.use("/user", require("./server/router/user.router"));
app.use((req, res, next) => {
  res.status(404).json({ msg: "Error 404! Page not found" });
})

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`App listening at PORT:${port}`));