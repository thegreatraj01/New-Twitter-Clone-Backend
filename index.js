const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());



//------------------------------------------------------------------------------------
app.use(require('./routes/user'));
app.use(require('./routes/tweet'));
app.use(require('./routes/imguplod'));
// app.use(require('./multer/multer'));
// ---------------------------------------------------
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 6001

const connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGO)

    .then(() => {
      console.log("connect to mongodb database");
    })
    .catch((err) => {
      throw err;
    });
};


//   -------------------------------------------------------------------


app.listen(PORT, () => {
  console.log(`server has started on port ${PORT} `);
  connect();
})