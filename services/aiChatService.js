const generateAI =
require("./openRouterServices");


exports.generateReply = async(message)=>{


const prompt = `

You are SkillWrap AI tutor.

Student message:

${message}


Explain clearly and help the student.

`;


return await generateAI(prompt);


};