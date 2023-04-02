const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserById = async (id)=>
{
    const theUser = await User.findOne({ "_id": id });
    // console.log(theUser,"theUser")
    return theUser;
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

 const getUserByEmail = async(email) => {
    const theUser = await User.findOne({ email });
    // console.log("theUserByMailId",theUser)
    return theUser;
}
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */


//  const createUser = async(data) => {
//     const user =await User.isEmailTaken(data.email)
//         // // return res.send(httpStatus.NOT_ACCEPTABLE).json({message: "Email already taken"});
//         if(user)
//         {
//             throw new ApiError(httpStatus.CONFLICT, "Email already taken");
//         }
//         const newUser =await User.create(data)
//         return newUser;
  
    
// }

 const createUser = async(data) => {
    if(await User.isEmailTaken(data.email)){
        // // return res.send(httpStatus.NOT_ACCEPTABLE).json({message: "Email already taken"});
        throw new ApiError(httpStatus.OK, "Email already taken");
    }
    if(!data.email){
        throw new ApiError(httpStatus.BAD_REQUEST, "Email is not allowed to be empty");
    }
    if(!data.name){
        throw new ApiError(httpStatus.BAD_REQUEST, "Name field is required");
    }
    if(!data.password){
        throw new ApiError(httpStatus.BAD_REQUEST, "Password field is required");
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const user = await User.create({...data, password: hashedPassword});
    // return {_id:user._id,email:user.email,name:user.name,walletMoney:parseInt(user.walletMoney)};  
    return user
}



// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
    return User.findOne({_id:id},{email:1,address:1})
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};


module.exports={getUserById ,getUserByEmail,createUser,getUserAddressById,setAddress}
