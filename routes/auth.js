const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Category = require("../models/Category");
const Article = require("../models/Article");

const router = express.Router();

function checkAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

function checkAdmin(req, res, next) {
  if (req.session.adminAuthenticated) {
    return next();
  }
  res.redirect("/admin-login");
}

router.get("/", checkAuthenticated, async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = 10;

  try {
    let articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category");

    let totalArticles = await Article.countDocuments();

    res.render("index", {
      username: req.session.user.username,
      articles,
      currentPage: page,
      totalPages: Math.ceil(totalArticles / limit),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    if (req.body.password !== req.body.passwordConfirm) {
      throw new Error("Les mots de passe ne correspondent pas");
    }

    const user = new User(req.body);

    await user.save();
    req.session.user = user;
    res.redirect("/");
  } catch (error) {
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    req.session.user = user;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/admin-login", (req, res) => {
  res.render("admin-login");
});

router.post("/admin-login", (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (req.body.password === adminPassword) {
    req.session.adminAuthenticated = true;
    res.redirect("/admin");
  } else {
    res.redirect("/admin-login");
  }
});

module.exports = router;
