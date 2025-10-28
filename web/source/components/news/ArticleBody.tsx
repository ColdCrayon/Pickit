import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeExternalLinks from "rehype-external-links";

export default function ArticleBody({ markdown = "" }: { markdown?: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeExternalLinks,
            { target: "_blank", rel: ["noopener", "noreferrer", "nofollow"] },
          ],
          rehypeSanitize,
        ]}
        components={{
          img: (props) => (
            <img loading="lazy" className="rounded-md my-4" {...props} />
          ),
          a: (props) => <a className="text-yellow-400 underline" {...props} />,
          h1: ({ node, ...p }) => (
            <h2 className="mt-8 mb-4 text-2xl font-semibold" {...p} />
          ),
          h2: ({ node, ...p }) => (
            <h3 className="mt-6 mb-3 text-xl font-semibold" {...p} />
          ),
          code: ({ node, ...p }) =>
            node && (node as any).inline ? (
              <code className="px-1 py-0.5 rounded bg-neutral-800" {...p} />
            ) : (
              <code
                className="block p-3 rounded bg-neutral-900 overflow-x-auto"
                {...p}
              />
            ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
