const router = require('express').Router();
const c = require('../controllers/orderController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.post('/', roleMiddleware('customer'), c.createOrder);
router.get('/', c.getOrders);
router.get('/:id', c.getOrder);
router.put('/:id/status', c.updateOrderStatus);

module.exports = router;
