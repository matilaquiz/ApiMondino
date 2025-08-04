require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chipote10",
  database: "mondinobd",
});

db.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + db.threadId);
});

module.exports = db;
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors());
//-----cargar imagen----------
const upload = multer({ dest: "uploads/" });

app.post("/imagen", upload.single("image"), (req, res) => {
  console.log(req.file);
  renombrarImg(req.file);
  res.send("terminado");
});

const renombrarImg = (imagen) => {
  let newDireccion = "./uploads/" + imagen.originalname;

  fs.renameSync(imagen.path, newDireccion);
  return newDireccion;
};

app.get("/buscarProductos", (req, res) => {
  const sql = "SELECT * FROM productos ";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(result);
  });
});

app.get("/buscarProducto/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos where idProducto=?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(result[0]);
  });
});

app.get("/buscarCategorias", (req, res) => {
  const sql = "SELECT * FROM categorias";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.status(200).send(result);
  });
});

app.post("/generarPassword", (req, res) => {
  const { mail, pass } = req.body;
  /* const hashedPassword = bcrypt.hashSync(pass, 10);
  console.log(hashedPassword); */
  const sql = "SELECT * FROM usuarios WHERE username = ?";
  db.query(sql, [mail], (err, resp) => {
    if (err) return res.status(500).json({ message: "Error en el servidor" });

    if (resp.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = resp[0];
    const isMatch = pass ? bcrypt.compareSync(pass, user.password) : false;

    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
    );

    // firmar el token con el archivo jwt

    res.json({ token });
  });
});

app.get("/firmarToken", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(decoded);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "tu token expiro" });
    } else {
      res.status(401).json({ message: "token inválido" });
    }
  }
});

app.listen(port, () => {
  console.log("server ok");
});
