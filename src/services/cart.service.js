const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { objectId } = require("../validations/custom.validation");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({email:user.email})
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({email:user.email});

  if (!cart){
    try{
       cart = await Cart.create({
        email:user.email,
        cartItems:[],
        paymentOption:config.default_payment_option,
        });
        await cart.save();
    }catch(e){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"User cart creation failed");
    }
  }

//

//if the given productId is already in cart, throw error

// cart:{
//   email:"asd@gmail.com",
//   cartItems:[
//     {product:{_id: objectId('1'),name:"Phone",cost:12000, "rating":"5"} quantity:10},
//     {product:{_id: objectId('1'),name:"Phone",cost:12000, "rating":"5"} quantity:10},
//     {product:{_id: objectId('1'),name:"Phone",cost:12000, "rating":"5"} quantity:10},
//   ]
// }

if(cart.cartItems.some((item)=>item.product._id == productId))
{
  throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
}

const product = await Product.findOne({_id:productId})
if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST,"product doesn't exist in the database")
}

cart.cartItems.push({ product,quantity})
await cart.save();

return cart;

};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  
  const cart = await Cart.findOne({email:user.email});

  if (!cart){
  
      throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
    
  }


//[ {P:{id},Q} , {P:{id},Q} , {P:{id},Q} , {P:{id},Q} ]

const product = await Product.findOne({_id: productId});

if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
}

const productIndex = cart.cartItems.findIndex(item => item.product._id == productId);

 if(productIndex ===-1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
 }

 cart.cartItems[productIndex].quantity = quantity;

 await cart.save();
 return cart;
}
// if(!productToUpdate){
//   const productToAdd = await Product.findById(productId)
  
//   if(!productToAdd){
//     throw ApiError(httpStatus.BAD_REQUEST,"Product does not exist")
//   }

  // cart.cartItems.push({product:productToAdd,quantity})

// }
// else{
//   throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
// }



// const newCart = await cart.save();
// return newCart;


const deleteProductFromCart = async (user, productId) => {
  
 const cart = await Cart.findOne({email:user.email});
 if(!cart){
  throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart")
 }
 const productIndex = cart.cartItems.findIndex(item => item.product._id == productId);

 if(productIndex ===-1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
 }

 cart.cartItems.splice(productIndex,1)
 await cart.save();

};





// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const cart = await Cart.findOne({email:user.email})

  if(cart == null){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
  }
  if(cart.cartItems.length==0)
  {
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have items in the cart");
  }

  const hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if(!hasSetNonDefaultAddress)
  throw new ApiError(httpStatus.BAD_REQUEST,"Address not set");

  const total = cart.cartItems.reduce((acc,item)=>{
    acc=acc+(item.product.cost *item.quantity);
    return acc;
  },0)

  if(total > user.walletMoney){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have sufficient balance")
  }
  user.walletMoney -= total;
  await user.save();

  cart.cartItems= []
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
