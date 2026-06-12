const db = require('../config/db');

const getReportStats = async (req, res) => {
  try {
    // 1. Total Revenue (exclude CANCELLED orders)
    const [revRows] = await db.query(
      "SELECT SUM(total_price) AS total_revenue FROM `Order` WHERE status != 'CANCELLED'"
    );
    const totalRevenue = Number(revRows[0]?.total_revenue || 0);

    // 2. Total Orders
    const [orderRows] = await db.query(
      "SELECT COUNT(*) AS total_orders FROM `Order`"
    );
    const totalOrders = Number(orderRows[0]?.total_orders || 0);

    // 3. Total Customers
    const [custRows] = await db.query(
      "SELECT COUNT(*) AS total_customers FROM Customer"
    );
    const totalCustomers = Number(custRows[0]?.total_customers || 0);

    // 4. Active Products
    const [prodRows] = await db.query(
      "SELECT COUNT(*) AS total_products FROM Product"
    );
    const totalProducts = Number(prodRows[0]?.total_products || 0);

    res.json({
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      total_customers: totalCustomers,
      total_products: totalProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    // Revenue for the last 30 days grouped by date
    const [rows] = await db.query(
      `SELECT
        DATE_FORMAT(order_date, '%Y-%m-%d') AS date,
        SUM(total_price) AS revenue,
        COUNT(order_id) AS orders_count
      FROM \`Order\`
      WHERE status != 'CANCELLED'
        AND order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(order_date, '%Y-%m-%d')
      ORDER BY date ASC`
    );

    res.json({ revenue: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTopProductsReport = async (req, res) => {
  try {
    // Top 5 best selling products based on OrderDetail (exclude CANCELLED orders)
    const [rows] = await db.query(
      `SELECT
        p.product_id,
        p.name,
        p.price,
        p.image,
        SUM(od.quantity) AS total_sold,
        SUM(od.quantity * od.price) AS total_revenue
      FROM OrderDetail od
      INNER JOIN \`Order\` o ON o.order_id = od.order_id
      INNER JOIN Product p ON p.product_id = od.product_id
      WHERE o.status != 'CANCELLED'
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT 5`
    );

    res.json({ products: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getReportStats,
  getRevenueReport,
  getTopProductsReport
};
