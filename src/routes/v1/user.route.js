const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth");


const router = express.Router();
const validation = auth;
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`

router.get('/:userId', validation, validate(userValidation.getUser), userController.getUser);

//THIS IS IMPORTANT.
//validate = (schema)=>(req, res, next). : Validate is defined like this
//which means that on calling validate(schema) it returns a middleware function which gets executed.






router.put(
  "/:userId",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;
