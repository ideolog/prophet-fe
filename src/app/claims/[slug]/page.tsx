"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Column,
    Row,
    Text,
    Button,
    Card,
    Heading,
    Background
} from "@/once-ui/components";
import ProphetNavigation from "@/components/ProphetNavigation";
import { useWallet } from "@/components/PhantomWalletConnect";

const API_URL = "http://localhost:8000/api";

interface Claim {
    id: number;
    slug: string;
    text: string;
    verification_status_name: string;
    verification_status_display: string;
    status_description: string;
    author: string;
    created_at: string;
}

export default function ClaimDetailPage() {
    const params = useParams<{ slug: string }>();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const { walletAddress } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (!params?.slug) return;

        async function fetchClaim() {
            try {
                const res = await fetch(`${API_URL}/claims/`);
                if (!res.ok) throw new Error(`Failed to fetch claims: ${res.status}`);
                const claims: Claim[] = await res.json();
                const matchedClaim = claims.find((c) => c.slug === params.slug);

                if (!matchedClaim) {
                    setLoading(false);
                    router.push("/404");
                    return;
                }

                const claimRes = await fetch(`${API_URL}/claims/${matchedClaim.id}/`);
                if (!claimRes.ok) throw new Error(`Failed to fetch claim: ${claimRes.status}`);
                const claimData = await claimRes.json();
                setClaim(claimData);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchClaim();
    }, [params?.slug, router]);

    const handleCreateMarket = async () => {
        if (!walletAddress) {
            alert("Connect your wallet first!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/markets/create/${claim?.id}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet_address: walletAddress }),
            });

            if (response.ok) {
                alert("Market created successfully!");
                const updatedClaimRes = await fetch(`${API_URL}/claims/${claim?.id}/`);
                if (updatedClaimRes.ok) {
                    const updatedClaimData = await updatedClaimRes.json();
                    setClaim(updatedClaimData);
                }
                router.push(`/claims/${claim?.slug}`);
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Market creation failed", error);
        }
    };

    return (
        <Column fillWidth paddingY="80" paddingX="s" horizontal="center" flex={1} gap="40">
            <ProphetNavigation />
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
                    Claim Details
                </Heading>

                <Card
                    padding="32"
                    radius="xl"
                    shadow="lg"
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                    {loading ? (
                        <Text>Loading claim details...</Text>
                    ) : claim ? (
                        <Column gap="16" fillWidth>
                            <Text align="left" size="m">
                                {claim.text}
                            </Text>
                            <Text align="left" size="s">
                                Status: {claim.verification_status_display}
                            </Text>
                            <Text align="left" size="s">
                                Description: {claim.status_description || "No description available."}
                            </Text>
                            <Text align="left" size="s">
                                Author: {claim.author === "11111111111111111111111111111111" ? "Unknown (No wallet connected)" : claim.author}
                            </Text>

                            <Row gap="12" horizontal="start">
                                {walletAddress && claim.verification_status_name === "ai_reviewed" && (
                                    <Button
                                        onClick={handleCreateMarket}
                                        variant="primary"
                                        size="m"
                                        label="Create Market"
                                    />
                                )}

                                {walletAddress && claim.verification_status_name === "market_created" && (
                                    <>
                                        <Button
                                            variant="success"
                                            onClick={() => alert("You voted TRUE")}
                                            label="TRUE"
                                        />
                                        <Button
                                            variant="danger"
                                            onClick={() => alert("You voted FALSE")}
                                            label="FALSE"
                                        />
                                    </>
                                )}
                            </Row>
                        </Column>
                    ) : (
                        <Text>Claim not found.</Text>
                    )}
                </Card>
            </Column>
        </Column>
    );
}
