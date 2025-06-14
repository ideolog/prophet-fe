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
    market?: { id: number };
}

export default function ClaimDetailPage() {
    const params = useParams<{ slug: string }>();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);
    const [trueTotalPrice, setTrueTotalPrice] = useState<number>(0);
    const [falseTotalPrice, setFalseTotalPrice] = useState<number>(0);
    const [userBalance, setUserBalance] = useState<number | null>(null); // NEW: Store user balance
    const [buyAmount, setBuyAmount] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");

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

        async function fetchUserBalance() {
            if (!walletAddress) return;
            try {
                const res = await fetch(`${API_URL}/users/${walletAddress}/`);
                if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
                const data = await res.json();
                setUserBalance(parseFloat(data.balance)); // Store user balance
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        }


        fetchClaim();
        fetchUserBalance();
    }, [params?.slug, router, walletAddress]);

    useEffect(() => {
        if (claim && buyAmount) {
            const amountNum = parseFloat(buyAmount) || 0;

            const truePricePerShare = claim.market?.current_true_price
                ? parseFloat(claim.market.current_true_price)
                : 0;
            const falsePricePerShare = claim.market?.current_false_price
                ? parseFloat(claim.market.current_false_price)
                : 0;

            setTrueTotalPrice(amountNum * truePricePerShare);
            setFalseTotalPrice(amountNum * falsePricePerShare);
        }
    }, [claim, buyAmount]);

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

                // ✅ Fetch updated claim data (to refresh prices)
                const updatedClaimRes = await fetch(`${API_URL}/claims/${claim.id}/`);
                if (updatedClaimRes.ok) {
                    const updatedClaimData = await updatedClaimRes.json();
                    setClaim(updatedClaimData);
                }

                // ✅ Fetch updated wallet balance
                const balanceRes = await fetch(`${API_URL}/users/${walletAddress}/`);

                if (balanceRes.ok) {
                    const updatedUserData = await balanceRes.json();
                    console.log("✅ Updated balance received from API:", updatedUserData.balance);
                    setUserBalance(parseFloat(updatedUserData.balance) || 0);
                } else {
                    console.error("❌ Balance update failed:", balanceRes.status);
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

                <Card padding="32" radius="xl" shadow="lg">
                    {loading ? (
                        <Text>Loading claim details...</Text>
                    ) : claim ? (
                        <Column gap="16" fillWidth>
                            <Text align="left" size="m">{claim.text}</Text>
                            <Text align="left" size="s">Status: {claim.verification_status_display}</Text>
                            <Text align="left" size="s">Description: {claim.status_description || "No description available."}</Text>
                            <Text align="left" size="s">Author: {claim.author}</Text>

                            {/* Show user balance */}
                            {walletAddress && userBalance !== null && (
                                <Text size="s" style={{ fontWeight: "bold", color: "green" }}>
                                    Your Balance: {userBalance !== null ? userBalance.toFixed(8) : "Loading..."} SOL
                                </Text>
                            )}

                            {/* Buy UI */}
                            {walletAddress && claim.verification_status_name === "market_created" && (
                                <>
                                    <Row gap="8" horizontal="start" align="center">
                                        <Text size="s">Shares to Buy:</Text>
                                        <Input
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            placeholder="Enter number of shares"
                                            type="number"
                                        />
                                    </Row>

                                    {/* NEW: Display calculated prices */}
                                    <Row gap="8" horizontal="start">
                                        <Text size="s">Total Price (TRUE): {trueTotalPrice.toFixed(8)} SOL</Text>
                                    </Row>
                                    <Row gap="8" horizontal="start">
                                        <Text size="s">Total Price (FALSE): {falseTotalPrice.toFixed(8)} SOL</Text>
                                    </Row>

                                    <Row gap="12" horizontal="start">
                                        <Text size="s">
                                            Current TRUE Price: {claim.market?.current_true_price || "N/A"} SOL/share
                                        </Text>
                                        <Text size="s">
                                            Current FALSE Price: {claim.market?.current_false_price || "N/A"} SOL/share
                                        </Text>
                                    </Row>

                                    <Row gap="12" horizontal="start">
                                        <Button variant="success" onClick={() => handleBuy("TRUE")} label="Buy TRUE" />
                                        <Button variant="danger" onClick={() => handleBuy("FALSE")} label="Buy FALSE" />
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
