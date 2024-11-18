"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export async function calculateCarbonFootprint(
	score: number,
	answers: Record<number, string>,
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
		1. A brief impact assessment (2 sentences)
		2. 3-4 specific, actionable recommendations to reduce their carbon footprint
		Format as JSON with properties: "impact" and "recommendations" (array)
	`;

	const { object } = await generateObject({
		model: openai("gpt-4-turbo"),
		prompt,
		schema: z.object({
			impact: z.string(),
			recommendations: z.array(z.string()),
		}),
	});

	return object;
}
