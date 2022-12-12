const express = require("express");
const cors = require("cors");
const port = 3000;
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "fullstack-login-2022";

const jsonParser = bodyParser.json();

app.use(cors());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "mydb",
});

app.post("/register", jsonParser, (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        connection.execute(
            "INSERT INTO user (username, password, fname, lname) VALUE (?, ?, ?, ?)",
            [req.body.username, hash, req.body.fname, req.body.lname],
            (err, results, fields) => {
                if (err) {
                    res.json({ status: "error", massage: err });
                }
                res.json({ status: "Ok" });
            }
        );
    });
});

app.post("/login", jsonParser, (req, res) => {
    connection.execute(
        "SELECT * FROM user WHERE username=?",
        [req.body.username],
        (err, user, fields) => {
            if (err) {
                res.json({ status: "error", massage: err });
            }
            if (err) {
                res.json({ status: "error", massage: "not found user" });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, isLogin) => {
                if (isLogin) {
                    const token = jwt.sign({ username: user[0].username }, secret, {
                        expiresIn: "1h",
                    });
                    res.json({ status: "Ok", massage: "login success", token });
                } else {
                    res.json({ status: "error", massage: "login fail" });
                }
            });
        }
    );
});

app.post("/authen", jsonParser, (req, res) => {
    try {
        const token = req.headers.authorization.slice(8, -1);
        const decoded = jwt.verify(token, secret);
        res.json({ decoded });
    } catch (err) {
        res.json({status: "err", massage: err})
    }
});

app.listen(port, jsonParser, () => {
    console.log("server in port " + port);
});
