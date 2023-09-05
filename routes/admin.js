const express = require("express");
const Article = require("../models/Article");
const Category = require("../models/Category");

const router = express.Router();

function checkAdmin(req, res, next) {
  if (req.session.adminAuthenticated) {
    return next();
  }
  res.redirect("/admin-login");
}

router.get("/add-category", checkAdmin, (req, res) => {
  res.render("add-category");
});

router.post("/add-category", checkAdmin, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.redirect("/admin");
  } catch (error) {
    res.redirect("/admin/add-category");
  }
});

router.get("/add-article", checkAdmin, async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("add-article", { categories });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.redirect("/admin");
  }
});

router.post("/add-article", checkAdmin, async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.redirect("/admin");
  } catch (error) {
    res.redirect("/admin/add-article");
  }
});

router.get("/", checkAdmin, async (req, res) => {
  try {
    const numberOfArticles = await Article.countDocuments({});
    const numberOfCategories = await Category.countDocuments({});

    res.render("admin-dashboard", { numberOfArticles, numberOfCategories });
  } catch (err) {
    console.log(err);
    res.redirect("/admin-login");
  }
});

module.exports = router;
