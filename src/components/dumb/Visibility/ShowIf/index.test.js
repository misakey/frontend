import { isWidthBetween, isWidthOnly } from '.';

describe('isWidthBetween', () => {
  it('matches when needed', () => {
    const width = 'sm';
    const isWidth = { between: ['sm', 'md'] };

    // Match [sm, md + 1[
    //       [sm, lg[
    //       [600px, 1280px[
    expect(isWidthBetween(width, ...isWidth.between)).toBe(true);
  });
  it('rejects when needed', () => {
    const width = 'sm';
    const isWidth = { between: ['md', 'lg'] };
    expect(isWidthBetween(width, ...isWidth.between)).toBe(false);
  });
});

describe('isWidthOnly', () => {
  it('matches when needed', () => {
    const width = 'sm';
    const isWidth = { only: 'sm' };
    expect(isWidthOnly(width, isWidth.only)).toBe(true);
  });
  it('rejects when needed', () => {
    const width = 'sm';
    const isWidth = { only: 'md' };
    expect(isWidthOnly(width, isWidth.only)).toBe(false);
  });
});
