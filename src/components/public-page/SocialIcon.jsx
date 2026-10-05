export default function SocialIcon({ platform }) {
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          fill="currentColor"
          d="M14.2 8.1V6.7c0-.7.5-.9.9-.9h2.2V2.2L14.2 2c-3.4 0-4.1 2.5-4.1 4.1v2H7.4v3.8h2.7V22h4.1V11.9h3.4l.5-3.8h-3.9Z"
        />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          fill="currentColor"
          d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8a5.6 5.6 0 0 1-5.6 5.6H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Zm0 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm8.9 2.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.1A4.9 4.9 0 1 1 12 17a4.9 4.9 0 0 1 0-9.8Zm0 2A2.9 2.9 0 1 0 12 15a2.9 2.9 0 0 0 0-5.8Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.7 4.5 12 4.5 12 4.5s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .4 4.9A3 3 0 0 0 4.5 19c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.4-4.9ZM10 15.3V8.7l5.8 3.3L10 15.3Z"
      />
    </svg>
  );
}
