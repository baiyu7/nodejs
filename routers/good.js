// 产品接口

var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../modules/use')
var Goods = require('../modules/goods')
require('../util.js')
mongoose.connect('mongodb://127.0.0.1:27017/test')
mongoose.connection.on("connected",function(){
	console.log('success')
})

// 商品列表数据接口
router.get('/goods/list',function(req,res){

		// 分页和排序功能
		var page = parseInt(req.param("page"))
		var pageSize = parseInt(req.param("pageSize"))
		var sort = req.param("sort")
		var skip = (page-1)*pageSize
		var params = {}
		// 价格过滤功能
		var priceLevel = req.param("priceLevel")

		var maxprice = ''
		var lowprice = ''
		if(priceLevel != 'all'){
			switch(priceLevel){
				case '0': maxprice = 100; lowprice = 0; break;
				 case '1':maxprice = 1000; lowprice = 100; break;
				 case '2' :maxprice = 2000; lowprice = 1000 ; break
			}
				var params = {
					produceprice:{
					$gt : lowprice,
					$lte : maxprice
				}
			}
		}
		var goodsMoudel = Goods.find(params).skip(skip).limit(pageSize)
		goodsMoudel.sort({'produceprice':sort})
		goodsMoudel.exec(function(err,doc){
				if (err) {
			res.json({
				status : 1,
				msg:err.message
			})
		}else{
				res.json({
					status:0,
					msg:'',
					conunt:doc.length,
					message:doc
				})
			}
		})

	
	
})

// 购物车列表接口

router.post('/goods/addCart',function(req,res){
	var userId = '123'
	var priductId =parseInt(req.body.priductId) 
	User.findOne({userId :userId},function(err,userDoc){
		if (err) {
			res.json({
				status :"1",
				msg : err.message
			})
		}else{
			if (userDoc) {
			
				Goods.findOne({priductId:priductId},function(err1,doc1){


					if (err1) {
						res.json({
							status :"1",
							msg : err1.message
						})
					}else{
							if(doc1){
								
								var priductIdnum = []
								userDoc.orderList.forEach((i)=>{
									priductIdnum.push(i.priductId)
								})
								console.log(priductIdnum)
								console.log(priductIdnum.indexOf("doc1.priductId"))
								if(priductIdnum.indexOf(doc1.priductId) == -1){
									userDoc.orderList.push(doc1);
									userDoc.save(function(err2,doc2){
											if(err2){
												res.json({
													status :"1",
													msg : err2.message
												})
											}else{
												res.json({
													status :'0',
													msg :'',
													result:'suc'

												})

											}
										})
								}else{
									userDoc.orderList.forEach((item)=>{
										if(doc1.priductId == item.priductId){
											item.num++
											userDoc.save(function(err2,doc2){
											if(err2){
												res.json({
													status :"1",
													msg : err2.message
												})
											}else{
												res.json({
													status :'0',
													msg :'',
													result:'suc'

												})

											}
										})
										}
								})
								}
								
										
									

								// 分界线
								// if(doc1.priductId == )


								// userDoc.orderList.push(doc1);
								// userDoc.save(function(err2,doc2){
								// 	if(err2){
								// 		res.json({
								// 			status :"1",
								// 			msg : err2.message
								// 		})
								// 	}else{
								// 		res.json({
								// 			status :'0',
								// 			msg :'',
								// 			result:'suc'

								// 		})

								// 	}
								// })
							}

			}
				})
				


			
			}
			}
		
	})

})

// 登录接口
router.post('/user/login',function(req,res){
	
	
	User.findOne({
		userName :req.body.userName,
		passWords : req.body.passWord
	},function(err,doc){
		
		if(doc){
			
				res.cookie("userName",doc.userName,{
					path:'/',
					maxAge:1000*60*60
				});

				
				res.json({
				status:'0',	
				msg:'',
				result:{
					userName :doc.userName
					}
				})
		

		}else{
			if(err===null){
				res.json({
					status:'1'
				})
			}
			
		}
	})
})


//退出接口
router.post('/user/out',function(req,res){
	res.cookie("userName","",{
					path:'/',
					maxAge:0
				});
	res.json({
		status:'0',
		msg:'',
		message:''
	})
})

//监视是否有在线
router.get('/checkLogin',function(req,res,next){
	if(req.cookies.userName){
		res.json({
			status:'0',
			msg:'',
			result:req.cookies.userName||''
		})
	}else{
		res.json({
			status:'1',
			msg:'未登录',
			result:''
		})
	}
})


// 购物车数据接口
router.get('/carList',function(req,res){
	var userName = req.cookies.userName
	User.findOne({userName:userName},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:1
			})

		}else{
			res.json({
				status:'0',
				msg:'',
				result:doc.orderList
			})
		}
	})
})
//删除购物车商品接口
router.post('/del',function(req,res){
	var userName = req.cookies.userName
	var priductId =parseInt(req.body.priductId) 
	User.update({userName:userName},{
		$pull:{'orderList':{
			'priductId':priductId
		}
	}
	},function(err,doc){
		console.log(doc)
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'suc'
			})
		}
	})
})

// 修改商品数量接口
router.post('/editcar',function(req,res){
	var userName = req.cookies.userName
	var priductId = req.body.priductId
	var num = req.body.num
	var checked = req.body.checked
	User.update({"userName":userName,"orderList.priductId":priductId},{
		"orderList.$.num":num,
		"orderList.$.checked":checked
	},function(err,doc){
		if (err) {
			err.json({
				status:'0',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'suc'
			})
		}
	})
})

// 查询用户地址接口
router.get('/address',function(req,res){
	var userName = req.cookies.userName
	User.findOne({userName:userName},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:'',
				result:'err'
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:doc.adressList
			})
		}

	})
})

// 默认地址接口
router.post('/edit/address',function(req,res){
	var userName = req.cookies.userName
	var adressId = req.body.addressId
	if(!adressId){
		res.json({
			status:'10010',
			mes:'',
			result:''
		})
	}else{
		User.findOne({userName:userName},function(err,doc){
			if(err){
				res.json({
					status:'1',
					msg:err.message,
					result:'err'
				})
			}else{
				doc.adressList.forEach((item)=>{
					if(item.addressId == adressId){
						item.isDefault = true
					}else{
						item.isDefault = false
					}
				});
				doc.save(function(err1,doc1){
					if(err1){
						res.json({
							status:'1',
							msg:err1.message
						})
					}else{
						res.json({
							status:'0',
							msg:'',
							result:doc
						})
					}
					
				})
			}
		
				
		})
	}
})

router.post('/del/address',function(req,res){
	var userName = req.cookies.userName
	var addressId =parseInt(req.body.addressId) 
	User.update({userName:userName},{
		$pull:{'adressList':{
			'addressId':addressId
			
		}
	}
	},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'success del adressId'
			})
		}
	})
})


// 买的商品等待确认订单列表
router.post('/payMent',function(req,res){
	var userName = req.cookies.userName
	var orderTotal = req.body.orderTotal
	console.log(orderTotal)
	var addressId = req.body.addressId
	console.log(addressId)
	User.findOne({userName:userName},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			var address = ''

			// 获取当前用户地址信息
			doc.adressList.forEach((item)=>{
				if(item.addressId == addressId){
					address = item
				}
			})
			var goodsList = []
			// 获取用户购物车购买的商品
			doc.orderList.filter((item)=>{
				if(item.checked==1){
					goodsList.push(item)
				}
			});
			var plat = '120'
			var r1 = Math.floor(Math.random()*10)
			var r2 = Math.floor(Math.random()*10)

			var sysDate = new Date().Format('yyyyMMddhhmmss')
			var createdDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
			var orderId = plat +r1+sysDate+r2
				var order = {
					orderId:orderId,
					addressinfo:address,
					orderTotal:orderTotal,
					goodsList:goodsList,
					orderStatus:'1',
					createdDate:createdDate
				};
			
				doc.lishiList.push(order)
				doc.save(function(err1,doc1){
					if (err) {
						res.json({
							status:'1',
							msg:err.message,
							result:''
						})
					}else{
						res.json({
						status:'0',
						result:{
							orderId:order.orderId,
							
							orderTotal:order.orderTotal
						}
			})
					}
				});
			
		}
	})

})


// 已经购买的订单列表
router.get('/orderlist',function(req,res){
	var userName = req.cookies.userName
	User.findOne({userName:userName},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:doc.lishiList
			})
		}
	})

})

// 购物车数量接口
router.get('/carcount',function(req,res){
	if(req.cookies && req.cookies.userName){
		var userName = req.cookies.userName
		User.findOne({userName:userName},function(err,doc){
			if(err){
				res.json({
				status:'1',
				msg:err.message,
				result:''
			})
			}else{
			
				var CartCount = 0
				doc.orderList.map(function(item){
					if(item.checked == 1){
							CartCount += item.num
					}
				
				})
				res.json({
					status:'0',
					msg:'',
					result:CartCount
				})
			}
		})
	}
})
module.exports = router
