const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');

const router = express.Router();

router.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('category');
        if (!article) {
            return res.status(404).send("Article non trouvé");
        }
        res.render('article-detail', { article });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'article:', error);
        res.redirect('/');
    }
});

router.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const articles = await Article.find({ category: categoryId }).populate('category');

        // Envoyer les données à la vue
        res.render('articles-by-category', { articles });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur interne du serveur");
    }
});


module.exports = router;
