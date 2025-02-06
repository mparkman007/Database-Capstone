import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";


const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "AoE3fJUp2!",
  port: 5432
});


db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

// Function to query the database and select all rows from the table "booklist"
async function selectAllDb(){

    const results = await db.query("SELECT * FROM booklist");
  
      let booklist = [];
      let  bookListResults = results.rows;
        bookListResults.forEach(element => {
           booklist.push({
            id: element.id,
            author: element.author,
            title: element.title,
            yearread: element.yearread,
            notes: element.notes,
            olkey: element.olkey,
            rating: element.rating
          });
        });
  
    return booklist;
  
  }

// Function to query the database and select all rows from the table "booklist" and order by rating in descending order
async function selectAllByRating(){

  const results = await db.query("SELECT * FROM booklist ORDER BY rating DESC");
  
      let booklist = [];
      let  bookListResults = results.rows;
        bookListResults.forEach(element => {
           booklist.push({
            id: element.id,
            author: element.author,
            title: element.title,
            yearread: element.yearread,
            notes: element.notes,
            olkey: element.olkey,
            rating: element.rating
          });
      });
  
  return booklist;
  
  }

// Function to query the database and select all rows from the table "booklist" and ordr by yearread in descending order
  async function selectAllByYear(){

    const results = await db.query("SELECT * FROM booklist ORDER BY yearread DESC");
  
      let booklist = [];
      let  bookListResults = results.rows;
        bookListResults.forEach(element => {
           booklist.push({
            id: element.id,
            author: element.author,
            title: element.title,
            yearread: element.yearread,
            notes: element.notes,
            olkey: element.olkey,
            rating: element.rating
          });
        });
  
    return booklist;
  
  }
// Function to query the database and select all rows from the table "booklist" and order by title in ascending order
  async function selectAllByTitle(){

    const results = await db.query("SELECT * FROM booklist ORDER BY title ASC");
  
      let booklist = [];
      let  bookListResults = results.rows;
        bookListResults.forEach(element => {
           booklist.push({
            id: element.id,
            author: element.author,
            title: element.title,
            yearread: element.yearread,
            notes: element.notes,
            olkey: element.olkey,
            rating: element.rating
          });
        });
  
    return booklist;
  
  }
// Function to query the database to select rows from the table "booklist" where the id equals the passed bookId
  async function selectAllById(id){

    const lookUpId = id;
    const results = await db.query("SELECT * FROM booklist WHERE id = $1",[lookUpId]);
  
      let booklist = [];
      let  bookListResults = results.rows;
        bookListResults.forEach(element => {
           booklist.push({
            id: element.id,
            author: element.author,
            title: element.title,
            yearread: element.yearread,
            notes: element.notes,
            olkey: element.olkey,
            rating: element.rating
          });
        });
  
    return booklist;
  
  }


//Initial index page rendering, facilitates sorting function via passed query from <a> tag in index.ejs,
//contacts the database by invoking the specified functions above
  app.get("/", async (req,res) =>{
      const sort = req.query.sort;
      let blist = [];
      switch(sort){
        case `title`:     
          blist = await selectAllByTitle();
          res.render("index.ejs", {blist: blist});
          console.log("called by title");
          break;
        case `rating`:
          blist = await selectAllByRating();
          res.render("index.ejs", {blist: blist});
          console.log("called by rating");
          break;
        case `year`:
          blist = await selectAllByYear();
          res.render("index.ejs", {blist: blist});
          console.log("called by year");
          break;
        default:
          blist = await selectAllDb();
          res.render("index.ejs", {blist: blist});
      }


  });

  app.post("/new", async (req,res) =>{
    
    res.render("new.ejs");
  });

//Handling for the post to add a new entry to the database, takes in form data from /new and queries database to insert new data
  app.post("/add", async (req,res) =>{
    const submittedData = req.body;
    const submittedAuthor = req.body.author;
    const submittedTitle = req.body.title;
    const submittedNotes = req.body.notes;
    const submittedOlKey = req.body.olkey;
    const submittedYear = Number(req.body.yearread);
    const submittedRating = Number(req.body.rating);

    const query = `INSERT INTO booklist(author, title, yearread, notes, olkey, rating) VALUES($1,$2,$3,$4,$5,$6)`;

    db.query(query, [submittedAuthor, submittedTitle, submittedYear, submittedNotes, submittedOlKey, submittedRating])
    let results = await selectAllDb();

    res.render("index.ejs", {blist: results});
  });

//Handles serving up the page to update the database, and passing the Id to query the database
  app.get("/updateForm",(req,res)=>{
    const reviewId = req.query.reviewId;
    res.render("updateForm.ejs",{reviewId: reviewId});

  });

//Updateing to the database logic, pulls in data passed by "/updateForm", pulls data from database to compare in case user does not update all fields
//ensures rating is not null or a string
  app.post("/update", async(req,res)=>{
    let lookUpId = await selectAllById(req.body.bookId);
    console.log("this is the look up result: " + lookUpId[0].rating);

    const submittedBookId = req.body.bookId;
    const submittedNotes = req.body.notes || lookUpId[0].notes;
    const submittedOlKey = req.body.olkey || lookUpId[0].olkey;
    let submittedRating = req.body.rating || lookUpId[0].rating;

    console.log("booklist ID: " + submittedBookId);
    let query = `UPDATE booklist SET notes = $1, rating = $2, olkey = $3 WHERE id = $4`;
    db.query(query,[submittedNotes, submittedRating, submittedOlKey, submittedBookId]);
    let results = await selectAllDb();
    res.render("index.ejs", {blist: results});
  });

//Queries database to delete row based on pass Id from "/updateForm"
  app.post("/delete", async (req,res)=>{
    let submittedId = req.body.bookId;
    let query = `DELETE FROM booklist WHERE id = $1`;
    db.query(query, [submittedId]);
    res.redirect("/");
  });



 
  