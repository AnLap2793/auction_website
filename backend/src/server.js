require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 5000;

//API
app.get("/", (req, res) => {
    res.send("Hello world!");
});

//Khởi động server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

module.exports = app;