const express = require("express");
const Article = require("../models/Article");
const Category = require("../models/Category");
const QCM = require("../models/Qcm");

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
    const qcms = await QCM.find(); // Récupérez tous les QCMs
    res.render("add-article", { categories, qcms });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories ou des QCMs:",
      error
    );
    res.redirect("/admin");
  }
});

router.post("/add-article", checkAdmin, async (req, res) => {
  try {
    const { title, summary, content, category, qcm } = req.body;
    const article = new Article({
      title,
      summary,
      content,
      category,
      qcm: qcm || undefined,
    });
    await article.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Erreur lors de l ajout de l article:", error);
    res.redirect("/admin/add-article");
  }
});

router.get("/add-qcm", checkAdmin, (req, res) => {
  res.render("add-qcm");
});

router.post("/add-qcm", checkAdmin, async (req, res) => {
  const { title, questions } = req.body;

  const formattedQuestions = questions.map((question) => ({
    content: question.text,
    options: [question.choices.A, question.choices.B, question.choices.C],
    correctAnswer: question.choices[question.answer],
  }));

  const qcm = new QCM({
    title,
    questions: formattedQuestions,
  });

  try {
    await qcm.save();
    res.redirect("/admin");
  } catch (err) {
    console.error("Erreur lors de l'ajout du QCM:", err);
    res.status(500).render("add-qcm", {
      title: req.body.title,
      questions: req.body.questions,
      databaseError: "Une erreur est survenue lors de la sauvegarde du QCM.",
    });
  }
});

router.get("/", checkAdmin, async (req, res) => {
  try {
    const numberOfArticles = await Article.countDocuments({});
    const numberOfCategories = await Category.countDocuments({});
    const numberOfQCM = await QCM.countDocuments({});

    res.render("admin-dashboard", {
      numberOfArticles,
      numberOfCategories,
      numberOfQCM,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/admin-login");
  }
});

router.get("/articles-list", checkAdmin, async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = 10;

  try {
    let articles = await Article.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category");

    let totalArticles = await Article.countDocuments();

    res.render("articles-list", {
      articles,
      currentPage: page,
      totalPages: Math.ceil(totalArticles / limit),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/articles/:id/edit", checkAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "category qcm"
    );
    
    const categories = await Category.find();
    const qcms = await QCM.find();

    if (!article) {
      return res.status(404).send("Article non trouvé");
    }

    res.render("article-edit", {
      article,
      categories,
      qcms,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des détails de l'article:",
      err
    );
    res.redirect("/admin/articles-list");
  }
});

router.post("/articles/:id/edit", checkAdmin, async (req, res) => {
  try {
    const { title, summary, content, category, qcm } = req.body;

    const updatedArticle = {
      title,
      summary,
      content,
      category,
      qcm: qcm || null,
    };

    await Article.findByIdAndUpdate(req.params.id, updatedArticle);
    res.redirect("/admin/articles-list");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);
    res.redirect(`/admin/articles/${req.params.id}/edit`);
  }
});

router.get("/articles/:id/delete", checkAdmin, async (req, res) => {
  try {
    await Article.findByIdAndRemove(req.params.id);
    res.redirect("/articles-list");
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    res.redirect("/articles-list");
  }
});

router.get("/qcms-list", checkAdmin, async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = 10;

  try {
    let qcms = await QCM.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let totalQCMs = await QCM.countDocuments();

    res.render("qcms-list", {
      qcms,
      currentPage: page,
      totalPages: Math.ceil(totalQCMs / limit),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/qcms/:id/edit", checkAdmin, async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id);
    if (!qcm) {
      return res.status(404).send("QCM non trouvé");
    }
    res.render("qcm-edit", { qcm });
  } catch (error) {
    console.error("Erreur lors de la récupération du QCM:", error);
    res.redirect("/qcms-list");
  }
});

router.post("/qcms/:id/edit", checkAdmin, async (req, res) => {
  try {
    const { title, questions } = req.body;

    const formattedQuestions = questions.map((question) => ({
      content: question.text,
      options: [question.choices.A, question.choices.B, question.choices.C],
      correctAnswer: question.choices[question.answer],
    }));

    await QCM.findByIdAndUpdate(req.params.id, {
      title,
      questions: formattedQuestions,
    });

    res.redirect("/admin/qcms-list");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du QCM:", error);
    res.redirect(`/admin/qcms/${req.params.id}/edit`);
  }
});

router.get("/qcms/:id/delete", checkAdmin, async (req, res) => {
  try {
    await QCM.findByIdAndRemove(req.params.id);
    res.redirect("/qcms-list");
  } catch (error) {
    console.error("Erreur lors de la suppression du QCM:", error);
    res.redirect("/qcms-list");
  }
});

module.exports = router;
