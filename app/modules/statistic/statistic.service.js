'use strict';const _0x5891a9=_0x3a07;function _0x3a07(_0x39200b,_0x34cb48){const _0xb06038=_0xb060();return _0x3a07=function(_0x3a077a,_0x56534e){_0x3a077a=_0x3a077a-0x1bc;let _0xde720e=_0xb06038[_0x3a077a];return _0xde720e;},_0x3a07(_0x39200b,_0x34cb48);}(function(_0x12f42e,_0xc8b417){const _0x3ffac5=_0x3a07,_0x22b95b=_0x12f42e();while(!![]){try{const _0x18c549=-parseInt(_0x3ffac5(0x1f9))/0x1+-parseInt(_0x3ffac5(0x20b))/0x2*(-parseInt(_0x3ffac5(0x205))/0x3)+-parseInt(_0x3ffac5(0x21b))/0x4*(-parseInt(_0x3ffac5(0x233))/0x5)+parseInt(_0x3ffac5(0x1d9))/0x6*(parseInt(_0x3ffac5(0x1bc))/0x7)+-parseInt(_0x3ffac5(0x1e8))/0x8+-parseInt(_0x3ffac5(0x1fe))/0x9*(parseInt(_0x3ffac5(0x1c3))/0xa)+parseInt(_0x3ffac5(0x1ce))/0xb*(-parseInt(_0x3ffac5(0x1e1))/0xc);if(_0x18c549===_0xc8b417)break;else _0x22b95b['push'](_0x22b95b['shift']());}catch(_0x211960){_0x22b95b['push'](_0x22b95b['shift']());}}}(_0xb060,0x8b7b3));var __decorate=this&&this[_0x5891a9(0x21d)]||function(_0x1c6433,_0x5c0491,_0x3269cf,_0xa58f64){const _0x1205fa=_0x5891a9;var _0x4094cd=arguments[_0x1205fa(0x23a)],_0x54fc52=_0x4094cd<0x3?_0x5c0491:_0xa58f64===null?_0xa58f64=Object[_0x1205fa(0x1eb)](_0x5c0491,_0x3269cf):_0xa58f64,_0x51fd04;if(typeof Reflect===_0x1205fa(0x1d4)&&typeof Reflect['decorate']==='function')_0x54fc52=Reflect[_0x1205fa(0x20f)](_0x1c6433,_0x5c0491,_0x3269cf,_0xa58f64);else{for(var _0x586555=_0x1c6433[_0x1205fa(0x23a)]-0x1;_0x586555>=0x0;_0x586555--)if(_0x51fd04=_0x1c6433[_0x586555])_0x54fc52=(_0x4094cd<0x3?_0x51fd04(_0x54fc52):_0x4094cd>0x3?_0x51fd04(_0x5c0491,_0x3269cf,_0x54fc52):_0x51fd04(_0x5c0491,_0x3269cf))||_0x54fc52;}return _0x4094cd>0x3&&_0x54fc52&&Object['defineProperty'](_0x5c0491,_0x3269cf,_0x54fc52),_0x54fc52;},__metadata=this&&this[_0x5891a9(0x1d8)]||function(_0x346516,_0x2ebf10){const _0x1d9f0c=_0x5891a9;if(typeof Reflect===_0x1d9f0c(0x1d4)&&typeof Reflect[_0x1d9f0c(0x221)]===_0x1d9f0c(0x1f2))return Reflect[_0x1d9f0c(0x221)](_0x346516,_0x2ebf10);},__param=this&&this[_0x5891a9(0x204)]||function(_0x75e8d8,_0xdc8b9c){return function(_0x689ab,_0x47edef){_0xdc8b9c(_0x689ab,_0x47edef,_0x75e8d8);};};Object[_0x5891a9(0x208)](exports,_0x5891a9(0x21e),{'value':!![]}),exports['StatisticService']=void 0x0;const common_1=require(_0x5891a9(0x1d7)),typeorm_1=require(_0x5891a9(0x209)),user_entity_1=require('../user/user.entity'),typeorm_2=require(_0x5891a9(0x21c)),chatLog_entity_1=require(_0x5891a9(0x1c9)),balance_constant_1=require(_0x5891a9(0x1c6)),date_1=require(_0x5891a9(0x1bd)),axios_1=require(_0x5891a9(0x234)),config_entity_1=require(_0x5891a9(0x1d3)),order_entity_1=require(_0x5891a9(0x1ff)),midjourney_entity_1=require('../midjourney/midjourney.entity'),midjourney_constant_1=require(_0x5891a9(0x202));let StatisticService=class StatisticService{constructor(_0x547b6e,_0x4a5893,_0x482679,_0x391c36,_0x2e2839){const _0x59c11b=_0x5891a9;this[_0x59c11b(0x22e)]=_0x547b6e,this[_0x59c11b(0x1cc)]=_0x4a5893,this[_0x59c11b(0x1f0)]=_0x482679,this['orderEntity']=_0x391c36,this[_0x59c11b(0x236)]=_0x2e2839;}async['getBaseStatistic'](){const _0x4294c1=_0x5891a9,_0x5d9144=await this['countUsers'](),_0x1ed7cd=await this[_0x4294c1(0x22b)](),_0x27103f=await this[_0x4294c1(0x1ef)](),_0x18b34a=await this['countNewChatsToday'](),_0x2f3bbf=await this[_0x4294c1(0x213)](),_0x283208=await this[_0x4294c1(0x1da)](),_0x521095=await this[_0x4294c1(0x1e3)](),_0x28cae2=await this[_0x4294c1(0x1c2)](),_0x2fb747=await this[_0x4294c1(0x229)]();return{'userCount':_0x5d9144,'newUserCount':_0x1ed7cd,'chatCount':_0x27103f,'newChatCount':_0x18b34a,'drawCount':_0x2f3bbf,'newDrawCount':_0x521095+_0x283208,'orderCount':_0x28cae2,'newOrderCount':_0x2fb747};}async[_0x5891a9(0x1e4)]({days:days=0x7}){const _0x5cf8e8=_0x5891a9,_0x5da81a=await this['countChatsByTimeRange'](days),_0x220237=await this['countDrawsByTimeRange'](days),_0x172e49=await this[_0x5cf8e8(0x22a)](days);return{'date':_0x5da81a[_0x5cf8e8(0x210)](_0x14e8c6=>_0x14e8c6[_0x5cf8e8(0x1bf)]),'chat':_0x5da81a[_0x5cf8e8(0x210)](_0x4ca206=>_0x4ca206[_0x5cf8e8(0x1ed)]),'draw':_0x220237[_0x5cf8e8(0x210)]((_0x49bf3e,_0x3a2417)=>{const _0x10e652=_0x5cf8e8;return _0x49bf3e['value']+_0x172e49[_0x3a2417][_0x10e652(0x1ed)];})};}async[_0x5891a9(0x1fb)]({days:days=0x7}){const _0x31d641=await this['getBaiduStatistics'](days);return _0x31d641;}async[_0x5891a9(0x219)](){const _0x55aace=_0x5891a9,_0x33ef6b=await this[_0x55aace(0x22e)]['count']();return _0x33ef6b;}async[_0x5891a9(0x22b)](){const _0x2a7743=_0x5891a9,_0x39b224=new Date();_0x39b224[_0x2a7743(0x1de)](0x0,0x0,0x0,0x0);const _0x2efcef=new Date(_0x39b224[_0x2a7743(0x21a)]()+0x18*0x3c*0x3c*0x3e8),_0x5c5b50=this[_0x2a7743(0x22e)][_0x2a7743(0x21f)](_0x2a7743(0x1c0)),_0x1ce5ab=await _0x5c5b50[_0x2a7743(0x1e2)](_0x2a7743(0x1cb),{'today':_0x39b224})[_0x2a7743(0x231)]('user.createdAt\x20<\x20:tomorrow',{'tomorrow':_0x2efcef})[_0x2a7743(0x224)]();return _0x1ce5ab;}async['countChats'](){const _0x167816=_0x5891a9,_0x4c9af1=await this['chatLogEntity'][_0x167816(0x223)]({'where':{'type':balance_constant_1[_0x167816(0x1f1)]['CHAT_TYPE']}});return _0x4c9af1;}async[_0x5891a9(0x235)](){const _0x452202=_0x5891a9,_0x46e910=new Date();_0x46e910[_0x452202(0x1de)](0x0,0x0,0x0,0x0);const _0x1095e8=new Date(_0x46e910[_0x452202(0x21a)]()+0x18*0x3c*0x3c*0x3e8),_0x497cc3=this[_0x452202(0x1cc)]['createQueryBuilder'](_0x452202(0x1e0)),_0x12577d=await _0x497cc3[_0x452202(0x1e2)](_0x452202(0x1c1),{'type':balance_constant_1['DeductionKey'][_0x452202(0x1d1)]})[_0x452202(0x231)](_0x452202(0x225),{'today':_0x46e910})['andWhere']('chatLog.createdAt\x20<\x20:tomorrow',{'tomorrow':_0x1095e8})['getCount']();return _0x12577d;}async[_0x5891a9(0x213)](){const _0x520905=_0x5891a9,_0x12a0ea=await this[_0x520905(0x1cc)][_0x520905(0x223)]({'where':{'type':balance_constant_1[_0x520905(0x1f1)]['PAINT_TYPE']}});return _0x12a0ea;}async['countNewDrawsToday'](){const _0x5c8bb2=_0x5891a9,_0x372482=new Date();_0x372482[_0x5c8bb2(0x1de)](0x0,0x0,0x0,0x0);const _0x576d08=new Date(_0x372482['getTime']()+0x18*0x3c*0x3c*0x3e8),_0x5784ee=this[_0x5c8bb2(0x1cc)][_0x5c8bb2(0x21f)](_0x5c8bb2(0x1e0)),_0x431a3b=await _0x5784ee[_0x5c8bb2(0x1e2)](_0x5c8bb2(0x1c1),{'type':balance_constant_1[_0x5c8bb2(0x1f1)]['PAINT_TYPE']})['andWhere'](_0x5c8bb2(0x225),{'today':_0x372482})['andWhere'](_0x5c8bb2(0x220),{'tomorrow':_0x576d08})[_0x5c8bb2(0x224)]();return _0x431a3b;}async[_0x5891a9(0x1e3)](){const _0x357b12=_0x5891a9,_0x33dfa4=new Date();_0x33dfa4['setHours'](0x0,0x0,0x0,0x0);const _0x1cd9b5=new Date(_0x33dfa4[_0x357b12(0x21a)]()+0x18*0x3c*0x3c*0x3e8),_0x352b77=this[_0x357b12(0x236)][_0x357b12(0x21f)](_0x357b12(0x1f8)),_0x5b053a=await _0x352b77[_0x357b12(0x1e2)](_0x357b12(0x1f3),{'today':_0x33dfa4})['andWhere'](_0x357b12(0x1be),{'tomorrow':_0x1cd9b5})[_0x357b12(0x224)]();return _0x5b053a;}async[_0x5891a9(0x22d)](_0x53877b){const _0xe710f8=_0x5891a9;var _0x360ec4,_0x2c79ce;const _0x596893=new Date();_0x596893[_0xe710f8(0x1de)](0x0,0x0,0x0,0x0);const _0x1e7a5c=new Date(_0x596893[_0xe710f8(0x21a)]()-(_0x53877b-0x1)*0x18*0x3c*0x3c*0x3e8),_0x4f646e=this[_0xe710f8(0x1cc)]['createQueryBuilder'](_0xe710f8(0x200)),_0x1d0acf=await _0x4f646e[_0xe710f8(0x1f4)](_0xe710f8(0x20d))[_0xe710f8(0x1e2)]('chatlog.type\x20=\x20:type',{'type':balance_constant_1['DeductionKey'][_0xe710f8(0x1d1)]})['andWhere'](_0xe710f8(0x203),{'startDate':_0x1e7a5c})[_0xe710f8(0x22c)](_0xe710f8(0x1bf))[_0xe710f8(0x1fc)](_0xe710f8(0x1bf))[_0xe710f8(0x1f7)](),_0x485582=[],_0x34da98=_0x1e7a5c;for(let _0x243c73=0x0;_0x243c73<_0x53877b;_0x243c73++){const _0x242147=(0x0,date_1[_0xe710f8(0x230)])(new Date(_0x34da98),_0xe710f8(0x237)),_0xe3f3b9=(_0x2c79ce=(_0x360ec4=_0x1d0acf[_0xe710f8(0x222)](_0x543e8a=>(0x0,date_1['formatDate'])(new Date(_0x543e8a[_0xe710f8(0x1bf)]),'M.DD')===_0x242147))===null||_0x360ec4===void 0x0?void 0x0:_0x360ec4[_0xe710f8(0x223)])!==null&&_0x2c79ce!==void 0x0?_0x2c79ce:0x0;_0xe3f3b9>0x0?_0x485582['push']({'date':_0x242147,'value':Number(_0xe3f3b9)}):_0x485582[_0xe710f8(0x20a)]({'date':_0x242147,'value':0x0}),_0x34da98[_0xe710f8(0x207)](_0x34da98[_0xe710f8(0x1c7)]()+0x1);}return _0x485582;}async[_0x5891a9(0x1fd)](_0x1a4e98){const _0x54a5b2=_0x5891a9;var _0x4ef102,_0x57c633;const _0x49ed23=new Date();_0x49ed23[_0x54a5b2(0x1de)](0x0,0x0,0x0,0x0);const _0xe3c856=new Date(_0x49ed23['getTime']()-(_0x1a4e98-0x1)*0x18*0x3c*0x3c*0x3e8),_0x2226e2=this[_0x54a5b2(0x1cc)][_0x54a5b2(0x21f)]('chatlog'),_0x240cde=await _0x2226e2[_0x54a5b2(0x1f4)](_0x54a5b2(0x20d))['where'](_0x54a5b2(0x215),{'type':balance_constant_1[_0x54a5b2(0x1f1)][_0x54a5b2(0x1df)]})[_0x54a5b2(0x231)](_0x54a5b2(0x203),{'startDate':_0xe3c856})[_0x54a5b2(0x22c)]('date')['orderBy'](_0x54a5b2(0x1bf))['getRawMany'](),_0x5690d6=[],_0x16204e=_0xe3c856;for(let _0x374550=0x0;_0x374550<_0x1a4e98;_0x374550++){const _0x4d900b=(0x0,date_1[_0x54a5b2(0x230)])(new Date(_0x16204e),_0x54a5b2(0x237)),_0x4ed7ee=(_0x57c633=(_0x4ef102=_0x240cde['find'](_0xabe9c5=>(0x0,date_1[_0x54a5b2(0x230)])(new Date(_0xabe9c5[_0x54a5b2(0x1bf)]),_0x54a5b2(0x237))===_0x4d900b))===null||_0x4ef102===void 0x0?void 0x0:_0x4ef102[_0x54a5b2(0x223)])!==null&&_0x57c633!==void 0x0?_0x57c633:0x0;_0x4ed7ee>0x0?_0x5690d6['push']({'date':_0x4d900b,'value':Number(_0x4ed7ee)}):_0x5690d6['push']({'date':_0x4d900b,'value':0x0}),_0x16204e[_0x54a5b2(0x207)](_0x16204e[_0x54a5b2(0x1c7)]()+0x1);}return _0x5690d6;}async[_0x5891a9(0x22a)](_0x5caa87){const _0x47c123=_0x5891a9;var _0x2c8de1,_0x1c0553;const _0x1b8ed5=new Date();_0x1b8ed5[_0x47c123(0x1de)](0x0,0x0,0x0,0x0);const _0x49a4a7=new Date(_0x1b8ed5['getTime']()-(_0x5caa87-0x1)*0x18*0x3c*0x3c*0x3e8),_0x3a0ec9=this[_0x47c123(0x236)][_0x47c123(0x21f)](_0x47c123(0x1f8)),_0x132976=await _0x3a0ec9[_0x47c123(0x1f4)](_0x47c123(0x1ec))[_0x47c123(0x1e2)](_0x47c123(0x1cd),{'status':midjourney_constant_1[_0x47c123(0x1e5)][_0x47c123(0x212)]})['andWhere'](_0x47c123(0x1f5),{'startDate':_0x49a4a7})[_0x47c123(0x22c)]('date')[_0x47c123(0x1fc)]('date')[_0x47c123(0x1f7)](),_0x4b8b65=[],_0x2d1925=_0x49a4a7;for(let _0x62798=0x0;_0x62798<_0x5caa87;_0x62798++){const _0x555ac2=(0x0,date_1[_0x47c123(0x230)])(new Date(_0x2d1925),_0x47c123(0x237)),_0x3bb0f0=(_0x1c0553=(_0x2c8de1=_0x132976[_0x47c123(0x222)](_0x356353=>(0x0,date_1[_0x47c123(0x230)])(new Date(_0x356353[_0x47c123(0x1bf)]),_0x47c123(0x237))===_0x555ac2))===null||_0x2c8de1===void 0x0?void 0x0:_0x2c8de1[_0x47c123(0x223)])!==null&&_0x1c0553!==void 0x0?_0x1c0553:0x0;_0x3bb0f0>0x0?_0x4b8b65[_0x47c123(0x20a)]({'date':_0x555ac2,'value':Number(_0x3bb0f0)}):_0x4b8b65['push']({'date':_0x555ac2,'value':0x0}),_0x2d1925[_0x47c123(0x207)](_0x2d1925[_0x47c123(0x1c7)]()+0x1);}return _0x4b8b65;}async[_0x5891a9(0x22f)](_0x5ccd13){const _0x155b16=_0x5891a9;var _0x43db21,_0x2b3952;const _0x46123f=(0x0,date_1[_0x155b16(0x230)])(new Date(),_0x155b16(0x1d5)),_0x5671e6=(0x0,date_1[_0x155b16(0x230)])(new Date(Date[_0x155b16(0x1e9)]()-Number(_0x5ccd13-0x1)*0x18*0x3c*0x3c*0x3e8),'YYYYMMDD'),_0x185665=_0x155b16(0x20e),_0x20a006=_0x155b16(0x211),_0x3d743c=await this[_0x155b16(0x1f0)][_0x155b16(0x222)]({'where':{'configKey':(0x0,typeorm_2['In'])([_0x155b16(0x1c8),_0x155b16(0x1dd)])}}),_0x599464=(_0x43db21=_0x3d743c['find'](_0x52cb7a=>_0x52cb7a['configKey']===_0x155b16(0x1dd)))===null||_0x43db21===void 0x0?void 0x0:_0x43db21[_0x155b16(0x1cf)],_0x33b8c2=(_0x2b3952=_0x3d743c['find'](_0x1f49c2=>_0x1f49c2[_0x155b16(0x1db)]===_0x155b16(0x1c8)))===null||_0x2b3952===void 0x0?void 0x0:_0x2b3952['configVal'];if(!_0x599464||!_0x33b8c2)return[];if(!_0x599464)throw new common_1[(_0x155b16(0x232))](_0x155b16(0x1ea),common_1[_0x155b16(0x1c4)][_0x155b16(0x1d6)]);if(!_0x33b8c2)throw new common_1[(_0x155b16(0x232))](_0x155b16(0x1c5),common_1[_0x155b16(0x1c4)]['BAD_REQUEST']);const _0xcaa2eb=_0x155b16(0x1fa)+_0x33b8c2+_0x155b16(0x206)+_0x599464+_0x155b16(0x1ee)+_0x20a006+'&start_date='+_0x5671e6+'&end_date='+_0x46123f+_0x155b16(0x201)+_0x185665,_0x384400=await axios_1[_0x155b16(0x1d2)]['get'](_0xcaa2eb),{error_code:_0x10a90c,message:_0x2dcd60}=_0x384400[_0x155b16(0x238)];if(_0x10a90c===0x6f)throw new common_1[(_0x155b16(0x232))](_0x2dcd60||_0x155b16(0x214),common_1[_0x155b16(0x1c4)]['BAD_REQUEST']);if(_0x10a90c&&_0x10a90c!==0xc8)throw new common_1[(_0x155b16(0x232))](_0x2dcd60||'获取百度统计数据失败',common_1['HttpStatus'][_0x155b16(0x1d6)]);return _0x384400[_0x155b16(0x238)]['result'];}async['countOrders'](){const _0x582645=_0x5891a9,_0x34f79f=await this[_0x582645(0x1dc)][_0x582645(0x223)]();return _0x34f79f;}async[_0x5891a9(0x229)](){const _0x390333=_0x5891a9,_0x56fc1b=new Date();_0x56fc1b[_0x390333(0x1de)](0x0,0x0,0x0,0x0);const _0x2c4526=new Date(_0x56fc1b[_0x390333(0x21a)]()+0x18*0x3c*0x3c*0x3e8),_0x50e2df=this[_0x390333(0x1dc)][_0x390333(0x21f)](_0x390333(0x1f6)),_0x18b6c6=await _0x50e2df['where'](_0x390333(0x1d0),{'today':_0x56fc1b})['andWhere'](_0x390333(0x218),{'tomorrow':_0x2c4526})[_0x390333(0x224)]();return _0x18b6c6;}};StatisticService=__decorate([(0x0,common_1[_0x5891a9(0x228)])(),__param(0x0,(0x0,typeorm_1['InjectRepository'])(user_entity_1[_0x5891a9(0x227)])),__param(0x1,(0x0,typeorm_1['InjectRepository'])(chatLog_entity_1[_0x5891a9(0x1e7)])),__param(0x2,(0x0,typeorm_1[_0x5891a9(0x217)])(config_entity_1[_0x5891a9(0x1ca)])),__param(0x3,(0x0,typeorm_1[_0x5891a9(0x217)])(order_entity_1[_0x5891a9(0x239)])),__param(0x4,(0x0,typeorm_1['InjectRepository'])(midjourney_entity_1[_0x5891a9(0x1e6)])),__metadata(_0x5891a9(0x20c),[typeorm_2['Repository'],typeorm_2[_0x5891a9(0x226)],typeorm_2[_0x5891a9(0x226)],typeorm_2[_0x5891a9(0x226)],typeorm_2[_0x5891a9(0x226)]])],StatisticService),exports[_0x5891a9(0x216)]=StatisticService;function _0xb060(){const _0x14d72a=['order','getRawMany','midjourney','581772qBZISh','https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=','getBaiduVisit','orderBy','countDrawsByTimeRange','9DRJMEs','../order/order.entity','chatlog','&metrics=','../../common/constants/midjourney.constant','chatlog.createdAt\x20>=\x20:startDate','__param','9417rEbGYS','&site_id=','setDate','defineProperty','@nestjs/typeorm','push','684ybFYse','design:paramtypes','DATE(chatlog.createdAt)\x20as\x20date,\x20COUNT(*)\x20as\x20count','pv_count,visitor_count,ip_count,bounce_ratio,avg_visit_time','decorate','map','overview/getTimeTrendRpt','DRAWED','countDraws','百度授权码过期','chatlog.type\x20=\x20:type','StatisticService','InjectRepository','order.createdAt\x20<\x20:tomorrow','countUsers','getTime','1465700auAbfH','typeorm','__decorate','__esModule','createQueryBuilder','chatLog.createdAt\x20<\x20:tomorrow','metadata','find','count','getCount','chatLog.createdAt\x20>=\x20:today','Repository','UserEntity','Injectable','countNewOrdersToday','countMjDrawsByTimeRange','countNewUsersToday','groupBy','countChatsByTimeRange','userEntity','getBaiduStatistics','formatDate','andWhere','HttpException','10ZeWnII','axios','countNewChatsToday','midjourneyEntity','M.DD','data','OrderEntity','length','6336729rrkSDv','../../common/utils/date','midjourney.createdAt\x20<\x20:tomorrow','date','user','chatLog.type\x20=\x20:type','countOrders','4000310oIiwNJ','HttpStatus','请先配置百度统计accessToken','../../common/constants/balance.constant','getDate','baiduToken','../chatLog/chatLog.entity','ConfigEntity','user.createdAt\x20>=\x20:today','chatLogEntity','midjourney.status\x20=\x20:status','770407IHqVOi','configVal','order.createdAt\x20>=\x20:today','CHAT_TYPE','default','../globalConfig/config.entity','object','YYYYMMDD','BAD_REQUEST','@nestjs/common','__metadata','6HxrkMd','countNewDrawsToday','configKey','orderEntity','baiduSiteId','setHours','PAINT_TYPE','chatLog','60ogmOnK','where','countNewMidhourneysToday','getChatStatistic','MidjourneyStatusEnum','MidjourneyEntity','ChatLogEntity','6466656BOYSUy','now','请先配置百度统计siteId','getOwnPropertyDescriptor','DATE(midjourney.createdAt)\x20as\x20date,\x20COUNT(*)\x20as\x20count','value','&method=','countChats','configEntity','DeductionKey','function','midjourney.createdAt\x20>=\x20:today','select','midjourney.createdAt\x20>=\x20:startDate'];_0xb060=function(){return _0x14d72a;};return _0xb060();}