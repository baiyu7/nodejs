var mongoose = require('mongoose')

var Schema = mongoose.Schema

var goodSchema = new Schema({
	"priductId":Number,
	"productName":String,
	"salePrice":Number,
	"productImage":String
})
module.exports = mongoose.model('Good',goodSchema)