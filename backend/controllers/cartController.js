const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

const addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity = 1 } = req.body || {};
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    // ensure cart exists
    let cart = await cartModel.findCartByUserId(userId);
    if (!cart) cart = await cartModel.createCart(userId);

    // get product price
    const product = await productModel.getProductById(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existingItem = await cartModel.findCartItem(cart.cart_id, product_id);
    const existingQty = existingItem ? Number(existingItem.quantity) : 0;
    const nextQty = existingQty + Number(quantity);

    if (nextQty > product.quantity) {
      if (product.quantity <= 0) {
        return res.status(400).json({ message: `Sản phẩm "${product.name}" đã hết hàng.` });
      }
      return res.status(400).json({ 
        message: `Không thể thêm. Trong giỏ đã có ${existingQty} sản phẩm. Kho chỉ còn ${product.quantity} sản phẩm.` 
      });
    }

    const added = await cartModel.addOrUpdateCartItem(cart.cart_id, product_id, Number(quantity), product.price);
    const full = await cartModel.getCartWithItems(cart.cart_id);
    return res.json({ cart: full.cart, items: full.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    let cart = await cartModel.findCartByUserId(userId);
    if (!cart) return res.json({ cart: null, items: [] });
    const full = await cartModel.getCartWithItems(cart.cart_id);
    res.json({ cart: full.cart, items: full.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity } = req.body || {};
    if (!product_id || typeof quantity === 'undefined') return res.status(400).json({ message: 'product_id and quantity required' });

    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const product = await productModel.getProductById(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (Number(quantity) > product.quantity) {
      return res.status(400).json({ 
        message: `Số lượng yêu cầu (${quantity}) vượt quá tồn kho hiện tại của sản phẩm (${product.quantity} sản phẩm).` 
      });
    }

    if (Number(quantity) <= 0) {
      await cartModel.removeCartItem(cart.cart_id, product_id);
    } else {
      await cartModel.updateCartItemQuantity(cart.cart_id, product_id, Number(quantity));
    }

    const full = await cartModel.getCartWithItems(cart.cart_id);
    res.json({ cart: full.cart, items: full.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.body || {};
    if (!product_id) return res.status(400).json({ message: 'product_id required' });

    const cart = await cartModel.findCartByUserId(userId);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    await cartModel.removeCartItem(cart.cart_id, product_id);
    const full = await cartModel.getCartWithItems(cart.cart_id);
    res.json({ cart: full.cart, items: full.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addToCart, getCart, updateCart, removeFromCart };
