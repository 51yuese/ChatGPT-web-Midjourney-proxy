'use strict';function _0x13ae(){const _0x5dbde0=['mineApps','修改失败！','@nestjs/typeorm','HttpStatus','./appCats.entity','您正在编辑一个不存在的应用！','./userApps.entity','function','design:paramtypes','frontAppList','该应用名称已存在！','findOne','decorate','******','修改App信息失败！','已将应用添加到我的应用！','createAppCat','forEach','HttpException','删除成功','appCount','update','user','11vKiGTn','customApp','appCatsEntity','status','appList','count','appRole','\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20gm.*,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20gg.groupName,\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20ua.createdAt\x20AS\x20collectTime\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20user_apps\x20ua\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20gpts_models\x20gm\x20ON\x20ua.appId\x20=\x20gm.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20gpts_group\x20gg\x20ON\x20gm.groupId\x20=\x20gg.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20ua.userId\x20=\x20','catch','GptsModelEntity','../gpts/gpts.model.entity','collect','30KqaVmA','typeorm','createApp','已将应用移除我的应用!','query','getOwnPropertyDescriptor','log','修改成功','Logger','catId','catName','取消移除我的应用失败！','@nestjs/common','__esModule','DESC','save','AppService','find','length','super','random','\x0a\x20\x20\x20\x20\x20\x20','delete','该应用已被用户关联使用中，不可删除！','./app.entity','InjectRepository','delMineApp','Not','8354484bqhfIW','3734465VDqkvb','connection','删除App成功','31206ZnzVDN','map','gptsModelEntity','445EPoqfa','name','preset','collectCount','appCatsList','userAppsEntity','appEntity','Repository','删除App失败！','role','findAndCount','9644lFFUlS','该分类不存在！','defineProperty','delAppCat','appDes','includes','该分类名称已存在！','__decorate','auditPass','Like','object','1650183RkSJhM','BAD_REQUEST','delApp','metadata','应用审核拒绝完成','affected','该分类下存在App，不可删除！','AppCatsEntity','Injectable','8jQlGUr','您正在操作一个不存在的资源！','appId','1742382UFFPoF','应用审核通过','Connection','auditFail','6TmxrDz','mineAppsV3','coverImg','1567809NpxzdU','该应用不存在！','system','des','round'];_0x13ae=function(){return _0x5dbde0;};return _0x13ae();}const _0xb8f669=_0x3cd8;(function(_0x58702e,_0x15e9ad){const _0xb6f396=_0x3cd8,_0x582f34=_0x58702e();while(!![]){try{const _0x54a676=-parseInt(_0xb6f396(0x13b))/0x1*(parseInt(_0xb6f396(0x164))/0x2)+parseInt(_0xb6f396(0x154))/0x3+-parseInt(_0xb6f396(0x149))/0x4*(-parseInt(_0xb6f396(0x13e))/0x5)+parseInt(_0xb6f396(0x160))/0x6+-parseInt(_0xb6f396(0x138))/0x7*(-parseInt(_0xb6f396(0x15d))/0x8)+parseInt(_0xb6f396(0x167))/0x9*(-parseInt(_0xb6f396(0x18f))/0xa)+parseInt(_0xb6f396(0x183))/0xb*(-parseInt(_0xb6f396(0x137))/0xc);if(_0x54a676===_0x15e9ad)break;else _0x582f34['push'](_0x582f34['shift']());}catch(_0x195690){_0x582f34['push'](_0x582f34['shift']());}}}(_0x13ae,0x43688));var __decorate=this&&this[_0xb8f669(0x150)]||function(_0x565253,_0xca9380,_0x373bd2,_0x288685){const _0x434461=_0xb8f669;var _0x641a4b=arguments[_0x434461(0x1a1)],_0x26db04=_0x641a4b<0x3?_0xca9380:_0x288685===null?_0x288685=Object[_0x434461(0x194)](_0xca9380,_0x373bd2):_0x288685,_0x242100;if(typeof Reflect===_0x434461(0x153)&&typeof Reflect[_0x434461(0x178)]==='function')_0x26db04=Reflect[_0x434461(0x178)](_0x565253,_0xca9380,_0x373bd2,_0x288685);else{for(var _0x33605f=_0x565253[_0x434461(0x1a1)]-0x1;_0x33605f>=0x0;_0x33605f--)if(_0x242100=_0x565253[_0x33605f])_0x26db04=(_0x641a4b<0x3?_0x242100(_0x26db04):_0x641a4b>0x3?_0x242100(_0xca9380,_0x373bd2,_0x26db04):_0x242100(_0xca9380,_0x373bd2))||_0x26db04;}return _0x641a4b>0x3&&_0x26db04&&Object[_0x434461(0x14b)](_0xca9380,_0x373bd2,_0x26db04),_0x26db04;},__metadata=this&&this['__metadata']||function(_0x46e7be,_0x28af44){const _0x37e7c0=_0xb8f669;if(typeof Reflect===_0x37e7c0(0x153)&&typeof Reflect['metadata']===_0x37e7c0(0x173))return Reflect[_0x37e7c0(0x157)](_0x46e7be,_0x28af44);},__param=this&&this['__param']||function(_0xb5129,_0x474415){return function(_0x3d7c55,_0x470b58){_0x474415(_0x3d7c55,_0x470b58,_0xb5129);};};Object[_0xb8f669(0x14b)](exports,_0xb8f669(0x19c),{'value':!![]}),exports[_0xb8f669(0x19f)]=void 0x0;const common_1=require(_0xb8f669(0x19b)),appCats_entity_1=require(_0xb8f669(0x170)),typeorm_1=require(_0xb8f669(0x190)),typeorm_2=require(_0xb8f669(0x16e)),app_entity_1=require(_0xb8f669(0x133)),userApps_entity_1=require(_0xb8f669(0x172)),gpts_model_entity_1=require(_0xb8f669(0x18d));function _0x3cd8(_0x339a0f,_0x24bbcd){const _0x13ae6d=_0x13ae();return _0x3cd8=function(_0x3cd83a,_0x5240be){_0x3cd83a=_0x3cd83a-0x12f;let _0x453597=_0x13ae6d[_0x3cd83a];return _0x453597;},_0x3cd8(_0x339a0f,_0x24bbcd);}let AppService=class AppService{constructor(_0x4cb1cf,_0x3ec63c,_0x304d47,_0x481b15,_0x7d451f){const _0x2191e6=_0xb8f669;this['appCatsEntity']=_0x4cb1cf,this['appEntity']=_0x3ec63c,this[_0x2191e6(0x13d)]=_0x304d47,this['userAppsEntity']=_0x481b15,this['connection']=_0x7d451f;}async[_0xb8f669(0x17c)](_0x6de73b){const _0x473c19=_0xb8f669,{name:_0x1fb94a}=_0x6de73b,_0x4c480c=await this[_0x473c19(0x185)][_0x473c19(0x177)]({'where':{'name':_0x1fb94a}});if(_0x4c480c)throw new common_1[(_0x473c19(0x17e))](_0x473c19(0x14f),common_1[_0x473c19(0x16f)][_0x473c19(0x155)]);return await this[_0x473c19(0x185)][_0x473c19(0x19e)](_0x6de73b);}async[_0xb8f669(0x14c)](_0x5dca75){const _0x18276f=_0xb8f669,{id:_0x42a650}=_0x5dca75,_0x32434a=await this[_0x18276f(0x185)][_0x18276f(0x177)]({'where':{'id':_0x42a650}});if(!_0x32434a)throw new common_1['HttpException'](_0x18276f(0x14a),common_1['HttpStatus'][_0x18276f(0x155)]);const _0x21876f=await this[_0x18276f(0x144)][_0x18276f(0x188)]({'where':{'catId':_0x42a650}});if(_0x21876f>0x0)throw new common_1[(_0x18276f(0x17e))](_0x18276f(0x15a),common_1[_0x18276f(0x16f)][_0x18276f(0x155)]);const _0x23e0d0=await this[_0x18276f(0x185)]['delete'](_0x42a650);if(_0x23e0d0[_0x18276f(0x159)]>0x0)return _0x18276f(0x17f);throw new common_1[(_0x18276f(0x17e))]('删除失败！',common_1[_0x18276f(0x16f)][_0x18276f(0x155)]);}async['updateAppCats'](_0x500a0d){const _0x287e6f=_0xb8f669,{id:_0x3fa230,name:_0x2472e8}=_0x500a0d,_0x430174=await this[_0x287e6f(0x185)]['findOne']({'where':{'name':_0x2472e8,'id':(0x0,typeorm_1[_0x287e6f(0x136)])(_0x3fa230)}});if(_0x430174)throw new common_1['HttpException'](_0x287e6f(0x14f),common_1[_0x287e6f(0x16f)][_0x287e6f(0x155)]);const _0x18764c=await this[_0x287e6f(0x185)][_0x287e6f(0x181)]({'id':_0x3fa230},_0x500a0d);if(_0x18764c[_0x287e6f(0x159)]>0x0)return _0x287e6f(0x196);throw new common_1['HttpException'](_0x287e6f(0x16d),common_1[_0x287e6f(0x16f)][_0x287e6f(0x155)]);}async[_0xb8f669(0x142)](_0x7fbf28){const _0x3023ef=_0xb8f669,{page:page=0x1,size:size=0xa,name:_0x5c03c8,status:_0xc6d86d}=_0x7fbf28,_0x390dd6={};_0x5c03c8&&(_0x390dd6[_0x3023ef(0x13f)]=(0x0,typeorm_1[_0x3023ef(0x152)])('%'+_0x5c03c8+'%')),[0x0,0x1,'0','1'][_0x3023ef(0x14e)](_0xc6d86d)&&(_0x390dd6[_0x3023ef(0x186)]=_0xc6d86d);const [_0x31970a,_0x271999]=await this[_0x3023ef(0x185)]['findAndCount']({'where':_0x390dd6,'order':{'order':_0x3023ef(0x19d)},'skip':(page-0x1)*size,'take':size}),_0x86b0e0=_0x31970a[_0x3023ef(0x13c)](_0x151c78=>_0x151c78['id']),_0x1b3b6a=await this[_0x3023ef(0x144)]['find']({'where':{'catId':(0x0,typeorm_1['In'])(_0x86b0e0)}}),_0x3244be={};return _0x1b3b6a[_0x3023ef(0x17d)](_0x58dcf0=>{const _0x4f3fe4=_0x3023ef;_0x3244be[_0x58dcf0[_0x4f3fe4(0x198)]]?_0x3244be[_0x58dcf0[_0x4f3fe4(0x198)]]+=0x1:_0x3244be[_0x58dcf0[_0x4f3fe4(0x198)]]=0x1;}),_0x31970a['forEach'](_0x560413=>_0x560413[_0x3023ef(0x180)]=_0x3244be[_0x560413['id']]||0x0),{'rows':_0x31970a,'count':_0x271999};}async[_0xb8f669(0x187)](_0x68f4e1,_0x6621ce,_0x1a0da3='id'){const _0x13839f=_0xb8f669;console['log'](_0x6621ce);const {page:page=0x1,size:size=0xa,name:_0x138289,status:_0x1b5c8e,catId:_0x3677e4,role:_0x22bd89}=_0x6621ce,_0x4f2704={};_0x138289&&(_0x4f2704[_0x13839f(0x13f)]=(0x0,typeorm_1['Like'])('%'+_0x138289+'%')),_0x3677e4&&(_0x4f2704[_0x13839f(0x198)]=_0x3677e4),_0x22bd89&&(_0x4f2704[_0x13839f(0x147)]=_0x22bd89),_0x1b5c8e&&(_0x4f2704['status']=_0x1b5c8e);const [_0x33e821,_0x14f7ce]=await this[_0x13839f(0x144)][_0x13839f(0x148)]({'where':_0x4f2704,'order':{[_0x1a0da3]:_0x13839f(0x19d)},'skip':(page-0x1)*size,'take':size}),_0xb8629f=_0x33e821[_0x13839f(0x13c)](_0x1e0368=>_0x1e0368[_0x13839f(0x198)]),_0x27e12d=await this['appCatsEntity'][_0x13839f(0x1a0)]({'where':{'id':(0x0,typeorm_1['In'])(_0xb8629f)}});return _0x33e821[_0x13839f(0x17d)](_0x59ee54=>{const _0x4628b8=_0x13839f,_0x577a0e=_0x27e12d[_0x4628b8(0x1a0)](_0x5ca1b6=>_0x5ca1b6['id']===_0x59ee54[_0x4628b8(0x198)]);_0x59ee54[_0x4628b8(0x199)]=_0x577a0e?_0x577a0e[_0x4628b8(0x13f)]:'';}),_0x68f4e1?.[_0x13839f(0x182)]?.['role']!=='super'&&_0x33e821[_0x13839f(0x17d)](_0x5370d5=>{delete _0x5370d5['preset'];}),{'rows':_0x33e821,'count':_0x14f7ce};}async[_0xb8f669(0x175)](_0x50ee68,_0x5d75b7,_0x3a35fb='id'){const _0xe5751b=_0xb8f669,{page:page=0x1,size:size=0x64,name:_0x3f4258,catId:_0x4de566,role:_0x1f7207}=_0x5d75b7,_0x276b6d=[{'status':(0x0,typeorm_1['In'])([0x1,0x4]),'userId':(0x0,typeorm_1['IsNull'])(),'public':![]},{'userId':(0x0,typeorm_1['MoreThan'])(0x0),'public':!![]}],[_0x37a6e2,_0x1e4f8c]=await this[_0xe5751b(0x144)][_0xe5751b(0x148)]({'where':_0x276b6d,'order':{'order':_0xe5751b(0x19d)},'skip':(page-0x1)*size,'take':size}),_0xa23fef=_0x37a6e2['map'](_0x564bdc=>_0x564bdc['catId']),_0x11e99a=await this[_0xe5751b(0x185)][_0xe5751b(0x1a0)]({'where':{'id':(0x0,typeorm_1['In'])(_0xa23fef)}});return _0x37a6e2[_0xe5751b(0x17d)](_0x64e4bf=>{const _0x334067=_0xe5751b,_0x2e2e3a=_0x11e99a[_0x334067(0x1a0)](_0x580d13=>_0x580d13['id']===_0x64e4bf[_0x334067(0x198)]);_0x64e4bf[_0x334067(0x199)]=_0x2e2e3a?_0x2e2e3a[_0x334067(0x13f)]:'';}),_0x50ee68?.['user']?.[_0xe5751b(0x147)]!==_0xe5751b(0x1a2)&&_0x37a6e2[_0xe5751b(0x17d)](_0x2072b7=>{delete _0x2072b7['preset'];}),{'rows':_0x37a6e2,'count':_0x1e4f8c};}async[_0xb8f669(0x191)](_0x42aac4){const _0x2e5f2d=_0xb8f669,{name:_0xd6038d,catId:_0x1be09a}=_0x42aac4;_0x42aac4['role']=_0x2e5f2d(0x169);const _0x566c1b=await this['appEntity'][_0x2e5f2d(0x177)]({'where':{'name':_0xd6038d}});if(_0x566c1b)throw new common_1[(_0x2e5f2d(0x17e))](_0x2e5f2d(0x176),common_1[_0x2e5f2d(0x16f)]['BAD_REQUEST']);const _0x2e48db=await this['appCatsEntity'][_0x2e5f2d(0x177)]({'where':{'id':_0x1be09a}});if(!_0x2e48db)throw new common_1['HttpException']('该分类不存在！',common_1[_0x2e5f2d(0x16f)][_0x2e5f2d(0x155)]);return await this['appEntity'][_0x2e5f2d(0x19e)](_0x42aac4);}async[_0xb8f669(0x184)](_0x37c573,_0x30f110){const _0x196beb=_0xb8f669,{id:_0x57e186}=_0x30f110['user'],{name:_0x57b450,catId:_0x482cb9,des:_0x24f1b5,preset:_0x5f26ca,coverImg:_0x57334c,demoData:_0x354d7e,public:_0x2dd427,appId:_0x37c628}=_0x37c573;if(_0x37c628){const _0x5c6c5a=await this[_0x196beb(0x144)][_0x196beb(0x177)]({'where':{'id':_0x37c628,'userId':_0x57e186}});if(!_0x5c6c5a)throw new common_1[(_0x196beb(0x17e))](_0x196beb(0x171),common_1[_0x196beb(0x16f)][_0x196beb(0x155)]);const _0x155548={'name':_0x57b450,'catId':_0x482cb9,'des':_0x24f1b5,'preset':_0x5f26ca,'coverImg':_0x57334c,'demoData':_0x354d7e,'public':_0x2dd427,'status':_0x2dd427?0x3:0x1},_0x45fb5b=await this[_0x196beb(0x144)][_0x196beb(0x181)]({'id':_0x37c628,'userId':_0x57e186},_0x155548);if(_0x45fb5b['affected'])return _0x196beb(0x196);else throw new common_1[(_0x196beb(0x17e))](_0x196beb(0x16d),common_1['HttpStatus'][_0x196beb(0x155)]);}if(!_0x37c628){const _0x51d97f=await this['appCatsEntity'][_0x196beb(0x177)]({'where':{'id':_0x482cb9}});if(!_0x51d97f)throw new common_1['HttpException'](_0x196beb(0x14a),common_1['HttpStatus']['BAD_REQUEST']);const _0x19465f=await this['appEntity']['findOne']({'where':{'name':_0x57b450}});if(_0x19465f)throw new common_1[(_0x196beb(0x17e))](_0x196beb(0x176),common_1[_0x196beb(0x16f)][_0x196beb(0x155)]);const _0x4086e0={'name':_0x57b450,'catId':_0x482cb9,'des':_0x24f1b5,'preset':_0x5f26ca,'coverImg':_0x57334c,'status':_0x2dd427?0x3:0x1,'demoData':_0x354d7e,'public':_0x2dd427,'role':_0x196beb(0x182),'userId':_0x57e186},_0x3aa88b=await this[_0x196beb(0x144)][_0x196beb(0x19e)](_0x4086e0),_0xc20958={'appId':_0x3aa88b['id'],'userId':_0x57e186,'appType':_0x196beb(0x182),'public':_0x2dd427,'status':_0x2dd427?0x3:0x1,'catId':_0x482cb9};return this['userAppsEntity'][_0x196beb(0x19e)](_0xc20958);}}async['updateApp'](_0x3b4977){const _0x37dcfc=_0xb8f669,{id:_0x348981,name:_0xa0bcfa,catId:_0x5af771,status:_0x43cde8}=_0x3b4977,_0x31bd59=await this[_0x37dcfc(0x144)]['findOne']({'where':{'name':_0xa0bcfa,'id':(0x0,typeorm_1[_0x37dcfc(0x136)])(_0x348981)}});if(_0x31bd59)throw new common_1[(_0x37dcfc(0x17e))](_0x37dcfc(0x176),common_1[_0x37dcfc(0x16f)][_0x37dcfc(0x155)]);const _0x25c87c=await this[_0x37dcfc(0x185)][_0x37dcfc(0x177)]({'where':{'id':_0x5af771}});if(!_0x25c87c)throw new common_1[(_0x37dcfc(0x17e))]('该分类不存在！',common_1['HttpStatus'][_0x37dcfc(0x155)]);const _0x32f66f=await this['appEntity'][_0x37dcfc(0x177)]({'where':{'id':_0x348981}});_0x32f66f[_0x37dcfc(0x186)]!==_0x3b4977[_0x37dcfc(0x186)]&&await this[_0x37dcfc(0x143)][_0x37dcfc(0x181)]({'appId':_0x348981},{'status':_0x43cde8});const _0x3fbdcd=await this[_0x37dcfc(0x144)]['update']({'id':_0x348981},_0x3b4977);if(_0x3fbdcd[_0x37dcfc(0x159)]>0x0)return'修改App信息成功';throw new common_1[(_0x37dcfc(0x17e))](_0x37dcfc(0x17a),common_1[_0x37dcfc(0x16f)]['BAD_REQUEST']);}async[_0xb8f669(0x156)](_0x385b50){const _0x356bf2=_0xb8f669,{id:_0x1197e5}=_0x385b50,_0x35a7f5=await this[_0x356bf2(0x144)]['findOne']({'where':{'id':_0x1197e5}});if(!_0x35a7f5)throw new common_1[(_0x356bf2(0x17e))](_0x356bf2(0x168),common_1['HttpStatus'][_0x356bf2(0x155)]);const _0x168b0f=await this[_0x356bf2(0x143)][_0x356bf2(0x188)]({'where':{'appId':_0x1197e5}});if(_0x168b0f>0x0)throw new common_1['HttpException'](_0x356bf2(0x132),common_1['HttpStatus'][_0x356bf2(0x155)]);const _0x31d65d=await this[_0x356bf2(0x144)][_0x356bf2(0x131)](_0x1197e5);if(_0x31d65d[_0x356bf2(0x159)]>0x0)return _0x356bf2(0x13a);throw new common_1[(_0x356bf2(0x17e))](_0x356bf2(0x146),common_1[_0x356bf2(0x16f)][_0x356bf2(0x155)]);}async[_0xb8f669(0x151)](_0x286a72){const _0x5c341b=_0xb8f669,{id:_0x4a2de2}=_0x286a72,_0x5e9cb2=await this[_0x5c341b(0x144)][_0x5c341b(0x177)]({'where':{'id':_0x4a2de2,'status':0x3}});if(!_0x5e9cb2)throw new common_1[(_0x5c341b(0x17e))](_0x5c341b(0x168),common_1[_0x5c341b(0x16f)][_0x5c341b(0x155)]);return await this['appEntity']['update']({'id':_0x4a2de2},{'status':0x4}),await this[_0x5c341b(0x143)]['update']({'appId':_0x4a2de2},{'status':0x4}),_0x5c341b(0x161);}async[_0xb8f669(0x163)](_0x48ed9d){const _0x309bc7=_0xb8f669,{id:_0x20096e}=_0x48ed9d,_0x172cb6=await this[_0x309bc7(0x144)]['findOne']({'where':{'id':_0x20096e,'status':0x3}});if(!_0x172cb6)throw new common_1[(_0x309bc7(0x17e))]('该应用不存在！',common_1[_0x309bc7(0x16f)][_0x309bc7(0x155)]);return await this[_0x309bc7(0x144)][_0x309bc7(0x181)]({'id':_0x20096e},{'status':0x5}),await this[_0x309bc7(0x143)][_0x309bc7(0x181)]({'appId':_0x20096e},{'status':0x5}),_0x309bc7(0x158);}async[_0xb8f669(0x135)](_0x14f64f,_0x54b0f9){const _0x589e06=_0xb8f669,{id:_0x47dfe8}=_0x14f64f,_0x4ed28c=await this[_0x589e06(0x144)]['findOne']({'where':{'id':_0x47dfe8,'userId':_0x54b0f9[_0x589e06(0x182)]['id']}});if(!_0x4ed28c)throw new common_1['HttpException'](_0x589e06(0x15e),common_1[_0x589e06(0x16f)][_0x589e06(0x155)]);return await this['appEntity'][_0x589e06(0x131)](_0x47dfe8),await this[_0x589e06(0x143)][_0x589e06(0x131)]({'appId':_0x47dfe8,'userId':_0x54b0f9[_0x589e06(0x182)]['id']}),'删除应用成功！';}async[_0xb8f669(0x18e)](_0xf7a03d,_0x4e4f53){const _0x46f2a6=_0xb8f669,{appId:_0x4403ba}=_0xf7a03d,{id:_0xc8bfa7}=_0x4e4f53[_0x46f2a6(0x182)];try{const _0xd2b6d1=await this['userAppsEntity'][_0x46f2a6(0x177)]({'where':{'appId':_0x4403ba,'userId':_0xc8bfa7}})[_0x46f2a6(0x18b)](_0x252347=>{const _0x5aeb1f=_0x46f2a6;common_1[_0x5aeb1f(0x197)]['log'](_0x252347);});if(_0xd2b6d1){const _0x499b47=await this[_0x46f2a6(0x143)][_0x46f2a6(0x131)]({'appId':_0x4403ba,'userId':_0xc8bfa7})[_0x46f2a6(0x18b)](_0x7915a5=>{const _0x291869=_0x46f2a6;common_1[_0x291869(0x197)][_0x291869(0x195)](_0x7915a5);});if(!_0x499b47||_0x499b47[_0x46f2a6(0x159)]<=0x0)throw new common_1[(_0x46f2a6(0x17e))](_0x46f2a6(0x19a),common_1[_0x46f2a6(0x16f)][_0x46f2a6(0x155)]);return _0x46f2a6(0x192);}const _0x1008a7=await this['gptsModelEntity'][_0x46f2a6(0x177)]({'where':{'id':_0x4403ba}})[_0x46f2a6(0x18b)](_0x1b678d=>{const _0x23c212=_0x46f2a6;common_1['Logger'][_0x23c212(0x195)](_0x1b678d);});if(!_0x1008a7)throw new common_1[(_0x46f2a6(0x17e))]('操作失败！',common_1[_0x46f2a6(0x16f)][_0x46f2a6(0x155)]);const _0x30301d={'userId':_0xc8bfa7,'appId':_0x1008a7['id'],'catId':_0x1008a7['groupId'],'appRole':_0x46f2a6(0x169),'public':!![],'status':0x1};return await this[_0x46f2a6(0x143)][_0x46f2a6(0x19e)](_0x30301d)[_0x46f2a6(0x18b)](_0x14aee0=>{const _0x1ddb94=_0x46f2a6;common_1[_0x1ddb94(0x197)][_0x1ddb94(0x195)](_0x14aee0);}),_0x1008a7[_0x46f2a6(0x141)]=_0x1008a7[_0x46f2a6(0x141)]+Math[_0x46f2a6(0x16b)](Math[_0x46f2a6(0x12f)]()*0xa),await this[_0x46f2a6(0x13d)][_0x46f2a6(0x19e)](_0x1008a7),_0x46f2a6(0x17b);}catch(_0x48418c){console[_0x46f2a6(0x195)](_0x48418c);}}async[_0xb8f669(0x16c)](_0x48aebf,_0x2c59df={'page':0x1,'size':0x1e}){const _0x2c4343=_0xb8f669,{id:_0x329784}=_0x48aebf['user'],{page:page=0x1,size:size=0x1e}=_0x2c59df,[_0x9efd1a,_0x1ca395]=await this[_0x2c4343(0x143)][_0x2c4343(0x148)]({'where':{'userId':_0x329784,'status':(0x0,typeorm_1['In'])([0x1,0x3,0x4,0x5])},'order':{'id':'DESC'},'skip':(page-0x1)*size,'take':size});if(_0x9efd1a[_0x2c4343(0x1a1)]===0x0)return{'rows':_0x9efd1a,'count':_0x1ca395};const _0x35bc7d=_0x9efd1a[_0x2c4343(0x13c)](_0x156cfb=>_0x156cfb[_0x2c4343(0x15f)]),_0x1f8eb6=await this[_0x2c4343(0x144)][_0x2c4343(0x1a0)]({'where':{'id':(0x0,typeorm_1['In'])(_0x35bc7d)}});return _0x9efd1a['forEach'](_0x5e1597=>{const _0x36173b=_0x2c4343,_0x101de7=_0x1f8eb6[_0x36173b(0x1a0)](_0x3f9ea3=>_0x3f9ea3['id']===_0x5e1597['appId']);_0x101de7&&(_0x5e1597['appName']=_0x101de7['name']||'',_0x5e1597[_0x36173b(0x14d)]=_0x101de7[_0x36173b(0x16a)]||'',_0x5e1597['coverImg']=_0x101de7[_0x36173b(0x166)]||'',_0x5e1597['demoData']=_0x101de7['demoData']||'',_0x5e1597[_0x36173b(0x189)]=_0x101de7[_0x36173b(0x147)]||'',_0x5e1597['preset']=_0x101de7['userId']===_0x329784?_0x101de7[_0x36173b(0x140)]:_0x36173b(0x179));}),{'rows':_0x9efd1a,'count':_0x1ca395};}async[_0xb8f669(0x165)](_0x51434e,_0x4124bb={'page':0x1,'size':0x1e}){const _0x4ccb8b=_0xb8f669,{id:_0x15d27f}=_0x51434e[_0x4ccb8b(0x182)],{page:page=0x1,size:size=0x1e}=_0x4124bb;try{const _0x5e5d8f=await this[_0x4ccb8b(0x139)]['query']('\x0a\x20\x20\x20\x20\x20\x20\x20\x20SELECT\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20COUNT(*)\x20as\x20count\x0a\x20\x20\x20\x20\x20\x20\x20\x20FROM\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20user_apps\x20ua\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20gpts_models\x20gm\x20ON\x20ua.appId\x20=\x20gm.id\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20LEFT\x20JOIN\x20gpts_group\x20gg\x20ON\x20gm.groupId\x20=\x20gg.id\x0a\x20\x20\x20\x20\x20\x20\x20\x20WHERE\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20ua.userId\x20=\x20'+_0x15d27f+'\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20gm.id\x20IS\x20NOT\x20NULL\x20\x0a\x20\x20\x20\x20\x20\x20'),_0x3e7ed1=await this[_0x4ccb8b(0x139)][_0x4ccb8b(0x193)](_0x4ccb8b(0x18a)+_0x15d27f+'\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20AND\x20gm.id\x20IS\x20NOT\x20NULL\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20ORDER\x20BY\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20ua.createdAt\x20DESC\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20LIMIT\x20'+size+'\x20OFFSET\x20'+(page-0x1)*size+_0x4ccb8b(0x130));return{'rows':_0x3e7ed1,'count':Number(_0x5e5d8f[0x0]?.[_0x4ccb8b(0x188)]||0x0)};}catch(_0x276da4){console[_0x4ccb8b(0x195)](_0x276da4['message']);}}};AppService=__decorate([(0x0,common_1[_0xb8f669(0x15c)])(),__param(0x0,(0x0,typeorm_2[_0xb8f669(0x134)])(appCats_entity_1[_0xb8f669(0x15b)])),__param(0x1,(0x0,typeorm_2[_0xb8f669(0x134)])(app_entity_1['AppEntity'])),__param(0x2,(0x0,typeorm_2[_0xb8f669(0x134)])(gpts_model_entity_1[_0xb8f669(0x18c)])),__param(0x3,(0x0,typeorm_2[_0xb8f669(0x134)])(userApps_entity_1['UserAppsEntity'])),__metadata(_0xb8f669(0x174),[typeorm_1['Repository'],typeorm_1[_0xb8f669(0x145)],typeorm_1[_0xb8f669(0x145)],typeorm_1[_0xb8f669(0x145)],typeorm_1[_0xb8f669(0x162)]])],AppService),exports['AppService']=AppService;