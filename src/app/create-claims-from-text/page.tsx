"use client";

import React, { useState } from "react";
import { Heading, Text, Textarea, Button, Toast, Column, Card, Background, Tag } from "@/once-ui/components";
import ProphetNavigation from "@/components/ProphetNavigation";
import { useWallet } from "@/components/PhantomWalletConnect";

const API_URL = "http://127.0.0.1:8000/api";

export default function NarrativeExtractionPage() {
	const { walletAddress } = useWallet();

	const [inputValue, setInputValue] = useState("");
	const [aiGeneratedClaims, setAiGeneratedClaims] = useState([]);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);
	const [newClaimsCount, setNewClaimsCount] = useState(0);
	const [duplicateText, setDuplicateText] = useState(false);

	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInputValue(value);
		setDuplicateText(false);
	};

	const checkDuplicateRawText = async () => {
		const response = await fetch(`${API_URL}/rawtexts/check-duplicate/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: inputValue }),
		});
		const data = await response.json();
		return data.duplicate;
	};

	const createRawText = async () => {
		const payload = {
			content: inputValue,
			source: 1,  // TEMP HARDCODED
			genre: 1
		};
		const response = await fetch(`${API_URL}/rawtexts/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		if (!response.ok) {
			throw new Error("Failed to save raw text.");
		}
	};

	const onSubmit = async () => {
		if (!inputValue.trim()) return;
		setLoading(true);
		try {
			const isDuplicate = await checkDuplicateRawText();
			if (isDuplicate) {
				setDuplicateText(true);
				setLoading(false);
				return;
			}

			await createRawText();

			const response = await fetch(`${API_URL}/claims/generate-from-text/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: inputValue }),
			});

			if (!response.ok) throw new Error("AI extraction failed.");

			const data = await response.json();
			setAiGeneratedClaims(data.narrative_claims);

			const newClaims = data.narrative_claims.filter(c => c.generated_by_ai);
			setNewClaimsCount(newClaims.length);
			setStep(2);
		} catch (err) {
			alert(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Column fillWidth paddingY="80" paddingX="s" horizontal="center" flex={1} gap="40">
			<ProphetNavigation />
			<Column fillWidth as="main" maxWidth="l" position="relative" radius="xl" horizontal="center" border="neutral-alpha-weak" gap="48" padding="32">
				<Background position="absolute" gradient={{
					display: true, tilt: -35, height: 50, width: 75, x: 100, y: 40,
					colorStart: "accent-solid-medium", colorEnd: "static-transparent"
				}}/>

				<Heading align="center" variant="display-default-s">Extract Narrative Claims</Heading>

				{step === 1 && (
					<Column gap="16" fillWidth>
						<Textarea label="Input text (speech / article)" value={inputValue} onChange={onChange} rows={6}/>
						<Button onClick={onSubmit} variant="primary" size="l" disabled={!inputValue.trim()} loading={loading}>
							SUBMIT
						</Button>
						{duplicateText && (
							<Toast variant="warning">
								This text has already been processed earlier.
							</Toast>
						)}
					</Column>
				)}

				{step === 2 && (
					<Column gap="16" fillWidth>
						<Heading size="m">Extracted Narrative Claims</Heading>

						{newClaimsCount > 0 && (
							<Toast variant="success">
								{newClaimsCount} new claims saved to database.
							</Toast>
						)}

						{aiGeneratedClaims.map((claim, index) => (
							<Card key={index} padding="32" radius="xl" shadow="lg" style={{ display: 'flex', justifyContent: 'space-between' }}>
								<Text>{claim.text}</Text>
								{claim.generated_by_ai && (
									<Tag variant="success" size="s" style={{ marginLeft: '20px' }}>
										NEW
									</Tag>
								)}
							</Card>
						))}

						<Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
					</Column>
				)}
			</Column>
		</Column>
	);
}
