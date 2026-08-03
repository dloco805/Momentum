/*
Momentum Demo Class
Build v19.0.0
*/
"use strict";
const DemoClass=(()=>{
 const PREFIX="DEMO-";
 const names=[["Alex","Rivera"],["Jordan","Lee"],["Maya","Thompson"],["Eli","Martinez"],["Sam","Chen"],["Nia","Brooks"],["Owen","Walker"],["Avery","Patel"],["Leo","Johnson"],["Zoe","Garcia"],["Kai","Williams"],["Mia","Brown"],["Noah","Davis"],["Lena","Wilson"],["Isaac","Clark"]];
 const interests=[["cars","mechanics"],["art","design"],["animals","science"],["music","technology"],["sports","fitness"],["cooking","business"],["outdoors","construction"],["photography","media"],["healthcare","helping people"],["gaming","coding"],["fashion","marketing"],["welding","building"],["history","law"],["nature","environment"],["video","storytelling"]];
 function hasDemo(){return StudentManager.getStudents({includeArchived:true}).some(s=>s.id.startsWith(PREFIX))}
 function create(){
  if(hasDemo()) return 0;
  const today=new Date();
  names.forEach((n,i)=>{
   const d=new Date(today);d.setDate(today.getDate()-(i%12));
   StudentManager.createStudent({
    id:`${PREFIX}${String(i+1).padStart(2,"0")}`,
    profile:{preferredName:n[0],firstName:n[0],lastName:n[1],interests:interests[i],strengths:[i%2?"creative":"hands-on"],learningPreferences:[i%3?"Trying it myself":"Watching first"],postSecondaryGoals:[i%4?"Explore options":"Get a job"],currentFocus:i%3?"Build confidence":"Find an internship"},
    journey:{
     currentProjects:[{title:["Community Garden","Podcast","Bike Repair","Photo Essay","Food Truck Plan"][i%5],status:i%4===0?"completed":"active",createdAt:d.toISOString()}],
     internships:i%3===0?[{title:["Auto Shop","Animal Shelter","Library"][i%3],organization:["Northside Auto","County Shelter","City Library"][i%3],status:"active",createdAt:d.toISOString()}]:[],
     goals:[{title:["Finish resume","Improve attendance","Earn permit","Present project"][i%4],status:i%5===0?"completed":"active",createdAt:d.toISOString()}],
     checkIns:[{meetingDate:d.toISOString().slice(0,10),meetingTime:"10:00",summary:"Demo check-in about current work and next steps.",projectUpdates:["Reviewed current project"],opportunityUpdates:i%3===0?["Discussed internship progress"]:[],nextSteps:["Complete one next step"],newQuestions:["What should I explore next?"],reflection:"Student shared a useful update.",mood:["Hopeful"]}]
    }
   });
  });
  return names.length;
 }
 function clear(){
  const keep=StudentManager.getStudents({includeArchived:true}).filter(s=>!s.id.startsWith(PREFIX));
  const removed=StudentManager.getStudents({includeArchived:true}).length-keep.length;
  StudentManager.replaceAll(keep);
  return removed;
 }
 return Object.freeze({PREFIX,hasDemo,create,clear});
})();