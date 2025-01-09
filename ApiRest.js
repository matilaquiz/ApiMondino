const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')
const mysql = require('mysql2');
const multer=require('multer')
const fs=require('node:fs');
const path = require('node:path');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chipote10",
  database: "mondinobd"
});

db.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

module.exports = db;
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(cors())
//-----cargar imagen----------
const upload=multer({dest:'uploads/'})

app.post('/imagen',upload.single("image"),(req,res)=>{
  console.log(req.file)
  renombrarImg(req.file)
  res.send("terminado")
})

const renombrarImg=(imagen)=>{
  let newDireccion="./uploads/" + imagen.originalname;

  fs.renameSync(imagen.path,newDireccion)
  return newDireccion
}




app.get('/buscarProductos',(req,res)=>{
    const sql='SELECT * FROM productos '
    db.query(sql,(err,result)=>{
        if (err){
            return res.status(400).send(err)
        }
        res.status(200).send(result)
    })
})

app.get("/buscarProducto/:id",(req,res)=>{
  const {id}=req.params
  const sql="SELECT * FROM productos where idProducto=?"
  db.query(sql,[id],(err,result)=>{
    if (err){
        return res.status(400).send(err)
    }
    res.status(200).send(result[0])
    
})
})


app.get('/buscarCategorias',(req,res)=>{
    const sql='SELECT * FROM categorias'
    db.query(sql,(err,result)=>{
        if (err){
            return res.status(400).send(err)
        }
        res.status(200).send(result)
        
    })
})


app.listen(port, () => {
    console.log("server ok")
  })