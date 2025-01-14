import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from 'classnames';
import { headers } from "next/headers";
import { Metadata } from "next";

import { baseURL, style, meta, og, schema, social } from "@/once-ui/resources/config"

import { Background, Flex } from '@/once-ui/components'

import { Inter } from 'next/font/google'
import { Roboto_Mono } from 'next/font/google';
import { DM_Sans } from 'next/font/google';
import { Lora } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';



const code = Roboto_Mono({
	variable: '--font-code',
	subsets: ['latin'],
	display: 'swap',
});

type FontConfig = {
    variable: string;
};

const primary = DM_Sans({
	variable: '--font-primary',
	subsets: ['latin'],
	display: 'swap'
});

const secondary = Lora({
	variable: '--font-secondary',
	subsets: ['latin'],
	display: 'swap'
});

const tertiary = Playfair_Display({
	variable: '--font-tertiary',
	subsets: ['latin'],
	display: 'swap'
});


export async function generateMetadata(): Promise<Metadata> {
	const host = (await headers()).get("host");
	const metadataBase = host ? new URL(`https://${host}`) : undefined;

	return {
		title: meta.title,
		description: meta.description,
		openGraph: {
			title: og.title,
			description: og.description,
			url: 'https://' + baseURL,
			type: og.type as
				| "website"
				| "article"
				| "book"
				| "profile"
				| "music.song"
				| "music.album"
				| "music.playlist"
				| "music.radio_station"
				| "video.movie"
				| "video.episode"
				| "video.tv_show"
				| "video.other",
		},
		metadataBase,
	};
}

const schemaData = {
	"@context": "https://schema.org",
	"@type": schema.type,
	"url": "https://" + baseURL,
	"logo": schema.logo,
	"name": schema.name,
	"description": schema.description,
	"email": schema.email,
	"sameAs": Object.values(social).filter(Boolean)
};

export default function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {
	return (
		<Flex
			as="html" lang="en"
			fillHeight background="page"
			data-scaling={style.scaling}
			data-theme="dark"
			data-brand="violet"
			data-accent="green"
			data-neutral="sand"
			data-border="playful"
			data-solid="color"
			data-solid-style="flat"
			data-surface="translucent"
			data-transition="all"

			className={classNames(
				primary.variable, code.variable,
				secondary ? secondary.variable : '',
				tertiary ? tertiary.variable : ''
			)}>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
				/>
			</head>
			<Flex
				as="body"
				fillWidth fillHeight margin="0" padding="0">
				<Background
					style={{zIndex: '-1'}}
					position="fixed"
					mask="cursor"
					dots={{
						display: true,
						opacity: 0.4,
						size: '20'
					}}
					gradient={{
						display: true,
						opacity: 0.4,
					}}/>
				<Flex
					flex={1} direction="column">
					{children}
				</Flex>
			</Flex>
		</Flex>
	);
}