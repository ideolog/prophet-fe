"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Text, Button, Row } from "@/once-ui/components";
import PhantomWalletConnect from "@/components/PhantomWalletConnect";

export default function Navigation() {
    const router = useRouter();

    return (
        <Row position="fixed" top="0" fillWidth horizontal="center" zIndex={3} paddingBottom="20">
            <Row data-border="rounded" horizontal="space-between" maxWidth="l" paddingRight="64" paddingLeft="32" paddingY="20">
                <Text size="l" weight="bold" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>CrowdProphet</Text>
                <Row gap="12">
                    <Button href="/markets" size="s" label="Markets" variant="tertiary" />
                    <Button href="/create-claim" size="s" label="Create Claim" variant="tertiary" />
                    <PhantomWalletConnect onWalletConnected={(walletAddress) => console.log(walletAddress)} />
                </Row>
            </Row>
        </Row>
    );
}
