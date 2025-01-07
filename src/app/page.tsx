"use client";

import React, { useState, useEffect } from "react";
import { Heading, Text, Flex, Button, Input, Tag } from "@/once-ui/components";
import { validateClaim } from "@/custom/semantic/claimValidation";
import Link from "next/link";

export default function Home() {
	const [inputValue, setInputValue] = useState("");
	const [error, setError] = useState("");
	const [showError, setShowError] = useState(false);
	const [validated, setValidated] = useState(false);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
	const [loading, setLoading] = useState(false);
	const [claims, setClaims] = useState([]); // List of claims
	const [loadingClaims, setLoadingClaims] = useState(false); // Loading state for fetching claims

	// Fetch all claims once on component mount
	useEffect(() => {
		const fetchClaims = async () => {
			setLoadingClaims(true);
			try {
				const response = await fetch("http://127.0.0.1:8000/api/claims/");
				if (response.ok) {
					const data = await response.json();
					console.log("Fetched claims:", data); // Debugging
					setClaims(data);
				} else {
					console.error("Failed to fetch claims:", response.statusText);
				}
			} catch (error) {
				console.error("Error fetching claims:", error);
			} finally {
				setLoadingClaims(false);
			}
		};

		fetchClaims();
	}, []);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		const words = value.trim().split(/\s+/);
		if (words.length < 3) {
			setError("");
			setValidated(false);
			setShowError(false);
			return;
		}

		if (typingTimeout) clearTimeout(typingTimeout);

		const timeout = setTimeout(() => {
			const validationError = validateClaim(value.trim());
			setError(validationError);
			setValidated(!validationError);
			setShowError(true);
		}, 300);
		setTypingTimeout(timeout);
	};

	const onBlur = () => {
		setShowError(true);
	};

	const onSubmit = async () => {
		setShowError(true);

		if (validated) {
			setLoading(true);

			try {
				const response = await fetch("http://127.0.0.1:8000/api/claims/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: inputValue }),
				});

				if (response.ok) {
					const newClaim = await response.json();
					console.log("New claim from backend:", newClaim); // Debugging

					// Immediately update the UI with the new claim
					setClaims((prevClaims) => [newClaim, ...prevClaims]);
					setInputValue(""); // Clear the input
					setValidated(false);
					setShowError(false);
				} else {
					const errorData = await response.json();
					alert(`Error submitting claim: ${JSON.stringify(errorData)}`);
				}
			} catch (error) {
				alert(`An unexpected error occurred: ${error.message}`);
			} finally {
				setLoading(false); // Hide loading indicator
			}
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			onSubmit();
		}
	};

	return (
		<Flex
			fillWidth
			paddingTop="l"
			paddingX="l"
			direction="column"
			alignItems="center"
			flex={1}
		>
			<Flex
				as="main"
				direction="column"
				justifyContent="center"
				fillWidth
				fillHeight
				padding="l"
				gap="l"
			>
				<Flex fillWidth gap="24">
					<Flex
						position="relative"
						flex={4}
						gap="24"
						marginBottom="104"
						direction="column"
					>
						<Input
							id="example"
							label="Your claim"
							value={inputValue}
							onChange={onChange}
							onBlur={onBlur}
							onKeyDown={onKeyDown}
							error={showError ? error : ""}
						/>
						<Button
							onClick={onSubmit}
							variant="primary"
							size="l"
							label="SUBMIT YOUR CLAIM"
							disabled={!validated}
							loading={loading}
						/>
					</Flex>
				</Flex>
				<Flex
					direction="column"
					fillWidth
					gap="16"
					padding="l"
					alignItems="center"
				>
					<Heading size="m">Submitted Claims</Heading>
					{loadingClaims ? (
						<Text>Loading claims...</Text>
					) : claims.length > 0 ? (
						claims.map((claim) => (
							<Flex
								key={claim.id}
								direction="row"
								gap="16"
								padding="16"
								border="neutral-medium"
								borderStyle="solid-1"
								background="neutral-weak"
								fillWidth
							>
								<Text>{claim.text}</Text>
								<Tag label={claim.verification_status_name} variant="neutral" />
								{claim.status_description && (
									<Text variant="body-small">{claim.status_description}</Text>
								)}
							</Flex>
						))
					) : (
						<Text>No claims have been submitted yet.</Text>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}
