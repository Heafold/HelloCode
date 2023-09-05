const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 3000;

const dbURI = process.env.DB_URI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connecté à la base de données MongoDB");
    app.listen(port, () => {
      console.log(`Serveur démarré sur http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));

app.use(
  session({
    secret: "azerty",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: dbURI }),
  })
);

app.set("view engine", "pug");

app.use("/", authRoutes);


