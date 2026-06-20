const reviewModel = require('../models/reviewModel');

const addReview = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, order_id, rating, comment } = req.body;

    if (!product_id || !order_id || !rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đánh giá' });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

    const trimmedComment = String(comment).trim();
    if (!trimmedComment) {
      return res.status(400).json({ message: 'Nội dung nhận xét không được để trống' });
    }

    // Check if user purchased the product and order is DELIVERED
    const isEligible = await reviewModel.hasUserPurchasedProduct(userId, product_id, order_id);
    if (!isEligible) {
      return res.status(403).json({
        message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua từ đơn hàng giao thành công'
      });
    }

    try {
      const reviewId = await reviewModel.createReview({
        userId,
        productId: product_id,
        orderId: order_id,
        rating: ratingNum,
        comment: trimmedComment
      });

      res.status(201).json({
        message: 'Gửi đánh giá thành công',
        review_id: reviewId
      });
    } catch (dbErr) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Món bánh này trong đơn hàng đã được đánh giá trước đó' });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ' });
    }

    const [reviews, stats] = await Promise.all([
      reviewModel.getReviewsByProductId(productId),
      reviewModel.getProductRatingStats(productId)
    ]);

    res.json({
      reviews,
      stats
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const reviews = await reviewModel.getReviewsForUser(userId);
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getUserReviews
};
