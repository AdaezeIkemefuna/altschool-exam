const mongoose = require('mongoose');
const catchAsync = require("../utils/catchAsync")
const APIFeatures = require('../utils/apiFeatures');
const Blog = require('../models/blogModel');
const User = require("../models/userModel");
const AppError = require('../utils/appError');



exports.getAllBlogs = catchAsync(async (req, res,next) => {
const features = new APIFeatures(Blog.find({state: "published" }),req.query)
.filter()
.sort()
.paginate();
const blogs = await features.query;
    //send response
    res.status(200).json({
      status: 'success',
      result: blogs.length,
      data: {
        blogs,
      },
    });
});

exports.getUserBlogs = catchAsync(async (req, res,next) => {
    const id = mongoose.Types.ObjectId(req.user._id)
    const features = new APIFeatures(Blog.find({author:  id }),req.query)
 .filter()
 .paginate();
 const blogs = await features.query;

    res.status(200).json({
      status: 'success',
      total: blogs.length,
      data: {
        blogs,
      },
    });
});


exports.getBlog = catchAsync(async (req, res,next) => {
    const blog = await Blog.findById(req.params.id);
    if(!blog){
      return next(new AppError('No Tour found with that ID',404))
    }
    if(blog.state == "draft"){
        return next(new AppError('Unauthorized Access',403))
    }
    await Blog.findByIdAndUpdate(req.params.id, {$inc: {'read_count': 1}})
    const user = await User.find({_id: blog.author})
    res.status(200).json({
      status: 'success',
      data: {
        blog,
        user
      },
    });
});



exports.createBlog = catchAsync(async (req, res,next) => {

  const newBlog =  await new Blog({
    title: req.body.title,
    tags: req.body.tags,
    description: req.body.description,
    body: req.body.body,
    author: req.user._id
  }).save();
  res.status(201).json({
    status: 'success',
    data: {
      tour: newBlog,
    },
  });
});
exports.updateState = catchAsync(async (req, res,next) => { 
    const blog = await Blog.findById(req.params.id)
    if(!blog){
      return next(new AppError('No Blog found with that ID',404))
    }
if(blog.author.toString() === req.user._id.toString()){
    const newUpdated = await Blog.findByIdAndUpdate(req.params.id, {state: "published"},{new: true})
    res.status(200).json({
        status: 'success',
        data: {
          newUpdated,
        },
      });
}else{
    return next(new AppError('Unauthorized Access',403))
}

   
});

exports.updateBlog = catchAsync(async (req, res,next) => {

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!blog){
      return next(new AppError('No Blog found with that ID',404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
});

exports.deleteBlog = catchAsync(async (req, res,next) => {
   const blog =  await Blog.findByIdAndDelete(req.params.id);
    if(!blog){
      return next(new AppError('No Tour found with that ID',404))
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });

});


// exports.getTourStats = catchAsync(async (req, res,next) => {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } }
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$difficulty' },
//           numTours: { $sum: 1 },
//           numRatings: { $sum: '$ratingsQuantity' },
//           avgRating: { $avg: '$ratingsAverage' },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' }
//         }
//       },
//       {
//         $sort: { avgPrice: 1 }
//       }
//       // {
//       //   $match: { _id: { $ne: 'EASY' } }
//       // }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         stats
//       }
//     });
  
// });



// exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
//     const year = req.params.year * 1; // 2021

//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates'
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`)
//           }
//         }
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTourStarts: { $sum: 1 },
//           tours: { $push: '$name' }
//         }
//       },
//       {
//         $addFields: { month: '$_id' }
//       },
//       {
//         $project: {
//           _id: 0
//         }
//       },
//       {
//         $sort: { numTourStarts: -1 }
//       },
//       {
//         $limit: 12
//       }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan
//       }
//     });
// });