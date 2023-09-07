const express = require("express");
const Article = require("../models/Article");
Article.createIndexes();

const router = express.Router();

router.get("/articles/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate("category")
      .populate("qcm");
    if (!article) {
      return res.status(404).send("Article non trouvé");
    }
    res.render("article-detail", { article });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    res.redirect("/");
  }
});

router.post("/articles/:id/submit-qcm", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate("qcm");
    if (!article || !article.qcm) {
      return res.status(404).send("Article ou QCM non trouvé");
    }

    const answers = req.body.answers;
    let score = 0;
    article.qcm.questions.forEach((question, index) => {
      if (question.options[answers[index]] === question.correctAnswer) {
        score++;
      }
    });

    res.render("qcm-result", {
      article,
      score,
      total: article.qcm.questions.length,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission du QCM:", error);
    res.redirect("/");
  }
});

router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const articles = await Article.find({ category: categoryId }).populate(
      "category"
    );

    // Envoyer les données à la vue
    res.render("articles-by-category", { articles });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur interne du serveur");
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.query;
  let page = parseInt(req.query.page) || 1;
  const limit = 10;

  if (!query) {
    return res.redirect("/");
  }

  try {
    const regex = new RegExp(`^${query}`, "i");

    const articles = await Article.find({ title: regex })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalArticles = await Article.countDocuments({ title: regex });

    res.render("search-results", {
      articles,
      query,
      currentPage: page,
      totalPages: Math.ceil(totalArticles / limit),
    });
  } catch (err) {
    console.error("Erreur lors de la recherche:", err);
    res.redirect("/");
  }
});

module.exports = router;
