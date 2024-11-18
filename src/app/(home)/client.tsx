"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { useState } from "react";

// Progress Bar Component
const ProgressBar = ({ currentStep, totalSteps }) => (
	<div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
		<div
			className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
			style={{
				width: `${(Math.min(currentStep, totalSteps - 1) / (totalSteps - 1)) * 100}%`,
			}}
		/>
	</div>
);

// Question Component
const Question = ({ question, options, onChange }) => (
	<RadioGroup onValueChange={onChange} className="space-y-2">
		<CardDescription className="mb-4">{question}</CardDescription>
		{options.map((option, index) => (
			<div key={index} className="flex items-center space-x-2">
				<RadioGroupItem value={option.value} id={`option-${index}`} />
				<Label htmlFor={`option-${index}`}>{option.label}</Label>
			</div>
		))}
	</RadioGroup>
);

// Share Buttons Component
const ShareButtons = ({ result }) => {
	const shareUrl = encodeURIComponent(window.location.href);
	const shareText = encodeURIComponent(
		`I just calculated my carbon footprint! My impact score is ${result.score}. Check yours too!`,
	);

	return (
		<div className="flex space-x-4 mt-4">
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					window.open(
						`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
						"_blank",
					)
				}
			>
				<Facebook className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					window.open(
						`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
						"_blank",
					)
				}
			>
				<Twitter className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					window.open(
						`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=My Carbon Footprint&summary=${shareText}`,
						"_blank",
					)
				}
			>
				<Linkedin className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={() => navigator.clipboard.writeText(window.location.href)}
			>
				<Share2 className="h-4 w-4" />
			</Button>
		</div>
	);
};

// Results Component
const Results = ({ name, answers, result }) => (
	<div className="space-y-6">
		<CardTitle className="text-2xl font-bold">
			Your Carbon Footprint Results
		</CardTitle>
		<div className="space-y-4">
			<CardDescription>
				<strong>Name:</strong> {name}
			</CardDescription>
			<CardDescription>
				<strong>Impact Score:</strong> {result.score} (out of 100)
			</CardDescription>
			<CardDescription>
				<strong>Summary:</strong> {result.summary}
			</CardDescription>
			<CardDescription>
				<strong>Environmental Impact:</strong> {result.impact}
			</CardDescription>
			<CardDescription>
				<strong>Recommendations:</strong>
				<ul className="list-disc pl-5 mt-2 space-y-1">
					{result.recommendations.map((rec, index) => (
						<li key={index}>{rec}</li>
					))}
				</ul>
			</CardDescription>
		</div>
		<ShareButtons result={result} />
	</div>
);

// Main Component
export default function CarbonFootprintCalculator() {
	const [step, setStep] = useState(0);
	const [name, setName] = useState("");
	const [answers, setAnswers] = useState({});
	const [result, setResult] = useState(null);

	const questions = [
		{
			question: "How often do you use public transportation?",
			options: [
				{ label: "Never", value: "never" },
				{ label: "Occasionally", value: "occasionally" },
				{ label: "Regularly", value: "regularly" },
				{ label: "Always", value: "always" },
			],
		},
		{
			question: "What's your primary mode of transportation?",
			options: [
				{ label: "Car", value: "car" },
				{ label: "Bicycle", value: "bicycle" },
				{ label: "Walking", value: "walking" },
				{ label: "Public Transport", value: "public" },
			],
		},
		{
			question: "How often do you eat meat?",
			options: [
				{ label: "Daily", value: "daily" },
				{ label: "Few times a week", value: "weekly" },
				{ label: "Occasionally", value: "occasionally" },
				{ label: "Never (Vegetarian/Vegan)", value: "never" },
			],
		},
		{
			question: "How do you manage your home energy usage?",
			options: [
				{ label: "No special measures", value: "none" },
				{ label: "Use energy-efficient appliances", value: "efficient" },
				{ label: "Use renewable energy sources", value: "renewable" },
				{ label: "Minimal energy usage", value: "minimal" },
			],
		},
		{
			question: "How often do you purchase new clothes or electronics?",
			options: [
				{ label: "Weekly", value: "weekly" },
				{ label: "Monthly", value: "monthly" },
				{ label: "Few times a year", value: "yearly" },
				{ label: "Rarely", value: "rarely" },
			],
		},
	];

	const handleAnswer = (answer) => {
		setAnswers({ ...answers, [step - 1]: answer });
		if (step === questions.length) {
			calculateResult();
		}
		setStep(step + 1);
	};

	const calculateResult = () => {
		// This is a simplified calculation. In a real app, you'd have more complex logic.
		const scores = {
			transportation: { never: 3, occasionally: 2, regularly: 1, always: 0 },
			mode: { car: 3, bicycle: 0, walking: 0, public: 1 },
			meat: { daily: 3, weekly: 2, occasionally: 1, never: 0 },
			energy: { none: 3, efficient: 2, renewable: 1, minimal: 0 },
			shopping: { weekly: 3, monthly: 2, yearly: 1, rarely: 0 },
		};

		const score = Object.values(answers).reduce((total, answer, index) => {
			return total + scores[Object.keys(scores)[index]][answer];
		}, 0);

		const normalizedScore = Math.round((score / 15) * 100); // 15 is max possible score

		let impact, recommendations;

		if (normalizedScore < 30) {
			impact = "Your carbon footprint is relatively low. Great job!";
			recommendations = [
				"Consider using even more renewable energy sources",
				"Encourage others to adopt your eco-friendly habits",
			];
		} else if (normalizedScore < 60) {
			impact =
				"Your carbon footprint is moderate. There's room for improvement.";
			recommendations = [
				"Try to use public transportation more often",
				"Reduce meat consumption",
				"Opt for energy-efficient appliances",
			];
		} else {
			impact =
				"Your carbon footprint is high. Significant changes could make a big difference.";
			recommendations = [
				"Prioritize walking, cycling, or public transport over driving",
				"Reduce meat consumption and opt for plant-based meals more often",
				"Implement energy-saving measures at home",
				"Practice mindful consumption and reduce unnecessary purchases",
			];
		}

		setResult({
			score: normalizedScore,
			summary: `Based on your answers, your carbon footprint score is ${normalizedScore} out of 100.`,
			impact,
			recommendations,
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center text-green-700">
						Carbon Footprint Calculator
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ProgressBar currentStep={step} totalSteps={questions.length + 2} />
					{step === 0 && (
						<div className="space-y-4">
							<CardDescription>
								Let's start by getting your name:
							</CardDescription>
							<Input
								type="text"
								placeholder="Enter your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
					)}
					{step > 0 && step <= questions.length && (
						<Question
							question={questions[step - 1].question}
							options={questions[step - 1].options}
							onChange={handleAnswer}
						/>
					)}
					{step === questions.length + 1 && result && (
						<Results name={name} answers={answers} result={result} />
					)}
				</CardContent>
				<CardFooter className="flex justify-between">
					{step > 0 && step <= questions.length && (
						<Button variant="outline" onClick={() => setStep(step - 1)}>
							Previous
						</Button>
					)}
					{step === 0 && (
						<Button
							className="ml-auto"
							onClick={() => setStep(step + 1)}
							disabled={!name}
						>
							Next
						</Button>
					)}
					{step === questions.length && (
						<Button className="ml-auto" onClick={calculateResult}>
							See Results
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
