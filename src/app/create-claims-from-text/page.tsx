"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Heading,
	Text,
	Textarea,
	Flex,
	Button,
	Input,
	Tag,
	Toast,
	Column,
	Row,
	Card,
	Background
} from "@/once-ui/components";
import { validateClaim } from "@/semantic/claimValidation";
import ClaimList from "@/components/ClaimList";
import ProphetNavigation from "@/components/ProphetNavigation";
import { useWallet } from "@/components/PhantomWalletConnect";

const API_URL = "http://127.0.0.1:8000/api";

export default function NarrativeExtractionPage() {
	const router = useRouter();
	const { walletAddress } = useWallet();

	const [inputValue, setInputValue] = useState("");
	const [aiGeneratedClaims, setAiGeneratedClaims] = useState([]);
	const [error, setError] = useState("");
	const [validated, setValidated] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);
	const [submittedClaimId, setSubmittedClaimId] = useState<number | null>(null);
	const [showSuccessToast, setShowSuccessToast] = useState(false);

	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInputValue(value);

		if (value.trim().length > 0) {
			setValidated(true);
			setError("");
		} else {
			setValidated(false);
			setError("Please enter some text.");
		}
	};


	const onSubmit = async () => {
		if (!inputValue.trim()) return;
		setLoading(true);

		try {
			const response = await fetch(`${API_URL}/narrative-extraction/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: inputValue }),
			});

			const data = await response.json();
			if (response.ok) {
				setAiGeneratedClaims(data.narrative_claims);
				setStep(2);
			} else {
				alert(`Error extracting claims: ${data.error}`);
			}
		} catch (error) {
			console.error("Error extracting claims:", error);
		} finally {
			setLoading(false);
		}
	};


	const handleCreateMarket = async (claimId: number) => {
		if (!walletAddress) {
			alert("Connect your wallet first!");
			return;
		}

		try {
			const response = await fetch(`${API_URL}/markets/create/${claimId}/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ wallet_address: walletAddress }),
			});

			const data = await response.json();
			if (response.ok) {
				setShowSuccessToast(true);
				setTimeout(() => {
					setShowSuccessToast(false);
					router.push(`/claims/${data.claim_slug}`);
				}, 5000);
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error("Market creation failed", error);
		}
	};

	return (
		<Column fillWidth paddingY="80" paddingX="s" horizontal="center" flex={1} gap="40">
			<ProphetNavigation />
			{showSuccessToast && (
				<Toast variant="success" onClose={() => setShowSuccessToast(false)}>
					Market created successfully! Redirecting...
				</Toast>
			)}
			<Column
				fillWidth
				as="main"
				maxWidth="l"
				position="relative"
				radius="xl"
				horizontal="center"
				border="neutral-alpha-weak"
				gap="48"
				padding="32"
			>
				<Background
					position="absolute"
					gradient={{
						display: true,
						tilt: -35,
						height: 50,
						width: 75,
						x: 100,
						y: 40,
						colorStart: "accent-solid-medium",
						colorEnd: "static-transparent",
					}}
				/>

				<Heading align="center" variant="display-default-s">
					Create a New Claim
				</Heading>

				{step === 1 && (
					<Column gap="16" fillWidth>
						<Textarea
							label="Input text (speech / article)"
							value={inputValue}
							onChange={onChange}  // use your defined function here!
							rows={6}
						/>
						<Button onClick={onSubmit} variant="primary" size="l" disabled={!validated} loading={loading}>
							SUBMIT CLAIM
						</Button>
					</Column>
				)}

				{step === 2 && aiGeneratedClaims.length > 0 && (
					<Column gap="16" fillWidth>
						<Heading size="m">Extracted Narrative Claims</Heading>
						{aiGeneratedClaims.map((claim, index) => (
							<Card
								key={index}
								padding="32"
								radius="xl"
								shadow="lg"
							>
								<Text>{claim}</Text>
							</Card>
						))}
						<Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
					</Column>
				)}
			</Column>
		</Column>
	);
}
