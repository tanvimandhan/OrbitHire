"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
  //console.log('1');
  const result = await model.generateContent(prompt);
  //console.log('2');
  const response = result.response;
  //console.log('3');
  const text = response.text();
  //console.log('4');
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  //console.log('5');
  const parsed = JSON.parse(cleanedText);

// Fix enum values to match Prisma enums
parsed.demandLevel = parsed.demandLevel.toUpperCase();
parsed.marketOutlook = parsed.marketOutlook.toUpperCase();

return parsed;
};

export async function getIndustryInsights() {
  //console.log(1);
  const { userId } = await auth();
 // console.log('f');
  if (!userId) throw new Error("Unauthorized");
 // console.log('g');
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });
// console.log('h');
  if (!user) throw new Error("User not found");
 //console.log('i');
  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);
   // console.log('j');
    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
   // console.log('k');
   console.log(industryInsight);
    return industryInsight;
  }

  return user.industryInsight;
}