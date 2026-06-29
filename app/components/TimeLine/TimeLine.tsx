type BlogTimelineItem = {
  date: string; // YYYYMMDD from metadata
  title: string;
  href: string;
};

type Props = {
  items?: BlogTimelineItem[];
};

export default function TimeLine({ items }: Props) {
  const allItems = items ?? [
    { date: "20250205", title: "示例博客 3", href: "/blog/3" },
    { date: "20250118", title: "示例博客 2", href: "/blog/2" },
    { date: "20250102", title: "示例博客 1", href: "/blog/1" },
    { date: "20241201", title: "示例博客 0", href: "/blog/0" },
    { date: "20241115", title: "示例博客 -1", href: "/blog/-1" },
    { date: "20241030", title: "示例博客 -2", href: "/blog/-2" },
    { date: "20241001", title: "示例博客 -3", href: "/blog/-3" },
    { date: "20240910", title: "示例博客 -4", href: "/blog/-4" },
    { date: "20240825", title: "示例博客 -5", href: "/blog/-5" },
  ];

  const sorted = [...allItems].sort((a, b) => (a.date > b.date ? -1 : 1));
  const visible = sorted.slice(0, 8);
  const hasMore = sorted.length > 8;

  const formatDate = (raw: string) => {
    const day = raw.slice(6, 8);
    const month = raw.slice(4, 6);
    return `${month}/${day}`;
  };

  return (
    <div>
      <ul className="timeline timeline-vertical">
        {visible.map((item) => (
          <li key={item.href}>
            <div className="timeline-start">{formatDate(item.date)}</div>
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end timeline-box">
              <a href={item.href}>{item.title}</a>
            </div>
          </li>
        ))}
        {hasMore ? (
          <li key="more">
            <div className="timeline-start" />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end timeline-box">...</div>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
