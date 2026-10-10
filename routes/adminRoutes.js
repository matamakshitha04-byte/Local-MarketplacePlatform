const router = require('express').Router();
const c = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('admin'));
router.get('/stats', c.getStats);
router.get('/users', c.getUsers);
router.put('/users/:id/status', c.setUserStatus);
router.delete('/users/:id', c.deleteUser);
router.get('/products', c.getProducts);
router.delete('/products/:id', c.deleteProduct);

module.exports = router;
