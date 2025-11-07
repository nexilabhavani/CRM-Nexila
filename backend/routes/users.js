const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// All user management endpoints require admin
router.post(
  '/',
  auth,
  requireRole('admin'),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin','employee'])
  ],
  userController.createUser
);

router.get('/', auth, requireRole('admin'), userController.listUsers);

router.delete('/:id', auth, requireRole('admin'), userController.deleteUser);

module.exports = router;
