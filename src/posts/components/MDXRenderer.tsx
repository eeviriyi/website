import { MDXContent } from "@content-collections/mdx/react";
import { mdxComponents } from "./mdx-components";

interface MDXRendererProps {
    code: string;
}

export function MDXRenderer({ code }: MDXRendererProps) {
    return (
        <div className="prose">
            <MDXContent code={code} components={mdxComponents} />
        </div>
    );
}