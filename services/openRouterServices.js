const axios = require("axios");


const generateAI = async (prompt, retry = 0) => {

    try {

        const response = await axios.post(

            "https://openrouter.ai/api/v1/chat/completions",

            {
                model: "deepseek/deepseek-chat",

                messages:[
                    {
                        role:"system",
                        content:
                        `
                        You are SkillWrap AI.
                        You are an intelligent educational tutor.
                        Explain clearly and help students learn.
                        `
                    },

                    {
                        role:"user",
                        content: prompt
                    }
                ],

                temperature:0.7
            },


            {
                headers:{
                    Authorization:
                    `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type":
                    "application/json"
                },


                timeout:60000
            }

        );


        return response.data
        .choices[0]
        .message
        .content;



    } catch(error){


        if(
            (error.code==="ECONNABORTED" ||
             error.code==="ETIMEDOUT")
             &&
             retry < 2
        ){

            console.log(
            `AI timeout. Retrying ${retry + 1}/2`
            );


            return generateAI(
                prompt,
                retry + 1
            );

        }



        console.log(
            "OpenRouter Error:",
            error.response?.data ||
            error.message
        );


        throw error;


    }

};


module.exports = generateAI;