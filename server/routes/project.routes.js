const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.post('/', authorizeRoles(ROLES.ADMIN), validate(createProjectSchema), projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authorizeRoles(ROLES.ADMIN), validate(updateProjectSchema), projectController.updateProject);
router.post('/:id/members', authorizeRoles(ROLES.ADMIN), projectController.addProjectMember);
router.delete('/:id/members/:userId', authorizeRoles(ROLES.ADMIN), projectController.removeProjectMember);

module.exports = router;