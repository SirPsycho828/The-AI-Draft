import { describe, it, expect } from 'vitest';

const linkedinSlugRegex = /^[a-z0-9]([a-z0-9-]{0,98}[a-z0-9])?$/i;
const xHandleRegex = /^[a-zA-Z0-9_]{1,15}$/;
const linkedinUrlRegex = /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;

describe('LinkedIn slug validation', () => {
  it('accepts valid slugs', () => {
    expect(linkedinSlugRegex.test('yann-lecun')).toBe(true);
    expect(linkedinSlugRegex.test('satya-nadella-3145136')).toBe(true);
    expect(linkedinSlugRegex.test('a')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(linkedinSlugRegex.test('')).toBe(false);
    expect(linkedinSlugRegex.test('../etc/passwd')).toBe(false);
    expect(linkedinSlugRegex.test('slug with spaces')).toBe(false);
    expect(linkedinSlugRegex.test('slug<script>')).toBe(false);
  });
});

describe('X handle validation', () => {
  it('accepts valid handles', () => {
    expect(xHandleRegex.test('kaborjuste')).toBe(true);
    expect(xHandleRegex.test('elonmusk')).toBe(true);
    expect(xHandleRegex.test('_underscore_')).toBe(true);
  });

  it('rejects invalid handles', () => {
    expect(xHandleRegex.test('')).toBe(false);
    expect(xHandleRegex.test('way_too_long_handle_name')).toBe(false);
    expect(xHandleRegex.test('has spaces')).toBe(false);
    expect(xHandleRegex.test('special!chars')).toBe(false);
  });
});

describe('LinkedIn URL validation', () => {
  it('accepts valid LinkedIn URLs', () => {
    expect(linkedinUrlRegex.test('https://www.linkedin.com/in/yann-lecun')).toBe(true);
    expect(linkedinUrlRegex.test('https://linkedin.com/in/yann-lecun')).toBe(true);
    expect(linkedinUrlRegex.test('https://www.linkedin.com/company/openai')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(linkedinUrlRegex.test('http://linkedin.com/in/someone')).toBe(false);
    expect(linkedinUrlRegex.test('https://evil.com/in/someone')).toBe(false);
    expect(linkedinUrlRegex.test('not-a-url')).toBe(false);
  });
});
