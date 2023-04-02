const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");

// TODO: CRIO_TASK_MODULE_AUTH - Set mechanism to retrieve Jwt token from user request
/**
 * These config options are required
 * Option 1: jwt secret environment variable set in ".env"
 * Option 2: mechanism to fetch jwt token from request Authentication header with the "bearer" auth scheme
 */
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// TODO: CRIO_TASK_MODULE_AUTH - Implement verify callback for passport strategy to find the user whose token is passed
/**
 * Logic to find the user matching the token passed
 * - If payload type isn't `tokenTypes.ACCESS` return an Error() with message, "Invalid token type" in the callback function
 * - Find user object matching the decoded jwt token
 * - If there's a valid user, return the user in the callback function
 * - If user not found, return `false` in the user field in the callback function
 * - If the function errs, return the error in the callback function
 *
 * @param payload - the payload the token was generated with
 * @param done - callback function
 */
// const jwtVerify = async (payload, done) => {
//   try
//   {
//     const user = await User.findById(payload.sub)
//     if (!user)
//     {
//        done(null,false)
//     }
//      done(null,user)
//   }catch(err)
//   {
//     done(err, false)
//   }
// };

const jwtVerify = async (payload, done) => {
  // console.log(payload,"payload")
  try{
    if(payload.type !== tokenTypes.ACCESS){
      return done(new Error("Invalid Token Type"), false);
    }

    if(payload.time > payload.expiry){
      return done(new Error("Token expired, please re-login"), false);
    }

    const user = await User.findById(payload.sub) //payload.user._id 
    if(!user){
      return done(null, false);
    }
    done(null, user);
  } catch(err) {
    return done(err, false);
  }
};
 

// TODO: CRIO_TASK_MODULE_AUTH - Uncomment below lines of code once the "jwtVerify" and "jwtOptions" are implemented
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
