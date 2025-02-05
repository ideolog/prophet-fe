"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Button, Flex, Text, UserMenu, Option, Avatar, Line } from "@/once-ui/components";
import { signIn, signOut } from "@solana/wallet-standard";

const WalletContext = createContext(null);

export function useWallet() {
    return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkWalletStatus = async () => {
            if ("solana" in window) {
                const provider = (window as any).solana;
                if (provider?.isPhantom) {
                    try {
                        const savedWallet = localStorage.getItem("phantom_wallet");
                        if (provider.isConnected && savedWallet) {
                            setWalletAddress(savedWallet);
                        } else {
                            const response = await provider.connect({ onlyIfTrusted: true });
                            if (response?.publicKey) {
                                const connectedWallet = response.publicKey.toString();
                                setWalletAddress(connectedWallet);
                                localStorage.setItem("phantom_wallet", connectedWallet);
                            } else {
                                setWalletAddress(null);
                                localStorage.removeItem("phantom_wallet");
                            }
                        }
                    } catch (error) {
                        console.log("Phantom Wallet is not connected.");
                        setWalletAddress(null);
                    }
                }
            } else {
                console.error("Phantom Wallet not installed.");
            }
        };

        checkWalletStatus();

        window.addEventListener("focus", checkWalletStatus);

        return () => {
            window.removeEventListener("focus", checkWalletStatus);
        };
    }, []);

    return (
        <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
            {children}
        </WalletContext.Provider>
    );
}

export default function PhantomWalletConnect() {
    const { walletAddress, setWalletAddress } = useWallet();

    const connectWallet = async () => {
        if (!("solana" in window)) {
            alert("Phantom Wallet is not installed!");
            return;
        }

        const provider = (window as any).solana;
        if (!provider?.isPhantom) {
            alert("Please install Phantom Wallet.");
            return;
        }

        try {
            const response = await provider.connect();
            const walletAddress = response.publicKey.toString();

            const message = `Sign this message to authenticate with CrowdProphet: ${new Date().toISOString()}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signedMessage = await provider.signMessage(encodedMessage, "utf8");

            if (signedMessage) {
                console.log("Wallet successfully authenticated.");
                setWalletAddress(walletAddress);
                localStorage.setItem("phantom_wallet", walletAddress);
            } else {
                throw new Error("Message signing failed.");
            }
        } catch (error) {
            console.error("Failed to connect and authenticate wallet:", error);
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
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div>
            {walletAddress ? (
                <UserMenu
                    name={shortenAddress(walletAddress)}
                    size={16}
                    avatarProps={{
                        empty: true
                    }}
                    dropdown={
                        <>
                            <Flex padding="2" fillWidth>
                                <Option
                                    label={<Text as="div" variant="body-strong-m" paddingBottom="2">Disconnect</Text>}
                                    onClick={disconnectWallet}
                                />
                            </Flex>
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
