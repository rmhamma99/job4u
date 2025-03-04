import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GenerateInput {
  fullName: string;
  experience: string[];
  education: string[];
  skills: string[];
  targetPosition?: string;
  companyName?: string;
  additionalInfo?: string;
}

export async function generateCV(input: GenerateInput) {
  const prompt = `
    Create a professional CV for the following person:
    Full Name: ${input.fullName}

    Professional Experience:
    ${input.experience.map(exp => "- " + exp).join("\n")}

    Education:
    ${input.education.map(edu => "- " + edu).join("\n")}

    Skills:
    ${input.skills.map(skill => "- " + skill).join("\n")}

    Additional Information:
    ${input.additionalInfo || ""}

    Format the CV in a clear, professional structure with sections for Experience, Education, and Skills.
    Use bullet points for achievements and responsibilities.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a professional CV writer. Create a well-structured, professional CV."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

export async function generateCoverLetter(input: GenerateInput) {
  // Make these checks optional since cover letter generation is now optional
  if (input.targetPosition && input.companyName) {
    const prompt = `
      Write a professional cover letter for the following:
      Candidate: ${input.fullName}
      Position: ${input.targetPosition}
      Company: ${input.companyName}

      Candidate Background:
      Experience:
      ${input.experience.map(exp => "- " + exp).join("\n")}

      Skills:
      ${input.skills.map(skill => "- " + skill).join("\n")}

      Additional Information:
      ${input.additionalInfo || ""}

      Write a compelling cover letter that highlights the candidate's relevant experience and skills for the position.
      Keep it professional, concise, and engaging.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer. Create a compelling, well-structured cover letter."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }

  return "Please provide a target position and company name to generate a cover letter.";
}