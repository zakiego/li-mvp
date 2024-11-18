"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export async function calculateCarbonFootprint(
	score: number,
	answers: Record<number, string>,
	language: "en" | "id",
) {
	const prompt = `
		Based on a carbon footprint assessment:
		- Overall score: ${score}/100
		- Transportation habits: ${answers[0]}
		- Primary transport mode: ${answers[1]}
		- Meat consumption: ${answers[2]}
		- Energy usage: ${answers[3]}
		- Shopping habits: ${answers[4]}

		Please provide:
		1. A brief impact assessment (2 sentences). Include relevant emojis and use casual, Gen-Z friendly language.
		2. 3-4 specific, actionable recommendations to reduce their carbon footprint. Each recommendation should start with an appropriate emoji.
		Format as JSON with properties: "impact" and "recommendations" (array)
		
		Respond in ${language === "id" ? "Indonesian" : "English"} language. Make sure to use plenty of emojis and casual language in both the impact and recommendations.
	`;

	const { object } = await generateObject({
		model: openai("gpt-4o-2024-08-06"),
		prompt,
		schema: z.object({
			impact: z.string(),
			recommendations: z.array(z.string()),
		}),
	});

	return object;
}
