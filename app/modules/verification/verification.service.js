'use strict';const _0x4b347c=_0x4793;(function(_0x75b133,_0x4c6962){const _0x365628=_0x4793,_0x4eeadd=_0x75b133();while(!![]){try{const _0x31bd74=parseInt(_0x365628(0x218))/0x1*(parseInt(_0x365628(0x20b))/0x2)+parseInt(_0x365628(0x21a))/0x3*(parseInt(_0x365628(0x21e))/0x4)+-parseInt(_0x365628(0x210))/0x5+parseInt(_0x365628(0x1f9))/0x6+-parseInt(_0x365628(0x1f0))/0x7*(parseInt(_0x365628(0x209))/0x8)+-parseInt(_0x365628(0x221))/0x9*(parseInt(_0x365628(0x205))/0xa)+parseInt(_0x365628(0x212))/0xb*(parseInt(_0x365628(0x20c))/0xc);if(_0x31bd74===_0x4c6962)break;else _0x4eeadd['push'](_0x4eeadd['shift']());}catch(_0x23ca67){_0x4eeadd['push'](_0x4eeadd['shift']());}}}(_0x1d5b,0x29b2c));var __decorate=this&&this[_0x4b347c(0x1fb)]||function(_0x3dcafa,_0x2a11a4,_0x26de05,_0xfb667e){const _0x3e889a=_0x4b347c;var _0x1b9f55=arguments['length'],_0x35a40b=_0x1b9f55<0x3?_0x2a11a4:_0xfb667e===null?_0xfb667e=Object['getOwnPropertyDescriptor'](_0x2a11a4,_0x26de05):_0xfb667e,_0x437081;if(typeof Reflect==='object'&&typeof Reflect[_0x3e889a(0x1f8)]===_0x3e889a(0x201))_0x35a40b=Reflect[_0x3e889a(0x1f8)](_0x3dcafa,_0x2a11a4,_0x26de05,_0xfb667e);else{for(var _0xbe233f=_0x3dcafa['length']-0x1;_0xbe233f>=0x0;_0xbe233f--)if(_0x437081=_0x3dcafa[_0xbe233f])_0x35a40b=(_0x1b9f55<0x3?_0x437081(_0x35a40b):_0x1b9f55>0x3?_0x437081(_0x2a11a4,_0x26de05,_0x35a40b):_0x437081(_0x2a11a4,_0x26de05))||_0x35a40b;}return _0x1b9f55>0x3&&_0x35a40b&&Object[_0x3e889a(0x208)](_0x2a11a4,_0x26de05,_0x35a40b),_0x35a40b;},__metadata=this&&this[_0x4b347c(0x229)]||function(_0x33fd4c,_0x5b63c2){const _0x316a92=_0x4b347c;if(typeof Reflect===_0x316a92(0x1ec)&&typeof Reflect[_0x316a92(0x1eb)]==='function')return Reflect['metadata'](_0x33fd4c,_0x5b63c2);},__param=this&&this[_0x4b347c(0x1f2)]||function(_0x3b9998,_0x2728ec){return function(_0x487146,_0x45f5ab){_0x2728ec(_0x487146,_0x45f5ab,_0x3b9998);};};function _0x4793(_0x43b701,_0x458680){const _0x1d5b3d=_0x1d5b();return _0x4793=function(_0x4793a1,_0x31ef6c){_0x4793a1=_0x4793a1-0x1e9;let _0x37db6c=_0x1d5b3d[_0x4793a1];return _0x37db6c;},_0x4793(_0x43b701,_0x458680);}Object[_0x4b347c(0x208)](exports,'__esModule',{'value':!![]}),exports[_0x4b347c(0x223)]=void 0x0;const globalConfig_service_1=require(_0x4b347c(0x1f7)),status_constant_1=require(_0x4b347c(0x206)),typeorm_1=require('@nestjs/typeorm'),typeorm_2=require(_0x4b347c(0x200)),verifycation_entity_1=require(_0x4b347c(0x224)),common_1=require('@nestjs/common'),utils_1=require(_0x4b347c(0x220)),redisCache_service_1=require(_0x4b347c(0x21d)),Core=require(_0x4b347c(0x203));let VerificationService=class VerificationService{constructor(_0x549ff2,_0x123bea,_0x4307bd){const _0x1abdb7=_0x4b347c;this[_0x1abdb7(0x222)]=_0x549ff2,this[_0x1abdb7(0x1f1)]=_0x123bea,this[_0x1abdb7(0x1f3)]=_0x4307bd;}async[_0x4b347c(0x20f)](_0xd3e1b4,_0x173957,_0x3a9d1d=0x1e*0x3c){const _0x57b095=_0x4b347c,_0x5053a3=await this[_0x57b095(0x222)][_0x57b095(0x217)]({'where':{'userId':_0xd3e1b4['id'],'type':_0x173957},'order':{'createdAt':_0x57b095(0x211)}});if(_0x5053a3&&_0x5053a3[_0x57b095(0x202)][_0x57b095(0x1ea)]()+0x1*0x3c*0x3e8>Date[_0x57b095(0x213)]()){const _0xceb148=Math['ceil']((_0x5053a3[_0x57b095(0x202)][_0x57b095(0x1ea)]()+0x1*0x3c*0x3e8-Date['now']())/0x3e8);throw new common_1[(_0x57b095(0x1f4))](_0xceb148+'S内不得重新发送',common_1['HttpStatus'][_0x57b095(0x225)]);}const _0x3f62fb=(0x0,utils_1[_0x57b095(0x216)])(),_0x134fde=new Date(Date[_0x57b095(0x213)]()+_0x3a9d1d*0x3e8),{id:_0x3207bc,email:_0x3cfcf6}=_0xd3e1b4,_0x1b5d9b={'userId':_0x3207bc,'type':_0x173957,'code':_0x3f62fb,'expiresAt':_0x134fde,'email':_0x3cfcf6};return await this[_0x57b095(0x222)][_0x57b095(0x215)](_0x1b5d9b);}async['verifyCode']({code:_0x38af66,id:_0x2c3685},_0x558d32){const _0x4c1ec5=_0x4b347c,_0x5ea0ff=await this['verifycationEntity'][_0x4c1ec5(0x217)]({'where':{'id':_0x2c3685,'type':_0x558d32},'order':{'createdAt':_0x4c1ec5(0x211)}});if(!_0x5ea0ff)throw new common_1['HttpException'](_0x4c1ec5(0x21b),common_1['HttpStatus'][_0x4c1ec5(0x225)]);if(_0x5ea0ff[_0x4c1ec5(0x1fe)]===status_constant_1[_0x4c1ec5(0x1ee)][_0x4c1ec5(0x207)])throw new common_1[(_0x4c1ec5(0x1f4))](_0x4c1ec5(0x1f5),common_1['HttpStatus']['BAD_REQUEST']);else _0x5ea0ff['used']=status_constant_1[_0x4c1ec5(0x1ee)][_0x4c1ec5(0x207)],await this[_0x4c1ec5(0x222)]['update']({'id':_0x2c3685},_0x5ea0ff);if(Number(_0x5ea0ff['code'])!==Number(_0x38af66))throw new common_1[(_0x4c1ec5(0x1f4))](_0x4c1ec5(0x20d),common_1['HttpStatus'][_0x4c1ec5(0x225)]);if(_0x5ea0ff['expiresAt']<new Date())throw new common_1[(_0x4c1ec5(0x1f4))](_0x4c1ec5(0x20a),common_1[_0x4c1ec5(0x214)][_0x4c1ec5(0x225)]);return _0x5ea0ff;}async[_0x4b347c(0x1f6)](_0x1e08ed){const _0x57f3d4=_0x4b347c,{captchaId:_0x17ef56,captchaCode:_0x35d2c1}=_0x1e08ed,_0x21b31a=await this[_0x57f3d4(0x1f1)]['getNamespace'](),_0x58e35a=_0x21b31a+_0x57f3d4(0x21c)+_0x17ef56,_0x4c06ce=await this[_0x57f3d4(0x1f3)][_0x57f3d4(0x1fc)]({'key':_0x58e35a});await this[_0x57f3d4(0x1f3)][_0x57f3d4(0x1ed)]({'key':_0x58e35a});if(!_0x4c06ce)throw new common_1[(_0x57f3d4(0x1f4))](_0x57f3d4(0x1ff),common_1[_0x57f3d4(0x214)][_0x57f3d4(0x225)]);if(!_0x4c06ce||_0x4c06ce!==_0x35d2c1)throw new common_1[(_0x57f3d4(0x1f4))](_0x57f3d4(0x227),common_1[_0x57f3d4(0x214)][_0x57f3d4(0x225)]);}async[_0x4b347c(0x21f)](_0x8f5984){const _0x2b8e4e=_0x4b347c,{accessKeyId:_0x51c001,accessKeySecret:_0xbb034c,SignName:_0xdc3a5b,TemplateCode:_0x44fd4e}=await this['globalConfigService']['getPhoneVerifyConfig'](),{phone:_0x453094,code:_0xd7ba97}=_0x8f5984;if(!_0x453094||!_0xd7ba97)throw new common_1['HttpException'](_0x2b8e4e(0x1ef),common_1[_0x2b8e4e(0x214)][_0x2b8e4e(0x225)]);const _0x2f6420=new Core({'accessKeyId':_0x51c001,'accessKeySecret':_0xbb034c,'endpoint':'https://dysmsapi.aliyuncs.com','apiVersion':_0x2b8e4e(0x1fd)}),_0x3589a9={'PhoneNumbers':_0x453094,'SignName':_0xdc3a5b,'TemplateCode':_0x44fd4e,'TemplateParam':JSON[_0x2b8e4e(0x219)]({'code':_0xd7ba97})},_0x122770={'method':_0x2b8e4e(0x228),'formatParams':![]};try{const _0x273edc=await _0x2f6420[_0x2b8e4e(0x204)](_0x2b8e4e(0x1e9),_0x3589a9,_0x122770);if(_0x273edc['Code']==='OK')return!![];else throw new common_1[(_0x2b8e4e(0x1f4))](_0x273edc['Message']||'验证码发送失败！',common_1['HttpStatus'][_0x2b8e4e(0x225)]);}catch(_0x1c8058){throw new common_1[(_0x2b8e4e(0x1f4))](_0x1c8058?.['data']?.[_0x2b8e4e(0x20e)]||'验证码发送失败！',common_1[_0x2b8e4e(0x214)]['BAD_REQUEST']);}}};VerificationService=__decorate([(0x0,common_1['Injectable'])(),__param(0x0,(0x0,typeorm_1[_0x4b347c(0x226)])(verifycation_entity_1['VerifycationEntity'])),__metadata(_0x4b347c(0x1fa),[typeorm_2['Repository'],globalConfig_service_1['GlobalConfigService'],redisCache_service_1['RedisCacheService']])],VerificationService),exports[_0x4b347c(0x223)]=VerificationService;function _0x1d5b(){const _0x219b4d=['metadata','object','del','VerificationUseStatusEnum','确实必要参数错误！','7RFdwHB','globalConfigService','__param','redisCacheService','HttpException','当前验证码已被使用！','verifyCaptcha','../globalConfig/globalConfig.service','decorate','285948MhpJRX','design:paramtypes','__decorate','get','2017-05-25','used','图形验证码已过期、请重新输入!','typeorm','function','createdAt','@alicloud/pop-core','request','40950HZlwYH','../../common/constants/status.constant','USED','defineProperty','2186936EYMXCh','验证码已过期','64skgdDb','4308MfXpmn','验证码错误','Message','createVerification','388470ULCSyD','DESC','2222GRPGKU','now','HttpStatus','save','createRandomCode','findOne','7741MozvTX','stringify','72tppzau','验证码不存在',':CAPTCHA:','../redisCache/redisCache.service','26344uGzOtV','sendPhoneCode','../../common/utils','9ajKzZN','verifycationEntity','VerificationService','./verifycation.entity','BAD_REQUEST','InjectRepository','图形验证码错误、请检查填写!','POST','__metadata','SendSms','getTime'];_0x1d5b=function(){return _0x219b4d;};return _0x1d5b();}