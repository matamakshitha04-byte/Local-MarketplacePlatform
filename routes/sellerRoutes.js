const router = require('express').Router();
const { getSellerProducts } = require('../controllers/productController');
const { getOrders } = require('../controllers/orderController');
const { getStats } = require('../controllers/sellerController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('seller'));
router.get('/products', getSellerProducts);
router.get('/orders', getOrders);
router.get('/stats', getStats);

module.exports = router;
