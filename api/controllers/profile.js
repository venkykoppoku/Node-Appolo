const { UserService } = require("../services/user-service");

class ProfileController {
  constructor(db) {
    this.userService = new UserService(db);
    this.getUserProfile = this.getUserProfile.bind(this);
  }

  getUserProfile(req, res, next) {
    if (req.token) {
      const result = this.userService.getUserProfileByToken(req.token);
      result
        .then(x => {
          res.status(200).send(x.email);
        })
        .catch(err => {
          res.sendStatus(401);
        });
    } else res.sendStatus(401);
  }
}

module.exports.ProfileController = ProfileController;
