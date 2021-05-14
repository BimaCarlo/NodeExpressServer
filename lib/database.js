var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/my_db", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Info - Now connected to MongoDB"))
  .catch((err) => console.error("Error - Something went wrong", err));

mongoose.connection.once('open', function (err, resp) { console.log("Info - Database Success"); });

mongoose.connection.on('error', console.error.bind(console, "Error - Connection Error"));

var DBConnection = function () {
  this.Schema = mongoose.Schema({
    'user': { type: String, required: [true, 'Username required'], minlength: [3, "Minimun user length 3 charaters"] },//controlli sul campo user
    'password': { type: String, required: [true, 'Password required'], minlength: [8, "Minimun password length 8 charaters"] },//controlli sul campo passeword
    'signup': { type: Date, required: [true, 'Date required'], default: Date.now }
  });//introduciamo uno schema che permette di mantenere i dati dello stesso tipo
  //elemento che voflio passare, lo schema da passare, la collection in cui inserirlo
  this.Model = mongoose.model('users', this.Schema, 'users');
}


DBConnection.prototype.user = function(user, password, date){
  return new this.Model({'user':user, 'password':password, 'signup':date});
};

module.exports = new DBConnection();