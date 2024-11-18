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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Facebook, Linkedin, Loader2, Share2, Twitter } from "lucide-react";
import { useState } from "react";
import { calculateCarbonFootprint } from "./actions";

interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
}

interface QuestionOption {
	label: string;
	value: string;
}

interface QuestionProps {
	question: string;
	options: QuestionOption[];
	onChange: (value: string) => void;
}

interface Result {
	score: number;
	summary: string;
	impact: string;
	recommendations: string[];
}

interface ShareButtonsProps {
	result: Result;
}

interface ResultsProps {
	name: string;
	answers: Record<number, string>;
	result: Result;
	language: Language;
}

interface Question {
	question: string;
	options: QuestionOption[];
}

// Add language type and translations
type Language = "en" | "id";

const translations = {
	en: {
		title: "Carbon Footprint Calculator",
		namePrompt: "Let's start by getting your name:",
		namePlaceholder: "Enter your name",
		previous: "Previous",
		next: "Next",
		seeResults: "See Results",
		calculating: "Calculating your results...",
		results: {
			title: "Your Carbon Footprint Results",
			name: "Name",
			impactScore: "Impact Score",
			summary: "Summary",
			environmentalImpact: "Environmental Impact",
			recommendations: "Recommendations",
		},
		questions: [
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
		],
	},
	id: {
		title: "Kalkulator Jejak Karbon",
		namePrompt: "Mari mulai dengan nama Anda:",
		namePlaceholder: "Masukkan nama Anda",
		previous: "Sebelumnya",
		next: "Selanjutnya",
		seeResults: "Lihat Hasil",
		calculating: "Menghitung hasil Anda...",
		results: {
			title: "Hasil Jejak Karbon Anda",
			name: "Nama",
			impactScore: "Skor Dampak",
			summary: "Ringkasan",
			environmentalImpact: "Dampak Lingkungan",
			recommendations: "Rekomendasi",
		},
		questions: [
			{
				question: "Seberapa sering Anda menggunakan transportasi umum?",
				options: [
					{ label: "Tidak Pernah", value: "never" },
					{ label: "Kadang-kadang", value: "occasionally" },
					{ label: "Secara Teratur", value: "regularly" },
					{ label: "Selalu", value: "always" },
				],
			},
			{
				question: "Apa moda transportasi utama Anda?",
				options: [
					{ label: "Mobil", value: "car" },
					{ label: "Sepeda", value: "bicycle" },
					{ label: "Berjalan", value: "walking" },
					{ label: "Transport Umum", value: "public" },
				],
			},
			{
				question: "Seberapa sering Anda makan daging?",
				options: [
					{ label: "Harian", value: "daily" },
					{ label: "Beberapa kali seminggu", value: "weekly" },
					{ label: "Kadang-kadang", value: "occasionally" },
					{ label: "Tidak Pernah (Vegetarian/Vegetarian)", value: "never" },
				],
			},
			{
				question: "Bagaimana Anda mengelola penggunaan energi rumah Anda?",
				options: [
					{ label: "Tidak ada tindakan khusus", value: "none" },
					{ label: "Gunakan peralatan energi-efisien", value: "efficient" },
					{ label: "Gunakan sumber energi terbarukan", value: "renewable" },
					{ label: "Penggunaan energi minimal", value: "minimal" },
				],
			},
			{
				question:
					"Seberapa sering Anda membeli pakaian atau peralatan elektronik baru?",
				options: [
					{ label: "Mingguan", value: "weekly" },
					{ label: "Bulanan", value: "monthly" },
					{ label: "Beberapa kali setahun", value: "yearly" },
					{ label: "Jarang", value: "rarely" },
				],
			},
		],
	},
};

// Progress Bar Component
const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => (
	<div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
		<div
			className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
			style={{
				width: `${(Math.min(currentStep, totalSteps - 1) / (totalSteps - 1)) * 100}%`,
			}}
		/>
	</div>
);

// Question Component
const Question = ({ question, options, onChange }: QuestionProps) => (
	<RadioGroup onValueChange={onChange} className="space-y-2">
		<CardDescription className="mb-4">{question}</CardDescription>
		{options.map((option, index) => (
			<div
				key={`${option.value}-${index}`}
				className="flex items-center space-x-2"
			>
				<RadioGroupItem value={option.value} id={`option-${index}`} />
				<Label htmlFor={`option-${index}`}>{option.label}</Label>
			</div>
		))}
	</RadioGroup>
);

// Share Buttons Component
const ShareButtons = ({ result }: ShareButtonsProps) => {
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
const Results = ({ name, answers, result, language }: ResultsProps) => {
	const t = translations[language].results;

	return (
		<div className="space-y-6">
			<CardTitle className="text-2xl font-bold text-emerald-800">
				{t.title}
			</CardTitle>
			<div className="space-y-4">
				<CardDescription>
					<strong className="text-emerald-700">{t.name}:</strong> {name}
				</CardDescription>
				<CardDescription>
					<strong className="text-emerald-700">{t.impactScore}:</strong>{" "}
					{result.score} (out of 100)
				</CardDescription>
				<CardDescription>
					<strong className="text-emerald-700">{t.summary}:</strong>{" "}
					{result.summary}
				</CardDescription>
				<CardDescription>
					<strong className="text-emerald-700">{t.environmentalImpact}:</strong>{" "}
					{result.impact}
				</CardDescription>
				<CardDescription>
					<strong className="text-emerald-700">{t.recommendations}:</strong>
					<ul className="list-disc pl-5 mt-2 space-y-1">
						{result.recommendations.map((rec, index) => (
							<li key={`rec-${rec}`}>{rec}</li>
						))}
					</ul>
				</CardDescription>
			</div>
			<ShareButtons result={result} />
		</div>
	);
};

// Main Component
export default function CarbonFootprintCalculator() {
	const [step, setStep] = useState(0);
	const [name, setName] = useState("");
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const [result, setResult] = useState<Result | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [language, setLanguage] = useState<Language>("en");

	const questions: Question[] = translations[language].questions;

	const handleAnswer = (answer: string) => {
		setAnswers({ ...answers, [step - 1]: answer });
		if (step === questions.length) {
			void calculateResult();
		}
		setStep(step + 1);
	};

	const calculateResult = async () => {
		setIsLoading(true);
		let normalizedScore = 0;
		try {
			// This is a simplified calculation. In a real app, you'd have more complex logic.
			const scores = {
				transportation: { never: 3, occasionally: 2, regularly: 1, always: 0 },
				mode: { car: 3, bicycle: 0, walking: 0, public: 1 },
				meat: { daily: 3, weekly: 2, occasionally: 1, never: 0 },
				energy: { none: 3, efficient: 2, renewable: 1, minimal: 0 },
				shopping: { weekly: 3, monthly: 2, yearly: 1, rarely: 0 },
			} as const;

			const scoreCategories = Object.keys(scores) as Array<keyof typeof scores>;
			const score = Object.values(answers).reduce((total, answer, index) => {
				const category = scoreCategories[index];
				return (
					total +
					scores[category][answer as keyof (typeof scores)[typeof category]]
				);
			}, 0);

			normalizedScore = Math.round((score / 15) * 100); // 15 is max possible score

			const aiResponse = await calculateCarbonFootprint(
				normalizedScore,
				answers,
				language,
			);

			setResult({
				score: normalizedScore,
				summary: `Based on your answers, your carbon footprint score is ${normalizedScore} out of 100.`,
				impact: aiResponse.impact,
				recommendations: aiResponse.recommendations,
			});
		} catch (error) {
			// Fallback to existing static recommendations if AI fails
			let impact: string;
			let recommendations: string[];

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
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle className="text-2xl font-bold text-center text-emerald-700">
							{translations[language].title}
						</CardTitle>
						<Select
							value={language}
							onValueChange={(value: Language) => setLanguage(value)}
						>
							<SelectTrigger className="w-[70px]">
								<SelectValue placeholder="Language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">EN</SelectItem>
								<SelectItem value="id">ID</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<ProgressBar currentStep={step} totalSteps={questions.length + 2} />
					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
							<span className="ml-2">{translations[language].calculating}</span>
						</div>
					) : (
						<>
							{step === 0 && (
								<div className="space-y-4">
									<CardDescription>
										{translations[language].namePrompt}
									</CardDescription>
									<Input
										type="text"
										placeholder={translations[language].namePlaceholder}
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
								<Results
									name={name}
									answers={answers}
									result={result}
									language={language}
								/>
							)}
						</>
					)}
				</CardContent>
				<CardFooter className="flex justify-between">
					{step > 0 && step <= questions.length && (
						<Button variant="outline" onClick={() => setStep(step - 1)}>
							{translations[language].previous}
						</Button>
					)}
					{step === 0 && (
						<Button
							className="ml-auto bg-emerald-600 hover:bg-emerald-700"
							onClick={() => setStep(step + 1)}
							disabled={!name}
						>
							{translations[language].next}
						</Button>
					)}
					{step === questions.length && (
						<Button
							className="ml-auto bg-emerald-600 hover:bg-emerald-700"
							onClick={calculateResult}
						>
							{translations[language].seeResults}
						</Button>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
