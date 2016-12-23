
var dynamoose = require('dynamoose');
var Cat = dynamoose.model('Cat');


Cat.get(666)
.then(function (badCat) {
  console.log('Never trust a smiling cat. - ' + badCat.name);
});
