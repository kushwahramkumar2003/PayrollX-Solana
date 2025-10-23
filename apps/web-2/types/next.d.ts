declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingViewport {
    width?: string;
    initialScale?: number;
  }
}

declare module "next/types.js" {
  export interface NextConfig {
    experimental?: {
      appDir?: boolean;
    };
  }

  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface ResolvingViewport {
    width?: string;
    initialScale?: number;
  }
}

declare module "next/server" {
  export class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit);
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string): void;
    };
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}

declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string; url?: string }>;
  }

  export interface NextConfig {
    reactStrictMode?: boolean;
    swcMinify?: boolean;
    eslint?: {
      ignoreDuringBuilds?: boolean;
    };
    typescript?: {
      ignoreBuildErrors?: boolean;
    };
    experimental?: {
      appDir?: boolean;
    };
    output?: "export" | "standalone";
    trailingSlash?: boolean;
    images?: {
      unoptimized?: boolean;
      domains?: string[];
      formats?: string[];
    };
    compiler?: {
      removeConsole?: boolean | { exclude?: string[] };
    };
    headers?: () => Promise<
      Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>
    >;
    webpack?: (config: any) => any;
    env?: Record<string, string>;
  }
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module "next/link" {
  import { ComponentProps } from "react";
  export interface LinkProps extends ComponentProps<"a"> {
    href: string;
    className?: string;
    children: React.ReactNode;
  }
  export default function Link(props: LinkProps): JSX.Element;
}

declare module "next/server" {
  export class NextRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit);
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string): void;
    };
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}

declare module "next/font/local" {
  interface LocalFont {
    variable: string;
  }
  export default function localFont(config: {
    src: string;
    variable: string;
  }): LocalFont;
}
