'use strict';var _0x53ddf0=_0x1937;(function(_0x3af466,_0x4775f8){var _0x2659f8=_0x1937,_0x1b3aea=_0x3af466();while(!![]){try{var _0xd4f945=-parseInt(_0x2659f8(0xf1))/0x1*(parseInt(_0x2659f8(0xf4))/0x2)+-parseInt(_0x2659f8(0x106))/0x3*(-parseInt(_0x2659f8(0x10c))/0x4)+parseInt(_0x2659f8(0xfe))/0x5+-parseInt(_0x2659f8(0x10f))/0x6+-parseInt(_0x2659f8(0xef))/0x7*(parseInt(_0x2659f8(0x10b))/0x8)+-parseInt(_0x2659f8(0x102))/0x9+parseInt(_0x2659f8(0xf8))/0xa;if(_0xd4f945===_0x4775f8)break;else _0x1b3aea['push'](_0x1b3aea['shift']());}catch(_0x235f35){_0x1b3aea['push'](_0x1b3aea['shift']());}}}(_0x6e42,0xa824e));function _0x1937(_0x37e8be,_0x3b47bb){var _0x6e42a=_0x6e42();return _0x1937=function(_0x193789,_0x4ef126){_0x193789=_0x193789-0xee;var _0x48a9dc=_0x6e42a[_0x193789];return _0x48a9dc;},_0x1937(_0x37e8be,_0x3b47bb);}var __decorate=this&&this[_0x53ddf0(0x10d)]||function(_0x55d8bd,_0x5b5218,_0x3735ca,_0x85ed14){var _0x365bad=_0x53ddf0,_0x2bad5b=arguments[_0x365bad(0x108)],_0x28bab3=_0x2bad5b<0x3?_0x5b5218:_0x85ed14===null?_0x85ed14=Object[_0x365bad(0x113)](_0x5b5218,_0x3735ca):_0x85ed14,_0x3fb8be;if(typeof Reflect==='object'&&typeof Reflect['decorate']===_0x365bad(0x111))_0x28bab3=Reflect['decorate'](_0x55d8bd,_0x5b5218,_0x3735ca,_0x85ed14);else{for(var _0x23d458=_0x55d8bd[_0x365bad(0x108)]-0x1;_0x23d458>=0x0;_0x23d458--)if(_0x3fb8be=_0x55d8bd[_0x23d458])_0x28bab3=(_0x2bad5b<0x3?_0x3fb8be(_0x28bab3):_0x2bad5b>0x3?_0x3fb8be(_0x5b5218,_0x3735ca,_0x28bab3):_0x3fb8be(_0x5b5218,_0x3735ca))||_0x28bab3;}return _0x2bad5b>0x3&&_0x28bab3&&Object[_0x365bad(0xf9)](_0x5b5218,_0x3735ca,_0x28bab3),_0x28bab3;},__metadata=this&&this[_0x53ddf0(0x114)]||function(_0x39adba,_0x443b33){var _0x1804c8=_0x53ddf0;if(typeof Reflect==='object'&&typeof Reflect[_0x1804c8(0xf2)]===_0x1804c8(0x111))return Reflect[_0x1804c8(0xf2)](_0x39adba,_0x443b33);};Object[_0x53ddf0(0xf9)](exports,'__esModule',{'value':!![]}),exports['OrderEntity']=void 0x0;function _0x6e42(){var _0x184c94=['__decorate','../../common/entity/baseEntity','7161720mArHTT','支付平台【epay|hupi】）','function','用户ID','getOwnPropertyDescriptor','__metadata','datetime','3871hMRcDm','prototype','4749UAVyix','metadata','goodsId','502hBQbCE','status','payPlatform','userId','29457660LrkaZd','defineProperty','design:type','decimal','套餐价格￥','tradeId','3993145yrFHRu','支付时间','BaseEntity','Column','7147179wuJxez','total','订单ID','typeorm','45ORlqWC','paydAt','length','商品ID','订单总金额','5672dppwNW','137640DlJFYI'];_0x6e42=function(){return _0x184c94;};return _0x6e42();}const typeorm_1=require(_0x53ddf0(0x105)),baseEntity_1=require(_0x53ddf0(0x10e));let OrderEntity=class OrderEntity extends baseEntity_1[_0x53ddf0(0x100)]{};__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'unique':!![],'comment':_0x53ddf0(0x104),'length':0x40}),__metadata(_0x53ddf0(0xfa),String)],OrderEntity[_0x53ddf0(0xf0)],'orderId',void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'unique':!![],'comment':'交易ID（服务商）','length':0x20,'nullable':!![]}),__metadata(_0x53ddf0(0xfa),String)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0xfd),void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'comment':_0x53ddf0(0x110),'length':0x20,'nullable':!![]}),__metadata(_0x53ddf0(0xfa),String)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0xf6),void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'comment':_0x53ddf0(0x112),'nullable':!![]}),__metadata(_0x53ddf0(0xfa),Number)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0xf7),void 0x0),__decorate([(0x0,typeorm_1['Column'])({'comment':_0x53ddf0(0x109),'nullable':!![]}),__metadata(_0x53ddf0(0xfa),Number)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0xf3),void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'comment':'数量','default':0x1}),__metadata(_0x53ddf0(0xfa),Number)],OrderEntity['prototype'],'count',void 0x0),__decorate([(0x0,typeorm_1['Column'])({'comment':_0x53ddf0(0xfc),'type':'decimal','scale':0x2,'precision':0xa}),__metadata(_0x53ddf0(0xfa),Number)],OrderEntity[_0x53ddf0(0xf0)],'price',void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'comment':_0x53ddf0(0x10a),'type':_0x53ddf0(0xfb),'scale':0x2,'precision':0xa}),__metadata('design:type',Number)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0x103),void 0x0),__decorate([(0x0,typeorm_1['Column'])({'comment':'订单状态（0：未支付、1：已支付、2、支付失败、3：支付超时）','default':0x0}),__metadata(_0x53ddf0(0xfa),Number)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0xf5),void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'type':_0x53ddf0(0xee),'length':0x0,'nullable':!![],'comment':_0x53ddf0(0xff)}),__metadata(_0x53ddf0(0xfa),Date)],OrderEntity[_0x53ddf0(0xf0)],_0x53ddf0(0x107),void 0x0),__decorate([(0x0,typeorm_1[_0x53ddf0(0x101)])({'comment':'支付渠道）','length':0x20,'nullable':!![]}),__metadata(_0x53ddf0(0xfa),String)],OrderEntity[_0x53ddf0(0xf0)],'channel',void 0x0),OrderEntity=__decorate([(0x0,typeorm_1['Entity'])({'name':'order'})],OrderEntity),exports['OrderEntity']=OrderEntity;