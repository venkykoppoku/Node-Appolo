const uuid = require("uuid");
const crypto = require("crypto");
const q = require("q");

function hash(str) {
  const hmac = crypto.createHmac(
    "sha256",
    process.env.HASH_SECRET || "test-secret"
  );
  hmac.update(str);
  return hmac.digest("hex");
}

function createToken() {
  return (
    "token." +
    uuid
      .v4()
      .split("-")
      .join("")
  );
}

class UserService {
  constructor(db) {
    this.db = db;
    this.getUserProfileByToken = this.getUserProfileByToken.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  /**
   * Registers a user and returns it's token
   * @param {String} name
   * @param {String} email
   * @param {String} password
   * @return {Promise} resolves to user's token or rejects with Error that has statusCodes
   */
  registerUser(name, email, password) {
    let deferred = q.defer();

    this.db.collection("users").findOne({ email: email }, (err, usr) => {
      if (err || usr) {
        deferred.reject(new Error("request fields must not empty"));
      } else {
        this.db.collection("users").insertOne(
          {
            name: name,
            email: email,
            password: hash(password),
            token: createToken()
          },
          (err, user) => {
            if (err) {
              deferred.reject(new Error("request fields must not empty"));
            }
            deferred.resolve(user.ops[0].token);
          }
        );
      }
    });

    return deferred.promise;
  }

  /**
   * Gets a user profile by token
   * @param {String} token
   * @return {Promise} that resolves to object with email and name of user or rejects with error
   */
  getUserProfileByToken(token) {
    let deferred = q.defer();
    if (token) {
      this.db.collection("users").findOne(
        {
          token: token
        },
        (err, user) => {
          if (err) {
            deferred.reject(new Error("request fields must not empty"));
          }

          deferred.resolve(user);
        }
      );
    } else {
      deferred.reject(new Error("request fields must not empty"));
    }

    return deferred.promise;
  }

  /**
   * Log in a user to get his token
   * @param {String} email
   * @param {String} password
   * @return {Promise} resolves to token or rejects to error
   */
  logIn(email, password) {
    let deferred = q.defer();
    this.db.collection("users").findOne(
      {
        email: email,
        password: hash(password)
      },
      (err, user) => {
        if (err) {
          return deferred.reject(new Error("request fields must not empty"));
        }
        if (user) {
          deferred.resolve(user.token);
        } else {
          deferred.reject(new Error("email or password not matched"));
        }
      }
    );

    return deferred.promise;
  }

  logOut(token) {
    let deferred = q.defer();
    this.db
      .collection("users")
      .updateOne(
        {
          token: token
        },
        {
          $set: {
            token: ""
          }
        }
      )
      .then(res => {
        deferred.resolve("Successfully LoggedOut");
      })
      .catch(err => {
        deferred.reject(new Error("request fields must not empty"));
      });
    return deferred.promise;
  }
}

module.exports.UserService = UserService;
