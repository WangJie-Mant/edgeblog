import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface CardProps {
  title: string;
  degistion?: string;
  date: string;
  link?: string;
  imageSrc?: string;
  markdown?: string;
  markdownComponents?: Components;
  markdownClassName?: string;
  actions?: React.ReactNode;
  content?: React.ReactNode;
  topRight?: React.ReactNode;
  className?: string;
}

export default function Card({
  title,
  degistion,
  date,
  link,
  imageSrc,
  markdown,
  markdownComponents,
  markdownClassName,
  actions,
  content,
  topRight,
  className,
}: CardProps) {
  const hasTitle = title?.trim().length > 0;
  const hasDate = date?.trim().length > 0;
  return (
    <div
      className={`card bg-base-100 shadow-sm w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-5xl mx-auto my-4 ${className ?? ""}`}
    >
      {imageSrc && (
        <figure className="w-full">
          <img src={imageSrc} alt={title} className="w-full object-contain" />
        </figure>
      )}

      <div className="card-body relative">
        {topRight ? (
          <div className="absolute right-6 top-6">{topRight}</div>
        ) : null}
        {hasDate ? (
          <div className="badge badge-outline w-fit">{date}</div>
        ) : null}
        {hasTitle ? (
          <h2 className="card-title text-2xl sm:text-3xl mb-2 pb-2 border-b border-base-300">
            {title}
          </h2>
        ) : null}
        {content ? (
          content
        ) : markdown ? (
          <div className={`prose max-w-none ${markdownClassName ?? ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkBreaks, remarkGfm]}
              components={markdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-base-content/70">{degistion}</p>
        )}
        {(link || actions) && (
          <div className="card-actions justify-end">
            {actions}
            {link && (
              <a href={link} className="btn btn-sm btn-primary">
                Read More
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
