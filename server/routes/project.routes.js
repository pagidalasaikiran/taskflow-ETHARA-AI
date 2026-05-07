const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');

const router = express.Router();

router.use(protect); // All project routes are protected

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), validate(createProjectSchema), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), validate(updateProjectSchema), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
