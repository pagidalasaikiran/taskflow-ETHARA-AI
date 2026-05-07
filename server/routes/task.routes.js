const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
  getTaskStats,
} = require('../controllers/task.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator');

const router = express.Router();

router.use(protect); // All task routes are protected

router.get('/stats', getTaskStats);
router.get('/project/:projectId', getTasksByProject);

router.route('/')
  .get(getTasks)
  .post(validate(createTaskSchema), createTask);

router.route('/:id')
  .get(getTask)
  .put(validate(updateTaskSchema), updateTask)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
