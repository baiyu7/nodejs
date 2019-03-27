var express = require('express')
var path = require('path')
var app = express()
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
app.all('*', function(req, res, next) {

   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   res.header("X-Powered-By",' 3.2.1');
   res.header("Content-Type", "application/json;charset=utf-8");
   next();
});
var router = require('./routers/good')


app.use('/public/',express.static(path.join(__dirname,'./public/')))
app.use('/node_modules',express.static(path.join(__dirname,'./node_modules/')))

var goods = require('./routers/good')
app.use(bodyParser.urlencoded({ extended: false }))



app.use(bodyParser.json())
app.use(cookieParser());
app.engine('html',require('express-art-template'))
app.set('views',path.join(__dirname,'./views/'))


app.use(function(req,res,next){
	if(req.cookies.userName){
		next();
	}else{
		if (req.originalUrl=='/user/out'||req.originalUrl=='/user/login'||
			req.originalUrl.indexOf("/goods/list")>-1||
			req.originalUrl.indexOf("/checkLogin")>-1) {
			next();
		}else{
			res.json({
				status:'10001',
				msg:'未登录',
				result:''
			})
		}
	}
})
app.use(router)

app.listen(3002,function(){
	console.log('running')
})