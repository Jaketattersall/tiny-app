const express = require('express');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const app = express();

// Set the port number
const PORT = 8080;

//add ejs
app.set("view engine", "ejs");

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieSession({
 name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Database setup
const urlDatabase = {
    "b2xVn2": {
       longURL: "http://www.lighthouselabs.ca",
       userID : "userRandomID"
    },
    "9sm5xK": "http://www.google.com"
};
const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "1234",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

//Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});



app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to my first website!</title>
      </head>
      <body>
        <header>
          <h1>Welcome to my first website!</h1>
        </header>
      </body>
      </html>
    `);
  });


  app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
    // If not logged in, render the login form template
    res.redirect('/');
}
const user = users[req.session.user_id]
// If logged in, redirect to homepage
res.render('login',{user: user});  
  });
  

  // Login route
  app.post('/user profiles', (req, res) => {
    const { email, password } = req.body;
    if (isValidUser(email, password)) {
      req.session.user = { email: email };
      res.redirect('/');
    } else {
      res.render('user profiles', { error: 'Invalid email or password' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Look up user by email
    const user = getUserByEmail(email, users);
console.log(users)
    // Check if user exists and if password is correct
    if (!user || user.password !== password) {
        return res.status(403).send("Invalid email or password");
    }

    // Set user_id cookie with the matching user's ID
   req.session["user_id"] = user.id
    // Redirect to /urls
    res.redirect('/urls');
});


app.post('/logout', (req, res) => {
    // Clear user_id cookie
    res.clearCookie('user_id');

    // Redirect to /login
    res.redirect('/login');
});
  
// //Registration form
  app.get('/register', (req, res) => {
    if (req.session && req.session.user) {
        
        res.redirect('/');
    }
    const user = users[req.session.user_id]
    
   res.render("register", {user})
   });

 // Register New User route
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Email and password are required');
    }
  
    // Check if user already exists in the database
    if (getUserByEmail(email, users)) {
      return res.status(400).send('User already exists');
    }
  
    //   Store user data in the database
    const newId = generateRandomString()
    const newUser = { id: newId, email: email, password: password };
    users[newId] = newUser    
    // Redirect the user to the login page after successful registration
    res.redirect('/login');
  });

  app.get('/urls', (req, res) => {
    // Check if user is logged in
    if (!req.session.user_id) {
      return res.status(401).send('Unauthorized: Please login to view your URLs');
    }
    //get the logged in user
  const user = users[req.session.user_id]
    // Fetch user's URLs from the database
    const userURLs = urlsForUser(urlDatabase, req.session.user_id);
    console.log(userURLs)
    // Check if user has any URLs

  
    // Render a page displaying the user's URLs
    console.log(userURLs)
    res.render('urls_index', {user: user, urls: userURLs });
  });
  
// Create New URL
app.post('/urls', (req, res) => {
    const userID = req.session.user_id;
    if (!userID) {
      res.status(403).send('You need to login first');
      return;
    }
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect(`/urls/${shortURL}`);
  });
  //Route to new urls
  app.get("/urls/new", (req, res) => {
    const user = users[req.session.user_id]
    res.render("urls_new", {user: user});
  });
  
  // Show URL Page
  app.get('/urls/:shortURL', (req, res) => {
    const userID = req.session.user_id;
    const user = (userID)
    const id = req.params.shortURL;
    const url = urlDatabase[id];
    const longURL = url.longURL
    console.log("url =", url)
    if (!user) {
      res.status(403).send('You need to login first');
      return;
    }
    if (!url) {
      res.status(404).send('URL not found');
      return;
    }
    if (url.userID !== userID) {
      res.status(403).send('You do not own this URL');
      return;
    }
    const templateVars = { user, id, longURL };
    console.log(templateVars)
    res.render('urls_show', templateVars);
  });

  app.post ('/urls/:shortid/delete', (req,res) => {
    const shortid = req.params.shortid
    delete urlDatabase[shortid]
    res.redirect(`/urls`)
  })