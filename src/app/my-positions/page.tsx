"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Column,
    Row,
    Text,
    Card,
    Heading,
    Background,
    Flex,
    Line, Button,
} from "@/once-ui/components";
import ProphetNavigation from "@/components/ProphetNavigation";
import { useWallet } from "@/components/PhantomWalletConnect";
import PositionsTable from "@/components/PositionsTable";
const API_URL = "http://localhost:8000/api";

interface Position {
    claim_id: number;
    claim_text: string;
    claim_slug: string;
    side: "TRUE" | "FALSE";
    shares: string;
    cost_basis: string;
    total_shares: string;
    yield: string;
}

export default function MyPositionsPage() {
    const { walletAddress } = useWallet();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!walletAddress) return;

        async function fetchPositions() {
            try {
                const res = await fetch(`${API_URL}/users/${walletAddress}/positions/`);
                if (!res.ok) throw new Error(`Failed to fetch positions: ${res.status}`);
                const data = await res.json();
                setPositions(data);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPositions();
    }, [walletAddress]);

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
                    My Positions
                </Heading>

                {loading ? (
                    <Text>Loading positions...</Text>
                ) : positions.length > 0 ? (
                    <Column gap="16" fillWidth>
                        <Row href="/" gap="8" horizontal="start" paddingY="8" borderBottom="neutral-alpha-weak">
                            <Text style={{ width: "50%", fontWeight: "bold" }}>Market</Text>
                            <Text style={{ width: "15%", fontWeight: "bold" }}>Vote</Text>
                            <Text style={{ width: "20%", fontWeight: "bold" }}>Position (SOL)</Text>
                            <Text style={{ width: "15%", fontWeight: "bold" }}>&nbsp;</Text>
                        </Row>

                        {positions.map((position) => (
                            <div key={position.claim_id}>
                                <Row paddingY="8" vertical="center">
                                    <Column style={{ width: "50%" }}>
                                    <Text >
                                        {position.claim_text.length > 256
                                            ? position.claim_text.substring(0, 256) + "..."
                                            : position.claim_text}
                                    </Text>
                                    </Column>
                                    <Column style={{ width: "15%" }}>
                                    <Text
                                        style={{
                                            fontWeight: "bold",
                                            color: position.side === "TRUE" ? "green" : "red",
                                        }}
                                    >

                                        {position.side}
                                    </Text>
                                    </Column>
                                    <Column style={{ width: "20%" }}>
                                    <Text style={{ fontWeight: "bold" }}>
                                        {parseFloat(position.cost_basis).toFixed(2)} SOL
                                    </Text>
                                    </Column>
                                    <Column style={{ width: "15%" }}>
                                        <Button
                                            onClick={() => router.push(`/claims/${position.claim_slug}`)}
                                            variant="primary"
                                            label={"View market"}
                                        />
                                    </Column>
                                </Row>
                                <Flex fillWidth gap="16" vertical="center">
                                    <Line background="neutral-alpha-weak" />
                                </Flex>
                            </div>
                        ))}
                    </Column>
                ) : (
                    <Text>No positions found.</Text>
                )}
            </Column>
        </Column>
    );
}
