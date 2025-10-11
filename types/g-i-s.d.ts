declare module 'g-i-s' {
  interface GisOptions {
    searchTerm: string;
    queryStringAddition?: string;
    filterOutDomains?: string[];
    urlMatch?: RegExp;
    noRedirect?: boolean;
    safe?: string;
    additional_params?: Record<string, string>;
  }

  interface GisImageResult {
    url: string;
    width: number;
    height: number;
    type: string;
    thumbnail: string;
    domain: string;
    parentPage: string;
    title: string;
  }

  type GisCallback = (error: Error | null, results: GisImageResult[]) => void;

  function gis(options: string | GisOptions, callback: GisCallback): void;

  export = gis;
}