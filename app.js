//import modules
const express = require('express')
const app = express()
const exphand = require('express-handlebars');
const { studentDatas } = require('./profiling');
const joi = require('joi');
const fs = require('fs')

const contactdetails = JSON.parse(fs.readFileSync('./contact.json', 'utf8'))

const mapped = studentDatas.map((item, index)=>{
    return {...item, studentNum: index + 1}
});

//set up engine
app.engine('hbs', exphand.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

//set up middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//set engine
app.set('view engine', 'hbs');

//routes
app.get('/', (req, res)=>{
res.render('index', {mapped});
});

app.get('/students/:id?', (req, res) =>{
    const mystudent = req.params.id
    if (!mystudent) {
       res.redirect('/') 
    }
    

    const studentpro = studentDatas.find((item)=>{
        return item.id == mystudent
    } )

    if (!studentpro) {
        res.redirect('/') 
    }

    const checkactivenow = mapped.map((item, index) =>{
        if (studentpro.id === item.id) {
            return {...item, active: true}
        }else{
            return {...item, active: false}
        }
    })
    //console.log(studentpro)

    res.render('studentprofiles', {studentpro, checkactivenow});
});


app.get('/category', (req, res) =>{
    res.render('categories');
});

app.get('/stud', (req, res) =>{
    res.render('tabledatapage');
});

app.get('/table', (req, res) =>{
res.render('tablecontent', {contactdetails});
});



app.post('/stud', (req, res)=>{
    //console.log(req.body)
    const schema = joi.object({
        name: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required(),
        subject: joi.string().required(),
        message: joi.string().required(),
    })
    const { error, value } = schema.validate(req.body)
    if (error) {
        return res.render('tabledatapage', {error: error.details[0].message})
    }
    //console.log(value)
    contactdetails.push(req.body)
    fs.writeFile('./contact.json', JSON.stringify(contactdetails), (err)=>{
      if (err) {
        res.render('tabledatapage', {message: err.message})
      }else{
        res.render('tabledatapage', {message: 'form submitted successfully'})
      }
    })
})




//create server
app.listen(9000, ()=>{
    console.log('Server is running on port 9000')  //Server listening on port 9000
})