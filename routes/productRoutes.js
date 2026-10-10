const router = require('express').Router();
const c = require('../controllers/productController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', c.getProducts);
router.get('/:id', c.getProduct);
router.post('/', authMiddleware, roleMiddleware('seller'), c.createProduct);
router.put('/:id', authMiddleware, roleMiddleware('seller'), c.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('seller'), c.deleteProduct);

module.exports = router;
