'use strict';const _0x2ee041=_0xb54f;function _0x3a51(){const _0x2b53cc=['userId','userAppsEntity','Like','./appCats.entity','2169VUrOCb','includes','role','updateApp','forEach','appDes','auditPass','已将应用加入到我的个人工作台！','应用审核拒绝完成','preset','BAD_REQUEST','45XLmDSO','count','修改成功','UserAppsEntity','__esModule','198GTcKuJ','find','./userApps.entity','catName','update','updateAppCats','status','IsNull','AppEntity','delApp','329KGQdHJ','appRole','object','HttpException','appEntity','HttpStatus','design:paramtypes','68828IRrbjb','您正在操作一个不存在的资源！','该应用名称已存在！','删除App失败！','该应用不存在！','collect','InjectRepository','mineApps','user','catId','58728YfAkjo','function','10982965mzDSkc','1171110MFGLjD','AppCatsEntity','取消收藏失败！','length','getOwnPropertyDescriptor','__decorate','__param','name','des','system','appList','defineProperty','delete','AppService','demoData','DESC','Injectable','affected','@nestjs/common','应用审核通过','appCount','save','删除应用成功！','createApp','appCatsEntity','修改App信息失败！','appId','findAndCount','appCatsList','4866138IqjwPJ','1975710uYTHQK','该应用已被用户关联使用中，不可删除！','delAppCat','删除App成功','map','findOne','该分类名称已存在！','frontAppList','382KBoHHI','Repository','该分类不存在！','******','该分类下存在App，不可删除！','createAppCat','customApp','appName','您正在编辑一个不存在的应用！','super'];_0x3a51=function(){return _0x2b53cc;};return _0x3a51();}(function(_0x11fe7a,_0x268b61){const _0x36954d=_0xb54f,_0x9de6c4=_0x11fe7a();while(!![]){try{const _0x91f25f=-parseInt(_0x36954d(0x1f0))/0x1*(-parseInt(_0x36954d(0x1c8))/0x2)+parseInt(_0x36954d(0x1bf))/0x3+-parseInt(_0x36954d(0x1f7))/0x4*(-parseInt(_0x36954d(0x1e1))/0x5)+parseInt(_0x36954d(0x1c0))/0x6+-parseInt(_0x36954d(0x203))/0x7+-parseInt(_0x36954d(0x201))/0x8*(parseInt(_0x36954d(0x1d6))/0x9)+-parseInt(_0x36954d(0x204))/0xa*(-parseInt(_0x36954d(0x1e6))/0xb);if(_0x91f25f===_0x268b61)break;else _0x9de6c4['push'](_0x9de6c4['shift']());}catch(_0x2e5bb7){_0x9de6c4['push'](_0x9de6c4['shift']());}}}(_0x3a51,0xe5367));var __decorate=this&&this[_0x2ee041(0x209)]||function(_0x26da75,_0x3f599b,_0x163047,_0x29e43a){const _0x47a048=_0x2ee041;var _0x419b8b=arguments[_0x47a048(0x207)],_0xb6589f=_0x419b8b<0x3?_0x3f599b:_0x29e43a===null?_0x29e43a=Object[_0x47a048(0x208)](_0x3f599b,_0x163047):_0x29e43a,_0x403be6;if(typeof Reflect===_0x47a048(0x1f2)&&typeof Reflect['decorate']===_0x47a048(0x202))_0xb6589f=Reflect['decorate'](_0x26da75,_0x3f599b,_0x163047,_0x29e43a);else{for(var _0x51a7e4=_0x26da75['length']-0x1;_0x51a7e4>=0x0;_0x51a7e4--)if(_0x403be6=_0x26da75[_0x51a7e4])_0xb6589f=(_0x419b8b<0x3?_0x403be6(_0xb6589f):_0x419b8b>0x3?_0x403be6(_0x3f599b,_0x163047,_0xb6589f):_0x403be6(_0x3f599b,_0x163047))||_0xb6589f;}return _0x419b8b>0x3&&_0xb6589f&&Object[_0x47a048(0x20f)](_0x3f599b,_0x163047,_0xb6589f),_0xb6589f;},__metadata=this&&this['__metadata']||function(_0x7d1d1e,_0xaabe27){const _0x1192eb=_0x2ee041;if(typeof Reflect===_0x1192eb(0x1f2)&&typeof Reflect['metadata']==='function')return Reflect['metadata'](_0x7d1d1e,_0xaabe27);},__param=this&&this[_0x2ee041(0x20a)]||function(_0x2bc9b3,_0x27771c){return function(_0x40e93e,_0x16b084){_0x27771c(_0x40e93e,_0x16b084,_0x2bc9b3);};};Object[_0x2ee041(0x20f)](exports,_0x2ee041(0x1e5),{'value':!![]}),exports['AppService']=void 0x0;const common_1=require(_0x2ee041(0x216)),appCats_entity_1=require(_0x2ee041(0x1d5)),typeorm_1=require('typeorm'),typeorm_2=require('@nestjs/typeorm'),app_entity_1=require('./app.entity'),userApps_entity_1=require(_0x2ee041(0x1e8));function _0xb54f(_0x458c2d,_0x1bd84c){const _0x3a5112=_0x3a51();return _0xb54f=function(_0xb54f07,_0x275cb7){_0xb54f07=_0xb54f07-0x1ba;let _0x61a1f9=_0x3a5112[_0xb54f07];return _0x61a1f9;},_0xb54f(_0x458c2d,_0x1bd84c);}let AppService=class AppService{constructor(_0x5945d4,_0x58e646,_0x20480a){const _0xde36ad=_0x2ee041;this[_0xde36ad(0x1ba)]=_0x5945d4,this[_0xde36ad(0x1f4)]=_0x58e646,this[_0xde36ad(0x1d3)]=_0x20480a;}async[_0x2ee041(0x1cd)](_0x5c62ba){const _0x3ed5c5=_0x2ee041,{name:_0x12a52d}=_0x5c62ba,_0x2c675c=await this[_0x3ed5c5(0x1ba)][_0x3ed5c5(0x1c5)]({'where':{'name':_0x12a52d}});if(_0x2c675c)throw new common_1[(_0x3ed5c5(0x1f3))](_0x3ed5c5(0x1c6),common_1[_0x3ed5c5(0x1f5)][_0x3ed5c5(0x1e0)]);return await this[_0x3ed5c5(0x1ba)]['save'](_0x5c62ba);}async[_0x2ee041(0x1c2)](_0x20318c){const _0x2a16b2=_0x2ee041,{id:_0x12b680}=_0x20318c,_0x102920=await this[_0x2a16b2(0x1ba)]['findOne']({'where':{'id':_0x12b680}});if(!_0x102920)throw new common_1[(_0x2a16b2(0x1f3))](_0x2a16b2(0x1ca),common_1['HttpStatus'][_0x2a16b2(0x1e0)]);const _0x3bfa8c=await this[_0x2a16b2(0x1f4)][_0x2a16b2(0x1e2)]({'where':{'catId':_0x12b680}});if(_0x3bfa8c>0x0)throw new common_1[(_0x2a16b2(0x1f3))](_0x2a16b2(0x1cc),common_1['HttpStatus']['BAD_REQUEST']);const _0x5a9ce5=await this[_0x2a16b2(0x1ba)][_0x2a16b2(0x210)](_0x12b680);if(_0x5a9ce5['affected']>0x0)return'删除成功';throw new common_1[(_0x2a16b2(0x1f3))]('删除失败！',common_1['HttpStatus'][_0x2a16b2(0x1e0)]);}async[_0x2ee041(0x1eb)](_0x483556){const _0x543d11=_0x2ee041,{id:_0x15c3f2,name:_0x2199f5}=_0x483556,_0x1e5f3a=await this[_0x543d11(0x1ba)][_0x543d11(0x1c5)]({'where':{'name':_0x2199f5,'id':(0x0,typeorm_1['Not'])(_0x15c3f2)}});if(_0x1e5f3a)throw new common_1['HttpException']('该分类名称已存在！',common_1[_0x543d11(0x1f5)][_0x543d11(0x1e0)]);const _0x27569f=await this[_0x543d11(0x1ba)]['update']({'id':_0x15c3f2},_0x483556);if(_0x27569f[_0x543d11(0x215)]>0x0)return _0x543d11(0x1e3);throw new common_1[(_0x543d11(0x1f3))]('修改失败！',common_1[_0x543d11(0x1f5)]['BAD_REQUEST']);}async[_0x2ee041(0x1be)](_0x3848af){const _0x158b28=_0x2ee041,{page:page=0x1,size:size=0xa,name:_0x5b4868,status:_0x19a6db}=_0x3848af,_0x4e31e1={};_0x5b4868&&(_0x4e31e1[_0x158b28(0x20b)]=(0x0,typeorm_1[_0x158b28(0x1d4)])('%'+_0x5b4868+'%')),[0x0,0x1,'0','1'][_0x158b28(0x1d7)](_0x19a6db)&&(_0x4e31e1[_0x158b28(0x1ec)]=_0x19a6db);const [_0x309df0,_0x39f184]=await this[_0x158b28(0x1ba)]['findAndCount']({'where':_0x4e31e1,'order':{'order':_0x158b28(0x213)},'skip':(page-0x1)*size,'take':size}),_0x417211=_0x309df0['map'](_0x169813=>_0x169813['id']),_0x417564=await this[_0x158b28(0x1f4)][_0x158b28(0x1e7)]({'where':{'catId':(0x0,typeorm_1['In'])(_0x417211)}}),_0x1ca079={};return _0x417564[_0x158b28(0x1da)](_0x316bdc=>{const _0x48c943=_0x158b28;_0x1ca079[_0x316bdc[_0x48c943(0x200)]]?_0x1ca079[_0x316bdc[_0x48c943(0x200)]]+=0x1:_0x1ca079[_0x316bdc[_0x48c943(0x200)]]=0x1;}),_0x309df0[_0x158b28(0x1da)](_0x2bb6a8=>_0x2bb6a8[_0x158b28(0x218)]=_0x1ca079[_0x2bb6a8['id']]||0x0),{'rows':_0x309df0,'count':_0x39f184};}async[_0x2ee041(0x20e)](_0x54dfa0,_0x1014c2,_0x55e141='id'){const _0x4210d5=_0x2ee041;var _0x47bd2e;const {page:page=0x1,size:size=0xa,name:_0x1d9f7e,status:_0x44d539,catId:_0x362f97,role:_0x597bf2}=_0x1014c2,_0x1f6b18={};_0x1d9f7e&&(_0x1f6b18[_0x4210d5(0x20b)]=(0x0,typeorm_1[_0x4210d5(0x1d4)])('%'+_0x1d9f7e+'%')),_0x362f97&&(_0x1f6b18[_0x4210d5(0x200)]=_0x362f97),_0x597bf2&&(_0x1f6b18[_0x4210d5(0x1d8)]=_0x597bf2),_0x44d539&&(_0x1f6b18['status']=_0x44d539);const [_0x1e9a87,_0x17a6b8]=await this[_0x4210d5(0x1f4)]['findAndCount']({'where':_0x1f6b18,'order':{[_0x55e141]:_0x4210d5(0x213)},'skip':(page-0x1)*size,'take':size}),_0x1dfea7=_0x1e9a87[_0x4210d5(0x1c4)](_0x43f178=>_0x43f178['catId']),_0x1aae3b=await this['appCatsEntity'][_0x4210d5(0x1e7)]({'where':{'id':(0x0,typeorm_1['In'])(_0x1dfea7)}});return _0x1e9a87[_0x4210d5(0x1da)](_0x5a80c6=>{const _0x236caa=_0x4210d5,_0x5ca531=_0x1aae3b[_0x236caa(0x1e7)](_0x2b07f2=>_0x2b07f2['id']===_0x5a80c6[_0x236caa(0x200)]);_0x5a80c6[_0x236caa(0x1e9)]=_0x5ca531?_0x5ca531[_0x236caa(0x20b)]:'';}),((_0x47bd2e=_0x54dfa0===null||_0x54dfa0===void 0x0?void 0x0:_0x54dfa0[_0x4210d5(0x1ff)])===null||_0x47bd2e===void 0x0?void 0x0:_0x47bd2e[_0x4210d5(0x1d8)])!==_0x4210d5(0x1d1)&&_0x1e9a87[_0x4210d5(0x1da)](_0xaea1a1=>{const _0x354678=_0x4210d5;delete _0xaea1a1[_0x354678(0x1df)];}),{'rows':_0x1e9a87,'count':_0x17a6b8};}async[_0x2ee041(0x1c7)](_0x1d21f1,_0x19b75b,_0x56cf47='id'){const _0x1d17f8=_0x2ee041;var _0x435916;const {page:page=0x1,size:size=0x3e8,name:_0x213054,catId:_0x848eff,role:_0x47d7ef}=_0x19b75b,_0x2584b4=[{'status':(0x0,typeorm_1['In'])([0x1,0x4]),'userId':(0x0,typeorm_1[_0x1d17f8(0x1ed)])(),'public':![]},{'userId':(0x0,typeorm_1['MoreThan'])(0x0),'public':!![]}],[_0xb9cf8c,_0x2fce01]=await this[_0x1d17f8(0x1f4)][_0x1d17f8(0x1bd)]({'where':_0x2584b4,'order':{'order':'DESC'},'skip':(page-0x1)*size,'take':size}),_0x2559f5=_0xb9cf8c[_0x1d17f8(0x1c4)](_0x157b64=>_0x157b64[_0x1d17f8(0x200)]),_0x48ba24=await this[_0x1d17f8(0x1ba)][_0x1d17f8(0x1e7)]({'where':{'id':(0x0,typeorm_1['In'])(_0x2559f5)}});return _0xb9cf8c[_0x1d17f8(0x1da)](_0x591314=>{const _0x306175=_0x1d17f8,_0x29c4f9=_0x48ba24[_0x306175(0x1e7)](_0x4db5a3=>_0x4db5a3['id']===_0x591314[_0x306175(0x200)]);_0x591314[_0x306175(0x1e9)]=_0x29c4f9?_0x29c4f9[_0x306175(0x20b)]:'';}),((_0x435916=_0x1d21f1===null||_0x1d21f1===void 0x0?void 0x0:_0x1d21f1[_0x1d17f8(0x1ff)])===null||_0x435916===void 0x0?void 0x0:_0x435916['role'])!=='super'&&_0xb9cf8c[_0x1d17f8(0x1da)](_0x53b730=>{const _0xdaf21a=_0x1d17f8;delete _0x53b730[_0xdaf21a(0x1df)];}),{'rows':_0xb9cf8c,'count':_0x2fce01};}async[_0x2ee041(0x21b)](_0x2133cb){const _0x473f2c=_0x2ee041,{name:_0xa75e83,catId:_0x57a58f}=_0x2133cb;_0x2133cb['role']=_0x473f2c(0x20d);const _0x2fae10=await this[_0x473f2c(0x1f4)]['findOne']({'where':{'name':_0xa75e83}});if(_0x2fae10)throw new common_1[(_0x473f2c(0x1f3))]('该应用名称已存在！',common_1[_0x473f2c(0x1f5)][_0x473f2c(0x1e0)]);const _0x5e8f2b=await this[_0x473f2c(0x1ba)][_0x473f2c(0x1c5)]({'where':{'id':_0x57a58f}});if(!_0x5e8f2b)throw new common_1['HttpException'](_0x473f2c(0x1ca),common_1[_0x473f2c(0x1f5)][_0x473f2c(0x1e0)]);return await this[_0x473f2c(0x1f4)][_0x473f2c(0x219)](_0x2133cb);}async[_0x2ee041(0x1ce)](_0x51a7d3,_0x21d6fd){const _0x36f76d=_0x2ee041,{id:_0x37f92a}=_0x21d6fd[_0x36f76d(0x1ff)],{name:_0x41558b,catId:_0x49dd47,des:_0x3156ea,preset:_0x1f3d1f,coverImg:_0x552dae,demoData:_0x4f4edc,public:_0x2cc127,appId:_0x37023e}=_0x51a7d3;if(_0x37023e){const _0x17f339=await this[_0x36f76d(0x1f4)]['findOne']({'where':{'id':_0x37023e,'userId':_0x37f92a}});if(!_0x17f339)throw new common_1['HttpException'](_0x36f76d(0x1d0),common_1[_0x36f76d(0x1f5)][_0x36f76d(0x1e0)]);const _0x369349={'name':_0x41558b,'catId':_0x49dd47,'des':_0x3156ea,'preset':_0x1f3d1f,'coverImg':_0x552dae,'demoData':_0x4f4edc,'public':_0x2cc127,'status':_0x2cc127?0x3:0x1},_0x5d8e7e=await this[_0x36f76d(0x1f4)][_0x36f76d(0x1ea)]({'id':_0x37023e,'userId':_0x37f92a},_0x369349);if(_0x5d8e7e[_0x36f76d(0x215)])return _0x36f76d(0x1e3);else throw new common_1[(_0x36f76d(0x1f3))]('修改失败！',common_1[_0x36f76d(0x1f5)][_0x36f76d(0x1e0)]);}if(!_0x37023e){const _0x54e81e=await this[_0x36f76d(0x1ba)][_0x36f76d(0x1c5)]({'where':{'id':_0x49dd47}});if(!_0x54e81e)throw new common_1['HttpException'](_0x36f76d(0x1ca),common_1[_0x36f76d(0x1f5)][_0x36f76d(0x1e0)]);const _0x7dd1e2=await this['appEntity'][_0x36f76d(0x1c5)]({'where':{'name':_0x41558b}});if(_0x7dd1e2)throw new common_1[(_0x36f76d(0x1f3))](_0x36f76d(0x1f9),common_1['HttpStatus'][_0x36f76d(0x1e0)]);const _0x4c4a22={'name':_0x41558b,'catId':_0x49dd47,'des':_0x3156ea,'preset':_0x1f3d1f,'coverImg':_0x552dae,'status':_0x2cc127?0x3:0x1,'demoData':_0x4f4edc,'public':_0x2cc127,'role':_0x36f76d(0x1ff),'userId':_0x37f92a},_0x15e8dd=await this[_0x36f76d(0x1f4)][_0x36f76d(0x219)](_0x4c4a22),_0x25ffb8={'appId':_0x15e8dd['id'],'userId':_0x37f92a,'appType':'user','public':_0x2cc127,'status':_0x2cc127?0x3:0x1,'catId':_0x49dd47};return this[_0x36f76d(0x1d3)]['save'](_0x25ffb8);}}async[_0x2ee041(0x1d9)](_0x110016){const _0x173b40=_0x2ee041,{id:_0x159481,name:_0xbfb172,catId:_0x24b40,status:_0x398391}=_0x110016,_0x184a4c=await this[_0x173b40(0x1f4)][_0x173b40(0x1c5)]({'where':{'name':_0xbfb172,'id':(0x0,typeorm_1['Not'])(_0x159481)}});if(_0x184a4c)throw new common_1[(_0x173b40(0x1f3))]('该应用名称已存在！',common_1['HttpStatus'][_0x173b40(0x1e0)]);const _0x1db463=await this['appCatsEntity'][_0x173b40(0x1c5)]({'where':{'id':_0x24b40}});if(!_0x1db463)throw new common_1[(_0x173b40(0x1f3))](_0x173b40(0x1ca),common_1[_0x173b40(0x1f5)][_0x173b40(0x1e0)]);const _0x56a680=await this[_0x173b40(0x1f4)][_0x173b40(0x1c5)]({'where':{'id':_0x159481}});_0x56a680[_0x173b40(0x1ec)]!==_0x110016[_0x173b40(0x1ec)]&&await this[_0x173b40(0x1d3)][_0x173b40(0x1ea)]({'appId':_0x159481},{'status':_0x398391});const _0x3bea9c=await this['appEntity']['update']({'id':_0x159481},_0x110016);if(_0x3bea9c[_0x173b40(0x215)]>0x0)return'修改App信息成功';throw new common_1['HttpException'](_0x173b40(0x1bb),common_1[_0x173b40(0x1f5)][_0x173b40(0x1e0)]);}async[_0x2ee041(0x1ef)](_0x2392fc){const _0xb98bce=_0x2ee041,{id:_0xc4b5e5}=_0x2392fc,_0x215b00=await this['appEntity'][_0xb98bce(0x1c5)]({'where':{'id':_0xc4b5e5}});if(!_0x215b00)throw new common_1['HttpException'](_0xb98bce(0x1fb),common_1[_0xb98bce(0x1f5)][_0xb98bce(0x1e0)]);const _0x1a8f51=await this[_0xb98bce(0x1d3)][_0xb98bce(0x1e2)]({'where':{'appId':_0xc4b5e5}});if(_0x1a8f51>0x0)throw new common_1[(_0xb98bce(0x1f3))](_0xb98bce(0x1c1),common_1['HttpStatus'][_0xb98bce(0x1e0)]);const _0x32dd4f=await this['appEntity'][_0xb98bce(0x210)](_0xc4b5e5);if(_0x32dd4f[_0xb98bce(0x215)]>0x0)return _0xb98bce(0x1c3);throw new common_1[(_0xb98bce(0x1f3))](_0xb98bce(0x1fa),common_1[_0xb98bce(0x1f5)][_0xb98bce(0x1e0)]);}async[_0x2ee041(0x1dc)](_0x536053){const _0x1b336d=_0x2ee041,{id:_0x5d092b}=_0x536053,_0x316ef2=await this['appEntity'][_0x1b336d(0x1c5)]({'where':{'id':_0x5d092b,'status':0x3}});if(!_0x316ef2)throw new common_1['HttpException']('该应用不存在！',common_1['HttpStatus'][_0x1b336d(0x1e0)]);return await this[_0x1b336d(0x1f4)]['update']({'id':_0x5d092b},{'status':0x4}),await this[_0x1b336d(0x1d3)][_0x1b336d(0x1ea)]({'appId':_0x5d092b},{'status':0x4}),_0x1b336d(0x217);}async['auditFail'](_0x17de68){const _0xe8ae99=_0x2ee041,{id:_0x243afc}=_0x17de68,_0x223306=await this[_0xe8ae99(0x1f4)][_0xe8ae99(0x1c5)]({'where':{'id':_0x243afc,'status':0x3}});if(!_0x223306)throw new common_1[(_0xe8ae99(0x1f3))](_0xe8ae99(0x1fb),common_1[_0xe8ae99(0x1f5)][_0xe8ae99(0x1e0)]);return await this[_0xe8ae99(0x1f4)][_0xe8ae99(0x1ea)]({'id':_0x243afc},{'status':0x5}),await this[_0xe8ae99(0x1d3)][_0xe8ae99(0x1ea)]({'appId':_0x243afc},{'status':0x5}),_0xe8ae99(0x1de);}async['delMineApp'](_0x335496,_0x35635d){const _0x375791=_0x2ee041,{id:_0x4f2ef1}=_0x335496,_0x2db619=await this[_0x375791(0x1f4)]['findOne']({'where':{'id':_0x4f2ef1,'userId':_0x35635d['user']['id']}});if(!_0x2db619)throw new common_1[(_0x375791(0x1f3))](_0x375791(0x1f8),common_1[_0x375791(0x1f5)][_0x375791(0x1e0)]);return await this['appEntity'][_0x375791(0x210)](_0x4f2ef1),await this[_0x375791(0x1d3)][_0x375791(0x210)]({'appId':_0x4f2ef1,'userId':_0x35635d[_0x375791(0x1ff)]['id']}),_0x375791(0x21a);}async[_0x2ee041(0x1fc)](_0x4b8741,_0x42524f){const _0x273b66=_0x2ee041,{appId:_0x3af5fb}=_0x4b8741,{id:_0xbf5fa3}=_0x42524f[_0x273b66(0x1ff)],_0x3490cf=await this[_0x273b66(0x1d3)][_0x273b66(0x1c5)]({'where':{'appId':_0x3af5fb,'userId':_0xbf5fa3}});if(_0x3490cf){const _0x620ac2=await this['userAppsEntity'][_0x273b66(0x210)]({'appId':_0x3af5fb,'userId':_0xbf5fa3});if(_0x620ac2[_0x273b66(0x215)]>0x0)return'取消收藏成功!';else throw new common_1['HttpException'](_0x273b66(0x206),common_1[_0x273b66(0x1f5)][_0x273b66(0x1e0)]);}const _0x3b7bee=await this['appEntity']['findOne']({'where':{'id':_0x3af5fb}}),{id:_0x2236c8,role:_0x498e45,catId:_0x4577e6}=_0x3b7bee,_0x15f38d={'userId':_0xbf5fa3,'appId':_0x2236c8,'catId':_0x4577e6,'appRole':_0x498e45,'public':!![],'status':0x1};return await this[_0x273b66(0x1d3)][_0x273b66(0x219)](_0x15f38d),_0x273b66(0x1dd);}async[_0x2ee041(0x1fe)](_0x1d98c8,_0x5c1fb6={'page':0x1,'size':0x1e}){const _0x8b82bc=_0x2ee041,{id:_0x190e95}=_0x1d98c8[_0x8b82bc(0x1ff)],{page:page=0x1,size:size=0x1e}=_0x5c1fb6,[_0x1b8212,_0x14f7e4]=await this[_0x8b82bc(0x1d3)][_0x8b82bc(0x1bd)]({'where':{'userId':_0x190e95,'status':(0x0,typeorm_1['In'])([0x1,0x3,0x4,0x5])},'order':{'id':_0x8b82bc(0x213)},'skip':(page-0x1)*size,'take':size}),_0x392270=_0x1b8212[_0x8b82bc(0x1c4)](_0x2cf96c=>_0x2cf96c[_0x8b82bc(0x1bc)]),_0x4000c9=await this[_0x8b82bc(0x1f4)][_0x8b82bc(0x1e7)]({'where':{'id':(0x0,typeorm_1['In'])(_0x392270)}});return _0x1b8212[_0x8b82bc(0x1da)](_0x381207=>{const _0xda1e39=_0x8b82bc,_0xe79dba=_0x4000c9[_0xda1e39(0x1e7)](_0x1b7893=>_0x1b7893['id']===_0x381207['appId']);_0x381207[_0xda1e39(0x1cf)]=_0xe79dba?_0xe79dba['name']:'',_0x381207[_0xda1e39(0x1f1)]=_0xe79dba?_0xe79dba[_0xda1e39(0x1d8)]:'',_0x381207[_0xda1e39(0x1db)]=_0xe79dba?_0xe79dba[_0xda1e39(0x20c)]:'',_0x381207['coverImg']=_0xe79dba?_0xe79dba['coverImg']:'',_0x381207[_0xda1e39(0x212)]=_0xe79dba?_0xe79dba[_0xda1e39(0x212)]:'',_0x381207[_0xda1e39(0x1df)]=_0xe79dba[_0xda1e39(0x1d2)]===_0x190e95?_0xe79dba[_0xda1e39(0x1df)]:_0xda1e39(0x1cb);}),{'rows':_0x1b8212,'count':_0x14f7e4};}};AppService=__decorate([(0x0,common_1[_0x2ee041(0x214)])(),__param(0x0,(0x0,typeorm_2['InjectRepository'])(appCats_entity_1[_0x2ee041(0x205)])),__param(0x1,(0x0,typeorm_2[_0x2ee041(0x1fd)])(app_entity_1[_0x2ee041(0x1ee)])),__param(0x2,(0x0,typeorm_2[_0x2ee041(0x1fd)])(userApps_entity_1[_0x2ee041(0x1e4)])),__metadata(_0x2ee041(0x1f6),[typeorm_1[_0x2ee041(0x1c9)],typeorm_1[_0x2ee041(0x1c9)],typeorm_1['Repository']])],AppService),exports[_0x2ee041(0x211)]=AppService;