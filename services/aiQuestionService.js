const generateAI = require("./openRouterServices");


exports.generateQuestion = async function generateQuestion(data){

const {
  module,
  memory,
  lessonContext
} = data;



const prompt = `

You are an AI tutor.

Your job is to test the student's understanding.

You MUST ONLY ask questions from the lesson provided.

MODULE:
${module}


LESSON CONTEXT:
${lessonContext}



STUDENT MEMORY:

Weaknesses:
${JSON.stringify(memory?.weaknesses || [])}



RULES:

- Stay strictly inside the module topic
- Never change subject
- Never introduce unrelated topics
- Do not ask biology, history, mathematics, etc unless the module is about it
- Ask only ONE question
- Make the question test understanding, not memorization
- Match the student's weakness if possible
- Do not provide the answer
- Return ONLY the question text


`;



// const question =
// await generateAI(prompt);

return await generateAI(prompt);


}