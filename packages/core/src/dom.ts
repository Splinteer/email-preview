import * as cheerio from 'cheerio';

export type CheerioRoot = ReturnType<typeof cheerio.load>;

export function loadHtml(html: string): CheerioRoot {
  return cheerio.load(html);
}

export function serializeHtml($: CheerioRoot): string {
  return $.html();
}
