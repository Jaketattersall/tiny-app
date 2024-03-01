// helpers.js
const getUserByEmail = function(email, database) {
    for (const userID in database) {
        const user = database[userID];
        if (user.email === email) {
            return user;
        }
    }
    return undefined;
};

const generateRandomString = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

const urlsForUser = (db, id) => {
    const database = {}
    console.log(db)
    console.log(id)
    for (const url in db) {
        console.log(db[url])
        console.log(db[url].id === id)
        if (db[url].userID === id) {
            database[url] = db[url];
        }
    }
    return database;
}



module.exports = { getUserByEmail, generateRandomString, urlsForUser };









