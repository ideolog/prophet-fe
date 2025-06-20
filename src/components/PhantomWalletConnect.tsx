"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Button, Flex, Text, UserMenu, Option, Avatar, Line, Dropdown } from "@/once-ui/components";

const WalletContext = createContext(null);

export function useWallet() {
    return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkWalletStatus = async () => {
            try {
                const provider = (window as any)?.solana;
                if (provider?.isPhantom) {
                    const savedWallet = localStorage.getItem("phantom_wallet");
                    if (provider.isConnected && savedWallet) {
                        setWalletAddress(savedWallet);
                    } else {
                        const response = await provider.connect({ onlyIfTrusted: true });
                        if (response?.publicKey) {
                            const connectedWallet = response.publicKey.toString();
                            setWalletAddress(connectedWallet);
                            localStorage.setItem("phantom_wallet", connectedWallet);
                        }
                    }
                }
                // ✅ Silent skip if Phantom is not available
            } catch (error) {
                setWalletAddress(null);
            }
        };

        checkWalletStatus();
        window.addEventListener("focus", checkWalletStatus);
        return () => window.removeEventListener("focus", checkWalletStatus);
    }, []);

    return (
        <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
            {children}
        </WalletContext.Provider>
    );
}

export default function PhantomWalletConnect() {
    const { walletAddress, setWalletAddress } = useWallet();
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);


    const connectWallet = async () => {
        const provider = (window as any)?.solana;

        if (!provider || !provider.isPhantom) {
            alert("Phantom Wallet not detected, skipping wallet connection.");
            return;
        }

        try {
            const response = await provider.connect();
            const walletAddress = response.publicKey.toString();
            const message = `Sign this message to authenticate with CrowdProphet: ${new Date().toISOString()}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await provider.signMessage(encodedMessage, "utf8");

            if (signedMessage) {
                setWalletAddress(walletAddress);
                localStorage.setItem("phantom_wallet", walletAddress);
            } else {
                throw new Error("Message signing failed.");
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
        }
    };


    const disconnectWallet = async () => {
        if ("solana" in window) {
            const provider = (window as any).solana;
            if (provider && provider.isConnected) {
                await provider.disconnect();
            }
        }

        setWalletAddress(null);
        localStorage.removeItem("phantom_wallet");
        setAvatarSrc(null);
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div>
            {walletAddress ? (
                <UserMenu
                    name={shortenAddress(walletAddress)}
                    subline="Wallet connected"
                    tagProps={{
                        label: '0',
                        variant: 'brand'
                    }}
                    avatarProps={{
                        empty: !avatarSrc,
                        loading: !avatarSrc,
                        src: avatarSrc || ""
                    }}
                    dropdown={
                        <>
                            <Dropdown
                                padding="2"
                                radius="1"
                                width="400px"
                                gap="2"
                            >
                                <Option
                                    value="my-positions"
                                    label="My positions"
                                    href="/my-positions"
                                />

                                <Line />
                                <Option
                                    label="Disconnect"
                                    onClick={disconnectWallet}
                                />
                            </Dropdown>
                        </>
                    }
                />
            ) : (
                <Button variant="secondary" onClick={connectWallet}>
                    Connect Phantom Wallet
                </Button>
            )}
        </div>
    );
}
