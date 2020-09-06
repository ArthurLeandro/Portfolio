const { body } = require("express-validator");

var express = require(express),
  path = require("path"),
  favicon = require("serve-favicon"),
  logger = require("morgan"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  validator = require("express-validator"),
  routes = require("./routes/index"),
  flash = require("connect-flash"),
  multer = require("multer"),
  session = require("express-section"),
  users = require("./routes/users");

var app = express();
app.use(multer({ dest: "./public/jpg/portfolio" }));
app.set("views", path.join(__dirname + "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", routes);
app.use("/users", users);

app.use(
  session({
    secret: "secret",
    saveUnitialized: true,
    resave: true,
  })
);

app.use(flash());
app.locals.moment = require("moment");
app.use((req, res, next) => {
  res.locals.message = require("express-messages")(req, res);
  next();
});
app.use(
  validator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

if (app.get("env") === "development") {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}
