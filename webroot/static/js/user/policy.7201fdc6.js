import{d as a,y as e,e as t,f as s,c as l,g as n,cT as o,z as c,k as i,w as d,M as u,h as y,c0 as p,o as r,n as v,i as x,aG as f,m as k,a2 as m,bA as w,aH as b,H as h}from"../main-9f041486.js";const g={key:0,class:"px-[20px]"},T={key:1,class:"text-xl"},_={key:0,class:"px-[20px]"},C=["innerHTML"],H=h(a({__name:"policy",setup(a){const h=e({policyContent:"",policyTitle:""}),H=t();s();const M=e(!0),j=l((()=>"dark"===H.theme));n();const L=l((()=>H.theme)),z=l((()=>h.value.policyContent?o(h.value.policyContent):""));return c((()=>{!async function(){const a=await p({keys:["policyTitle","policyContent"]}),{success:e,data:t}=a;console.log(a),M.value=!1,e&&(h.value=t)}()})),(a,e)=>(r(),i(y(b),{vertical:"",class:u("max-w-screen-2xl m-auto")},{default:d((()=>[v(y(w),{"header-style":{"text-align":"center"},"content-style":{"text-align":"justify"}},{header:d((()=>[M.value?(r(),x("div",g,[v(y(f),{text:"",width:"30%"})])):(r(),x("span",T,k(h.value.policyTitle),1))])),default:d((()=>[M.value?(r(),x("div",_,[v(y(f),{text:"",repeat:10})])):(r(),x("div",{key:1,class:u([[j.value?"text-[#fff]":"text-[#000]","pb-5"],"p-[20px] markdown-body markdown-body-generate overflow-y-auto overflow-x-hidden"]),style:m({background:"dark"===L.value?"#2c2c32":"#fff"}),innerHTML:z.value},null,14,C))])),_:1})])),_:1}))}}),[["__scopeId","data-v-b60b864f"]]);export{H as default};
