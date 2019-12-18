const { UserService } = require("../services/user-service");
const { InputValidator } = require("../validators/input-validator");

class AuthenticationController {
  constructor(db) {
    this.userService = new UserService(db);
    this.registerUser = this.registerUser.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  // Validate Email
  // Validate Password
  // Save User
  registerUser(req, res, next) {
    const { name, email, password } = req.body;
    if (name && email && password) {
      const result = this.userService.registerUser(name, email, password);
      result
        .then(x => {
          res.status(201).send({ token: x });
        })
        .catch(err => {
          res.sendStatus(400);
        });
    } else res.sendStatus(400);
  }

  logIn(req, res, next) {
    const { email, password } = req.body;
    if (email && password) {
      const result = this.userService.logIn(email, password);
      result
        .then(x => {
          res.status(200).send({ token: x });
        })
        .catch(err => {
          res.sendStatus(400);
        });
    } else res.sendStatus(400);
  }

  logOut(req, res, next) {
    const { token } = req.query;
    if (token) {
      const result = this.userService.logOut(token);
      result
        .then(x => {
          res.sendStatus(200);
        })
        .catch(err => {
          res.sendStatus(400);
        });
    } else res.sendStatus(400);
  }
}

module.exports.AuthenticationController = AuthenticationController;
