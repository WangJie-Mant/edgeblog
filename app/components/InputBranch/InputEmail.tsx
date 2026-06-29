import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function InputEmail(props: Props) {
  const { className, placeholder = "mail@site.com", ...rest } = props;
  return (
    <div>
      <label className="input validator">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={2.5}
            fill="none"
            stroke="currentColor"
          >
            <rect width={20} height={16} x={2} y={4} rx={2} />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </g>
        </svg>
        <input
          type="email"
          placeholder={placeholder}
          required
          className={className}
          {...rest}
        />
      </label>
      <div className="validator-hint hidden">Enter a valid email address</div>
    </div>
  );
}
