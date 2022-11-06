const express = require('express');
const blogController = require('./../controllers/blogController');
const authController = require("../controllers/authController");

const router = express.Router();
 
 router.route('/')
 .post(authController.protect,blogController.createBlog)
 .get(blogController.getAllBlogs)

 router.route("/user")
 .get(authController.protect,blogController.getUserBlogs);

router.route('/:id')
.get(blogController.getBlog)
.patch(authController.protect,blogController.updateState)
.put(authController.protect,blogController.updateBlog)
.delete(authController.protect, blogController.deleteBlog)


module.exports = router;