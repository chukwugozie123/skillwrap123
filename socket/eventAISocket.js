const memoryService = require("../services/aiMemoryService");
const lessonService = require("../services/aiLessonService");
const questionService = require("../services/aiQuestionService");
const gradingService = require("../services/aiGradingService");
const messageService = require("../services/aiMessageService");
const chatService = require("../services/aiChatService");


let activeAIEvents = {};


// SAVE + SEND AI MESSAGE
async function sendAI(io, room, eventId, userId, data){

    await messageService.saveAIMessage(
        eventId,
        userId,
        data.message,
        "ai"
    );


    console.log(
        "🤖 AI MESSAGE SAVED:",
        {
            eventId,
            userId,
            type:data.type
        }
    );


    return io.to(room).emit(
        "aiMessage",
        data
    );

}


module.exports = function setupEventAISocket(io, socket){


console.log(
"🧠 AI socket connected:",
socket.id
);


// ================================
// JOIN EVENT
// ================================

socket.on("joinAIEvent", async({eventId,userId})=>{

try{
const room = `event_ai_${eventId}`;

socket.join(room);


const prevChat = await messageService.GetPrevMessage(
eventId,
userId
);

if(prevChat.length === 0){

await sendAI( io,room, eventId, userId, {
    type:"welcome",
    message:`👋 Hello, I am SkillWrap AI Tutor 3.0. I am your personal AI instructor for this event. When you are ready type: START and we will begin your learning journey.`
    }
);


}else{


socket.emit("prevMessage",{
    type:"prev",
    messages:prevChat
});


await sendAI( io,room, eventId, userId, {
    type:"reply",
    message: "Welcome back 👋 Your previous progress has been restored. Let's continue from where we stopped."
})

}


// socket.emit("prevMessage",
// {
// type:"prev",
// messages:prevChat
// });


await memoryService.createStudentMemory(
eventId,
userId
);



}catch(error){

console.log( "JOIN AI ERROR:",  error );
}
});

// ================================
// MAIN MESSAGE ENGINE
// ================================


socket.on("aiMessage", async({ eventId, userId, message })=>{
try{
const room = `event_ai_${eventId}`;

await messageService.saveAIMessage(eventId, userId, message, "user");


// =================================
// START COURSE
// =================================

if(
message.toLowerCase()==="start"
){
const modules =
await lessonService.getEventModules(
eventId
);

if(!modules || modules.length===0 ){ 
    return socket.emit("aiMessage",
{  
    type:"error",
    message:"No AI course found."
})
};

const memory = await memoryService.getStudentMemory(
    eventId,
    userId
);

activeAIEvents[eventId]={
    currentModule:0,
    modules,
    step:"INTRO",
    memory,
    lastQuestion:null
};

const intro = await chatService.generateReply(`
You are SkillWrap AI Tutor. Introduce this course. Course modules:
${JSON.stringify(modules)}
Explain:
- what the student will learn
- why it is useful
- what the journey looks like

Be friendly and interactive.
`);

activeAIEvents[eventId].step="LESSON";



return sendAI(
io,
room,
eventId,
userId,
{
type:"intro",
message:intro
}
);

}

const state =
activeAIEvents[eventId];

if(!state){
return; 
}

// =================================
// ENGINE STATES
// =================================

switch(state.step){
// ================= INTRO DONE
case "LESSON":{
const module = state.modules[state.currentModule];

const lesson = await lessonService.generateLesson(
    eventId,
    userId,
    module
);

state.step="EXAMPLE";

// return io.to(room).emit("aiMessage", {
// type:"lesson",
// module,
// message:lesson
// });
return sendAI(
io,
room,
eventId,
userId,
{
type:"lesson",
module,
message:lesson
}
);
}

// ================= EXAMPLE
case "EXAMPLE":{
const module =
state.modules[
state.currentModule
];

const example = await chatService.generateReply(`
Give a simple real life example about this topic:
${module}
Make it easy for beginners.
`);

state.step="QUESTION";

// return io.to(room).emit("aiMessage",{
// type:"example",
// message:example
// });


return sendAI(
io,
room,
eventId,
userId,
{
type:"example",
message:example
}
);
}

// ================= QUESTION
case "QUESTION":{
const module =
state.modules[
state.currentModule
];

const question = await questionService.generateQuestion({
module,
memory:
state.memory
});

state.lastQuestion =
question;

state.step="GRADE";

return sendAI(
io,
room,
eventId,
userId,
{
type:"question",
message:question
}
);
}

// ================= GRADE
case "GRADE":{
const module =
state.modules[
state.currentModule
];

const evaluation = await gradingService.gradeAnswer({
module,
question: state.lastQuestion,
answer: message 
});


await memoryService.updateMemory({
    eventId,
    userId,
    evaluation,
    module
});

if(evaluation.score < 60 ){
state.step="QUESTION";

return sendAI(
io,
room,
eventId,
userId,
{
type:"feedback",
message:
`
${evaluation.feedback}


Let's try another question to improve your understanding.
`
}
);
}

state.step="DISCUSSION";


return sendAI(
io,
room,
eventId,
userId,
{
type:"feedback",
message:
`Excellent answer 🎉
Score:
${evaluation.score}/100

Do you have any questions about this module?

Ask now. If you understand everything type:
NEXT MODULE
`
}
);
}


// ================= DISCUSSION
case "DISCUSSION":{

if(message.toLowerCase().includes("next module") ){

state.currentModule++;

const nextModule =
state.modules[
state.currentModule
];

if(!nextModule){
delete activeAIEvents[eventId];

return sendAI(
io,
room,
eventId,
userId,
{
type:"complete",
message:
`
🎉 Congratulations!
You completed this AI course.
`
}
);
}

state.step="LESSON";

return io.to(room)
.emit(
"aiMessage",
{
type:"lesson-start",

message:
`Moving to next module:
${nextModule}
Let's continue 🚀
`
}
);
}

const reply =
await chatService.generateReply(`

Student question:
${message}
Answer as a tutor.
Topic:

${state.modules[state.currentModule]}
`);

return sendAI(
io,
room,
eventId,
userId,
{
type:"reply",
message:reply
}
);



}



}







}catch(error){


console.log(
"AI SOCKET ERROR:",
error
);



socket.emit(
"aiMessage",
{
type:"error",

message:
"Something went wrong with AI tutor."
}
);


}



});



};


// hey gpt i juste need  a simple answer for u my code is going well everything is wroking d way it should but now ehher i noticed dat when an Ai send me a message it would be stored in d db ooo but with no user_id (maybe cuz ai is not  auser).. but we need
// d id to fetch info when retriving all d chat of a particular users.. and i scannned through out my code didt see an thing like dis so inputing dat in d db for ai but somehow when ia send smessages it sinput in db .. pelses fish it out sow e can satrt adding userId when sending ai message to backend.. u understand my point rii


// also i have a new fetures adding a voice over so d ai can be saying what evenr it gave us i ntoiced dat d ai resosne is a bit logn muh cusers wont wan tto waste time reading so how can we add voice to d ai plesae give me ur opinion nd adding a note pad section where users can wirte note. when ai is teachign..
// also d next one adding a Ai chatbox in  d whole of skillwrap to tell everyone about skillwrap.. like a mim bot that we can ask any question bout skillwrap nd it would deliver.. also to improve d learning/exchanging section in sw.. make it sepeprare for learnenr sadd key things
// !. a noot pad/nottbook
// 2. a topic list
// 3. adding vocie call for both exchnging to, addind file upload imgs , pdf, zip etc  addig anohter ai bot diiferent form normal event ai nd diiferrent for mini sw ai bot.. this bot i sused to answer question regarding whats been taught in d exchangeor learnin gsection  