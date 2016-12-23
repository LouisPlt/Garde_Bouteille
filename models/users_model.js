var dynamoose = require('dynamoose');
var User = dynamoose.model('Users',{
  Pseudo: String,
  Email: String,
  Password: String,
  Type: String,
  Gender: String,
  Firstname: String,
  Lastname: String,
  Birth: String,
  Phone: String
  
});
