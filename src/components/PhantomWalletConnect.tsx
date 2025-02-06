"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { Button, Flex, Text, UserMenu, Option, Avatar, Line } from "@/once-ui/components";
import jazzicon from "@metamask/jazzicon";

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
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

    useEffect(() => {
        if (walletAddress) {
            const seed = parseInt(walletAddress.slice(2, 10), 16);
            const icon = jazzicon(40, seed);
            const svgElement = new XMLSerializer().serializeToString(icon);
            const svgBlob = new Blob([svgElement], { type: "image/svg+xml;charset=utf-8" });
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64data = reader.result;
                const fileName = `${walletAddress}.svg`;
                fetch('/api/save-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName, data: base64data })
                }).then(response => {
                    if (response.ok) {
                        setAvatarSrc(`/images/avatars/${fileName}`);
                    }
                });
            };

            reader.readAsDataURL(svgBlob);
        }
    }, [walletAddress]);

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
