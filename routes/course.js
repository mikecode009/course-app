const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const course = new Course(req.body);
  try {
    await course.save();
    res.status(201).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.send(courses);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/latest', async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ _id: -1 }).limit(10);
    res.send(courses);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/recommended', async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ rating: -1 }).limit(10);
    res.send(courses);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send();
    }
    res.send(course);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/:id/review', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send();
    }
    course.comments.push({ user: req.user._id, text: req.body.text, rating: req.body.rating });
    course.rating = (course.rating * course.comments.length + req.body.rating) / (course.comments.length + 1);
    await course.save();
    res.send(course);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send();
    }
    if (!user.favourites.includes(course._id)) {
      user.favourites.push(course._id);
      await user.save();
    }
    res.send(user.favourites);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send();
    }
    user.favourites = user.favourites.filter(fav => fav.toString() !== course._id.toString());
    await user.save();
    res.send(user.favourites);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/favourites', auth, async (req, res) => {
  try {
    await req.user.populate('favourites').execPopulate();
    res.send(req.user.favourites);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
