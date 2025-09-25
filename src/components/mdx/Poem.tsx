"use client";

import { load } from "jinrishici";
import { useEffect, useState } from "react";

interface PoemOrigin {
	title: string;
	dynasty: string;
	author: string;
	content: string[];
	translate: string[];
}

interface PoemData {
	id: string;
	content: string;
	popularity: number;
	origin: PoemOrigin;
	matchTags: string[];
	recommendedReason: string;
	cacheAt: string;
}

interface PoemResult {
	status: string;
	data: PoemData;
	token: string;
	ipAddress: string;
}

export default function Poem() {
	const [poem, setPoem] = useState<PoemResult | null>(null);

	useEffect(() => {
		load((result: PoemResult) => {
			setPoem(result);
		});
	}, []);

	return (
		<section className="flex">
			{poem ? (
				<p>
					「{poem.data.content}」 —— {poem.data.origin.author}《
					{poem.data.origin.title}》
				</p>
			) : (
				<p>Loading poem...</p>
			)}
		</section>
	);
}
