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
    Background,
    Input
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
    market?: { // We might add optional market data here if we fetch it from the backend
        id: number;
    };
}

export default function ClaimDetailPage() {
    const params = useParams<{ slug: string }>();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const [trueTotalPrice, setTrueTotalPrice] = useState<number>(0);  // Total price for TRUE shares
    const [falseTotalPrice, setFalseTotalPrice] = useState<number>(0);  // Total price for FALSE shares

    const { walletAddress } = useWallet();
    const router = useRouter();

    // NEW state for buying shares
    const [buyAmount, setBuyAmount] = useState<string>("");  // string to store user input
    const [feedback, setFeedback] = useState<string>("");    // to display success/error messages

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
    useEffect(() => {
        if (claim && buyAmount) {
            const amountNum = parseFloat(buyAmount) || 0;

            const truePricePerShare = claim.market?.current_true_price
                ? parseFloat(claim.market.current_true_price)
                : 0;
            const falsePricePerShare = claim.market?.current_false_price
                ? parseFloat(claim.market.current_false_price)
                : 0;

            // Recalculate prices after claim update or buyAmount change
            setTrueTotalPrice(amountNum * truePricePerShare);
            setFalseTotalPrice(amountNum * falsePricePerShare);
        }
    }, [claim, buyAmount]);


    // NEW function to buy shares
    const handleBuy = async (side: "TRUE" | "FALSE") => {
        if (!walletAddress) {
            alert("Connect your wallet first!");
            return;
        }
        if (!buyAmount || parseFloat(buyAmount) <= 0) {
            alert("Enter a positive number of shares to buy.");
            return;
        }
        if (!claim?.market) {
            alert("No market found for this claim. (Is the claim in 'market_created' status?)");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/markets/${claim.market.id}/buy/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    side,
                    amount: buyAmount,
                    wallet_address: walletAddress,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setFeedback(`Successfully bought ${data.bought_amount} on side ${data.side}`);

                // Refetch the updated claim to get new prices
                const updatedClaimRes = await fetch(`${API_URL}/claims/${claim.id}/`);
                if (updatedClaimRes.ok) {
                    const updatedClaimData = await updatedClaimRes.json();
                    setClaim(updatedClaimData);  // Update state with the new claim data
                }
            } else {
                setFeedback(`Error: ${data.error || "Unknown error"}`);
            }

        } catch (error) {
            console.error("Buy request failed:", error);
            setFeedback(`Error purchasing shares. Check console.`);
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

                            {/* Show buy UI only if market is created */}
                            {walletAddress && claim.verification_status_name === "market_created" && (
                                <>
                                    {/* Input to specify how many shares to buy */}
                                    <Row gap="8" horizontal="start" align="center">
                                        <Text size="s">Shares to Buy:</Text>
                                        <Input
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            placeholder="Enter number of shares"
                                            type="number"
                                        />


                                    </Row>

                                    {/* NEW: Display current prices */}
                                    <Row gap="8" horizontal="start" align="center">
                                        <Text size="s">Total Price (TRUE): {trueTotalPrice.toFixed(8)} SOL</Text>
                                    </Row>

                                    <Row gap="8" horizontal="start" align="center">
                                        <Text size="s">Total Price (FALSE): {falseTotalPrice.toFixed(8)} SOL</Text>
                                    </Row>

                                    <Row gap="12" horizontal="start" align="center">
                                        <Text size="s">
                                            Current TRUE Price: {claim.market?.current_true_price || "N/A"} SOL/share
                                        </Text>
                                        <Text size="s">
                                            Current FALSE Price: {claim.market?.current_false_price || "N/A"} SOL/share
                                        </Text>
                                    </Row>

                                    <Row gap="12" horizontal="start">
                                        {/* Buy TRUE */}
                                        <Button
                                            variant="success"
                                            onClick={() => handleBuy("TRUE")}
                                            label="Buy TRUE"
                                        />
                                        {/* Buy FALSE */}
                                        <Button
                                            variant="danger"
                                            onClick={() => handleBuy("FALSE")}
                                            label="Buy FALSE"
                                        />
                                    </Row>
                                </>
                            )}
                            {feedback && (
                                <Text align="left" size="s" style={{ color: "blue" }}>
                                    {feedback}
                                </Text>
                            )}
                        </Column>
                    ) : (
                        <Text>Claim not found.</Text>
                    )}
                </Card>
            </Column>
        </Column>
    );
}
