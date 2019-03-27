var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
	"userId":String,
	"userName":String,
	"passWords":String,
	"orderList":[
	 {
            "priductId" : Number,
            "num" : Number,
            "checked" :Number,
            "producename" : String,
            "produceprice" : Number,
            "number" : Number,
            "produceImage" : String
        }, 
		
	],
	"carList":Array,
	"adressList":[
	{
            "addressId" : Number,
            "userName" : String,
            "streeName" : String,
            "tel" : Number,
            "isDefault" : Boolean
        }, 
	],
	lishiList: []
})

module.exports  = mongoose.model("User",userSchema)