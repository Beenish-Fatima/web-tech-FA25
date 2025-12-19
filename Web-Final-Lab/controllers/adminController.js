const Order = require('../models/Order');

const adminController = {
    // Admin orders dashboard
    getAdminOrders: async (req, res) => {
        try {
            const orders = await Order.find().sort({ createdAt: -1 });
            
            res.render('admin-orders', {
                title: 'Orders Dashboard - BeBuilder Admin',
                page: 'admin',
                orders
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    },
    
    // Update order status
    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            
            // Validate status
            const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Delivered'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid status' 
                });
            }
            
            const order = await Order.findByIdAndUpdate(
                orderId,
                { status },
                { new: true }
            );
            
            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Order status updated',
                order 
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error updating order status' 
            });
        }
    },
    
    // View single order
    viewOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            
            if (!order) {
                return res.status(404).render('404', {
                    title: 'Order Not Found - BeBuilder',
                    page: '404'
                });
            }
            
            res.render('admin-order-detail', {
                title: `Order ${order.orderNumber} - BeBuilder Admin`,
                page: 'admin',
                order
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).render('500', {
                title: 'Server Error - BeBuilder',
                page: '500'
            });
        }
    }
};

module.exports = adminController;