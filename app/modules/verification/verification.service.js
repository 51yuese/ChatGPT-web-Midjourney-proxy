'use strict';const _0x462af7=_0x45d9;(function(_0x4d44d5,_0x427c8e){const _0x213e45=_0x45d9,_0x435ddd=_0x4d44d5();while(!![]){try{const _0x1fbb58=-parseInt(_0x213e45(0x130))/0x1*(parseInt(_0x213e45(0x126))/0x2)+-parseInt(_0x213e45(0x123))/0x3+parseInt(_0x213e45(0x135))/0x4*(-parseInt(_0x213e45(0x120))/0x5)+-parseInt(_0x213e45(0x144))/0x6+-parseInt(_0x213e45(0x137))/0x7+-parseInt(_0x213e45(0x128))/0x8+parseInt(_0x213e45(0x11b))/0x9;if(_0x1fbb58===_0x427c8e)break;else _0x435ddd['push'](_0x435ddd['shift']());}catch(_0x1b7a4f){_0x435ddd['push'](_0x435ddd['shift']());}}}(_0x48cd,0x6c103));var __decorate=this&&this[_0x462af7(0x141)]||function(_0x51cf23,_0x42b765,_0x53e298,_0x370422){const _0x1c1b10=_0x462af7;var _0x31686e=arguments['length'],_0x5b962a=_0x31686e<0x3?_0x42b765:_0x370422===null?_0x370422=Object[_0x1c1b10(0x114)](_0x42b765,_0x53e298):_0x370422,_0x480501;if(typeof Reflect===_0x1c1b10(0x116)&&typeof Reflect[_0x1c1b10(0x132)]===_0x1c1b10(0x14e))_0x5b962a=Reflect[_0x1c1b10(0x132)](_0x51cf23,_0x42b765,_0x53e298,_0x370422);else{for(var _0x3444ed=_0x51cf23[_0x1c1b10(0x14c)]-0x1;_0x3444ed>=0x0;_0x3444ed--)if(_0x480501=_0x51cf23[_0x3444ed])_0x5b962a=(_0x31686e<0x3?_0x480501(_0x5b962a):_0x31686e>0x3?_0x480501(_0x42b765,_0x53e298,_0x5b962a):_0x480501(_0x42b765,_0x53e298))||_0x5b962a;}return _0x31686e>0x3&&_0x5b962a&&Object[_0x1c1b10(0x13f)](_0x42b765,_0x53e298,_0x5b962a),_0x5b962a;},__metadata=this&&this['__metadata']||function(_0x177317,_0x3c4b86){const _0x3b5944=_0x462af7;if(typeof Reflect==='object'&&typeof Reflect[_0x3b5944(0x12f)]===_0x3b5944(0x14e))return Reflect[_0x3b5944(0x12f)](_0x177317,_0x3c4b86);},__param=this&&this[_0x462af7(0x12b)]||function(_0x8bf19d,_0x18a7bd){return function(_0x9e7f9e,_0x4f5901){_0x18a7bd(_0x9e7f9e,_0x4f5901,_0x8bf19d);};};function _0x48cd(){const _0x319b6a=['../redisCache/redisCache.service','globalConfigService','S内不得重新发送','验证码已过期','Message','USED','确实必要参数错误！','DESC','../../common/utils','getOwnPropertyDescriptor','stringify','object','data','getTime','Repository','InjectRepository','27544869mkTLmg','验证码不存在','../../common/constants/status.constant','Code','verifycationEntity','40eLMlwR','now','redisCacheService','702930fJdCnH','VerificationUseStatusEnum','getNamespace','1022fQKhFF','getPhoneVerifyConfig','2912584loDquk','sendPhoneCode','HttpException','__param','https://dysmsapi.aliyuncs.com','design:paramtypes','GlobalConfigService','metadata','1101QEHyMl','SendSms','decorate','createRandomCode','typeorm','177184mpiiag','VerificationService','4029081zEFNMY','BAD_REQUEST','HttpStatus','./verifycation.entity','VerifycationEntity','createdAt','POST','图形验证码错误、请检查填写!','defineProperty','验证码发送失败！','__decorate','used','Injectable','3161814dBaEWa','findOne','2017-05-25','expiresAt','@nestjs/typeorm','图形验证码已过期、请重新输入!','request','verifyCode','length','update','function'];_0x48cd=function(){return _0x319b6a;};return _0x48cd();}Object[_0x462af7(0x13f)](exports,'__esModule',{'value':!![]}),exports[_0x462af7(0x136)]=void 0x0;const globalConfig_service_1=require('../globalConfig/globalConfig.service'),status_constant_1=require(_0x462af7(0x11d)),typeorm_1=require(_0x462af7(0x148)),typeorm_2=require(_0x462af7(0x134)),verifycation_entity_1=require(_0x462af7(0x13a)),common_1=require('@nestjs/common'),utils_1=require(_0x462af7(0x113)),redisCache_service_1=require(_0x462af7(0x14f)),Core=require('@alicloud/pop-core');function _0x45d9(_0x432d5d,_0xbdf3d7){const _0x48cdc0=_0x48cd();return _0x45d9=function(_0x45d96a,_0x36e068){_0x45d96a=_0x45d96a-0x10f;let _0x285229=_0x48cdc0[_0x45d96a];return _0x285229;},_0x45d9(_0x432d5d,_0xbdf3d7);}let VerificationService=class VerificationService{constructor(_0x4cd21d,_0x2e9c85,_0x121d99){const _0x2f869f=_0x462af7;this[_0x2f869f(0x11f)]=_0x4cd21d,this[_0x2f869f(0x150)]=_0x2e9c85,this['redisCacheService']=_0x121d99;}async['createVerification'](_0x5e9f89,_0xdf08e8,_0x32de0f=0x1e*0x3c){const _0x1f8c1e=_0x462af7,_0x5ec06b=await this['verifycationEntity'][_0x1f8c1e(0x145)]({'where':{'userId':_0x5e9f89['id'],'type':_0xdf08e8},'order':{'createdAt':'DESC'}});if(_0x5ec06b&&_0x5ec06b[_0x1f8c1e(0x13c)]['getTime']()+0x1*0x3c*0x3e8>Date[_0x1f8c1e(0x121)]()){const _0x2b0bf6=Math['ceil']((_0x5ec06b['createdAt'][_0x1f8c1e(0x118)]()+0x1*0x3c*0x3e8-Date[_0x1f8c1e(0x121)]())/0x3e8);throw new common_1[(_0x1f8c1e(0x12a))](_0x2b0bf6+_0x1f8c1e(0x151),common_1['HttpStatus']['BAD_REQUEST']);}const _0x299b07=(0x0,utils_1[_0x1f8c1e(0x133)])(),_0x6853c2=new Date(Date['now']()+_0x32de0f*0x3e8),{id:_0x455801,email:_0x48cafd}=_0x5e9f89,_0x5f1a06={'userId':_0x455801,'type':_0xdf08e8,'code':_0x299b07,'expiresAt':_0x6853c2,'email':_0x48cafd};return await this[_0x1f8c1e(0x11f)]['save'](_0x5f1a06);}async[_0x462af7(0x14b)]({code:_0x273081,id:_0x2a35c2},_0x53ada3){const _0x4c8783=_0x462af7,_0x3efec9=await this[_0x4c8783(0x11f)][_0x4c8783(0x145)]({'where':{'id':_0x2a35c2,'type':_0x53ada3},'order':{'createdAt':_0x4c8783(0x112)}});if(!_0x3efec9)throw new common_1['HttpException'](_0x4c8783(0x11c),common_1[_0x4c8783(0x139)][_0x4c8783(0x138)]);if(_0x3efec9[_0x4c8783(0x142)]===status_constant_1[_0x4c8783(0x124)][_0x4c8783(0x110)])throw new common_1[(_0x4c8783(0x12a))]('当前验证码已被使用！',common_1['HttpStatus']['BAD_REQUEST']);else _0x3efec9['used']=status_constant_1[_0x4c8783(0x124)]['USED'],await this['verifycationEntity'][_0x4c8783(0x14d)]({'id':_0x2a35c2},_0x3efec9);if(Number(_0x3efec9['code'])!==Number(_0x273081))throw new common_1[(_0x4c8783(0x12a))]('验证码错误',common_1[_0x4c8783(0x139)][_0x4c8783(0x138)]);if(_0x3efec9[_0x4c8783(0x147)]<new Date())throw new common_1[(_0x4c8783(0x12a))](_0x4c8783(0x152),common_1['HttpStatus'][_0x4c8783(0x138)]);return _0x3efec9;}async['verifyCaptcha'](_0xcd717c){const _0x49c850=_0x462af7,{captchaId:_0x327984,captchaCode:_0x363323}=_0xcd717c,_0x5b3f3a=await this['globalConfigService'][_0x49c850(0x125)](),_0x3c136e=_0x5b3f3a+':CAPTCHA:'+_0x327984,_0x131592=await this[_0x49c850(0x122)]['get']({'key':_0x3c136e});await this[_0x49c850(0x122)]['del']({'key':_0x3c136e});if(!_0x131592)throw new common_1['HttpException'](_0x49c850(0x149),common_1[_0x49c850(0x139)][_0x49c850(0x138)]);if(!_0x131592||_0x131592!==_0x363323)throw new common_1[(_0x49c850(0x12a))](_0x49c850(0x13e),common_1[_0x49c850(0x139)][_0x49c850(0x138)]);}async[_0x462af7(0x129)](_0x4a4fcf){const _0x45dde3=_0x462af7,{accessKeyId:_0x31ccd6,accessKeySecret:_0x474a92,SignName:_0x839745,TemplateCode:_0x34d469}=await this['globalConfigService'][_0x45dde3(0x127)](),{phone:_0x290814,code:_0x13e3a2}=_0x4a4fcf;if(!_0x290814||!_0x13e3a2)throw new common_1[(_0x45dde3(0x12a))](_0x45dde3(0x111),common_1['HttpStatus'][_0x45dde3(0x138)]);const _0x9c226e=new Core({'accessKeyId':_0x31ccd6,'accessKeySecret':_0x474a92,'endpoint':_0x45dde3(0x12c),'apiVersion':_0x45dde3(0x146)}),_0xa51cdb={'PhoneNumbers':_0x290814,'SignName':_0x839745,'TemplateCode':_0x34d469,'TemplateParam':JSON[_0x45dde3(0x115)]({'code':_0x13e3a2})},_0x202957={'method':_0x45dde3(0x13d),'formatParams':![]};try{const _0x38fc92=await _0x9c226e[_0x45dde3(0x14a)](_0x45dde3(0x131),_0xa51cdb,_0x202957);if(_0x38fc92[_0x45dde3(0x11e)]==='OK')return!![];else throw new common_1[(_0x45dde3(0x12a))](_0x38fc92['Message']||_0x45dde3(0x140),common_1['HttpStatus'][_0x45dde3(0x138)]);}catch(_0x24f437){throw new common_1[(_0x45dde3(0x12a))](_0x24f437?.[_0x45dde3(0x117)]?.[_0x45dde3(0x10f)]||_0x45dde3(0x140),common_1[_0x45dde3(0x139)][_0x45dde3(0x138)]);}}};VerificationService=__decorate([(0x0,common_1[_0x462af7(0x143)])(),__param(0x0,(0x0,typeorm_1[_0x462af7(0x11a)])(verifycation_entity_1[_0x462af7(0x13b)])),__metadata(_0x462af7(0x12d),[typeorm_2[_0x462af7(0x119)],globalConfig_service_1[_0x462af7(0x12e)],redisCache_service_1['RedisCacheService']])],VerificationService),exports['VerificationService']=VerificationService;