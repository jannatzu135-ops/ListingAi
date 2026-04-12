import React from "react";
import ReactMarkdown from "react-markdown";

export const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;
  return (
    <ReactMarkdown
      children={content}
      components={{
        li: ({ children }) => {
          const processChildren = (nodes: any): any => {
            return React.Children.map(nodes, (node) => {
              if (typeof node === "string") {
                // Handle cases where multiple attributes are joined by " - " or " | "
                if ((node.includes(" - ") || node.includes(" | ")) && node.includes(":")) {
                  const items = node.split(/ - | \| /);
                  return items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    const trimmedItem = item.trim();
                    if (trimmedItem.includes(":") && trimmedItem.split(":")[0].length < 40) {
                      const parts = trimmedItem.split(":");
                      return (
                        <React.Fragment key={idx}>
                          <span className="font-bold">{parts[0].trim()}:</span>
                          {parts.slice(1).join(":")}
                          {!isLast && <br />}
                        </React.Fragment>
                      );
                    }
                    return (
                      <React.Fragment key={idx}>
                        {trimmedItem}
                        {!isLast && <br />}
                      </React.Fragment>
                    );
                  });
                }

                if (
                  node.includes(":") &&
                  node.split(":")[0].length < 40 &&
                  (node.split(":")[0] === node.split(":")[0].toUpperCase() || node.split(":")[0].length > 2)
                ) {
                  const parts = node.split(":");
                  return (
                    <>
                      <span className="font-bold">{parts[0]}:</span>
                      {parts.slice(1).join(":")}
                    </>
                  );
                }
              }
              if (React.isValidElement(node) && (node.props as any).children) {
                return React.cloneElement(node as any, {
                  children: processChildren((node.props as any).children),
                });
              }
              return node;
            });
          };

          return <li>{processChildren(children)}</li>;
        },
      }}
    />
  );
};
