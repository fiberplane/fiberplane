import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b flex items-center px-2 py-1">
        <Link
          to="/"
          className="flex items-center gap-2 hover:bg-muted py-1 px-2 rounded-lg"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="logoTitle"
          >
            <title id="logoTitle">Fiberplane logo</title>
            <rect width="32" height="32" rx="8" fill="#FF5733" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7 14.5V17L16.5 17.1L17.1 14.5H7ZM7 9V11.5L17.7 11.6L17.8 11.1C18 10 17.2 9 16.1 9H7ZM16 19.5L16.6 17L22.5 17.1L21.6 19.5H16ZM17.1 14.5L17.7 11.6L26 11.5L25 14.5H17.1ZM7 19.5V22H15L15.6 19.5H7ZM19 25H17.2C15.9 25 15 23.7 15.3 22.4H20L19 25Z"
              fill="white"
            />
          </svg>
          <span className="font-medium">Agent Playground</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
