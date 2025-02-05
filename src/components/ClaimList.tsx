"use client";

import React from "react";
import Link from "next/link";
import { Flex, Text, Tag } from "@/once-ui/components";

interface Claim {
    id: number;
    slug: string;
    text: string;
    verification_status_name: string;
    status_description?: string;
}

interface ClaimListProps {
    claims: Claim[];
    loading: boolean;
}

export default function ClaimList({ claims, loading }: ClaimListProps) {
    if (loading) {
        return <Text>Loading claims...</Text>;
    }

    if (claims.length === 0) {
        return <Text>No claims have been submitted yet.</Text>;
    }

    return (
        <Flex direction="column" fillWidth gap="16">
        {claims.map((claim) => (
                <Link key={claim.id} href={`/claims/${claim.slug}`} passHref>
    <Flex
        as="a"
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
        </Link>
))}
    </Flex>
);
}
