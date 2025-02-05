"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Text,
    Button,
    Row,
    Column,
    Card,
    Background,
    Tag,
    Grid,
    Heading
} from "@/once-ui/components";
import ProphetNavigation from "@/components/ProphetNavigation";

const API_URL = "http://localhost:8000/api";

export default function MarketsPage() {
    const [markets, setMarkets] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const response = await fetch(`${API_URL}/markets/`);
                const data = await response.json();
                setMarkets(data);
            } catch (error) {
                console.error("Error fetching markets:", error);
            }
        };

        fetchMarkets();
    }, []);

    const generateRandomStats = () => {
        const truePercentage = Math.floor(Math.random() * 101);
        const falsePercentage = 100 - truePercentage;
        return { truePercentage, falsePercentage };
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
                    Narrative Markets
                </Heading>

                <Grid columns={3} gap="32">
                    {markets.map((market) => {
                        const { truePercentage, falsePercentage } = generateRandomStats();
                        return (
                            <Card
                                key={market.id}
                                padding="32"
                                radius="xl"
                                shadow="lg"
                                style={{ cursor: "pointer", transition: "transform 0.2s", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                                onClick={() => router.push(`/claims/${market.claim_slug}`)}
                            >
                                <Column gap="16" fillWidth>
                                    <Text align="left" size="m">
                                        {market.claim_text}
                                    </Text>
                                    <Row gap="12" horizontal="start">
                                        <Tag variant="success" size="m" label={`TRUE ${truePercentage}%`} />
                                        <Tag variant="warning" size="m" label={`FALSE ${falsePercentage}%`} />
                                    </Row>
                                    <Row horizontal="end">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/claims/${market.claim_slug}`);
                                            }}
                                            variant="secondary"
                                            size="m"
                                            label="View Market"
                                            suffixIcon="chevronRight"
                                        />
                                    </Row>
                                </Column>
                            </Card>
                        );
                    })}
                </Grid>
            </Column>
        </Column>
    );
}
