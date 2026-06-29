declare global {
  interface CloudflareEnv {
    BACKEND: Fetcher;
    API_BASE_URL: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    SITE_URL: string;
  }
}

export {};
