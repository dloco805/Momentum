/*
Momentum Planner Manager
Build v22.0.1
*/
"use strict";
const PlannerManager=(()=>{
 const KEY="momentum.plannerEvents",EVENT="plannerDataChanged";let items=[];
 const clean=v=>typeof v==="string"?v.trim():"";
 const id=()=>`EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
 function norm(x={}){
  const created=clean(x.createdAt)||new Date().toISOString();
  return {id:clean(x.id)||id(),title:clean(x.title)||"Untitled Event",
   date:clean(x.date)||DateUtils.today(),time:clean(x.time),
   category:["circle","meeting","activity","internship","l2l","planning","other"].includes(x.category)?x.category:"other",
   status:["planned","completed","postponed","cancelled"].includes(x.status)?x.status:"planned",
   notes:clean(x.notes),wins:clean(x.wins),challenges:clean(x.challenges),nextTime:clean(x.nextTime),
   createdAt:created,updatedAt:clean(x.updatedAt)||created};
 }
 function save(){localStorage.setItem(KEY,JSON.stringify(items))}
 function emit(){document.dispatchEvent(new CustomEvent(EVENT,{detail:{events:getEvents()}}))}
 function initialize(list=null){if(Array.isArray(list)){items=list.map(norm);save();return getEvents()}
  try{const p=JSON.parse(localStorage.getItem(KEY)||"[]");items=Array.isArray(p)?p.map(norm):[]}catch{items=[]}return getEvents()}
 const getEvents=()=>items.map(x=>structuredClone(x));
 const getEvent=e=>{const x=items.find(i=>i.id===e);return x?structuredClone(x):null};
 function addEvent(p){const x=norm(p);items.push(x);save();emit();return structuredClone(x)}
 function updateEvent(e,p){const i=items.findIndex(x=>x.id===e);if(i<0)return null;items[i]=norm({...items[i],...p,id:e,createdAt:items[i].createdAt,updatedAt:new Date().toISOString()});save();emit();return structuredClone(items[i])}
 function removeEvent(e){const n=items.length;items=items.filter(x=>x.id!==e);if(items.length===n)return false;save();emit();return true}
 function replaceAll(list){items=Array.isArray(list)?list.map(norm):[];save();emit();return getEvents()}
 return Object.freeze({KEY,EVENT,initialize,getEvents,getEvent,addEvent,updateEvent,removeEvent,replaceAll});
})();