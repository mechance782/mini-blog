const express = require('express');
const mariadb = require('mariadb');
const PORT = 3000;

const app = express();

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Gtchance*07',
    database: 'blog'
})
app.use(express.urlencoded({extended: false}));

app.use(express.static('public'));

app.set('view engine', 'ejs');

async function connect() {
    try {
        let conn = await pool.getConnection();
        console.log('Connected to database');
        return conn;
    } catch (err) {
        console.log('Error connecting to database: ' + err);
    }
}

app.get('/', (req, res) => {
    res.render('home', {errors: [], data: {}});
});

// const posts = [];

app.post('/submit', async (req, res) => {
    const newPost = {
        author: req.body.author,
        title: req.body.title,
        content: req.body.content
    };
    //form validation
    let isValid = true;
    let errors = [];

    if (newPost.title.trim() === ''){
        isValid = false;
        errors.push('Title is required');
    }

    if (newPost.title.trim().length < 5 ){
        isValid = false;
        errors.push('Title must be longer than 5 characters')
    }

    if (newPost.content.trim() === ''){
        isValid = false;
        errors.push('Post must have content');
    }

    if (newPost.author.trim() === ''){
        newPost.author = null;
    }

    if (!isValid){
        res.render('home', {errors: errors, data: newPost});
        return;
    }

    const conn = await connect();

    conn.query(`
       INSERT INTO posts (author, title, content)
       VALUES ('${newPost.author}', '${newPost.title}', '${newPost.content}')
    `);
    res.render('confirmation', {post: newPost});
});

app.get('/entries', async (req, res) => {
    const conn = await connect();
    const rows = await conn.query(`SELECT * FROM posts ORDER BY created_at DESC`);
    res.render('entries', {posts: rows});
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});