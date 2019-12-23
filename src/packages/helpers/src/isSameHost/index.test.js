import isSameHost from '.';

const HREF = [
  ['https://example.org/airport.php', 'http://example.org/bubble/beef', true],
  ['https://www.example.net/bells/achiever.htm?ball=bear&bomb=birthday', 'http://www.example.net', true],
  ['https://apparel.example.com/acoustics.html', 'http://apparel.example.com/acoustics.html', true],
  ['http://www.example.com/afterthought/beef.html#authority', 'http://www.example.com', true],
  [window.location.href, '/', true],
  [window.location.href, undefined, true],
  ['https://example.org/airport.php', 'http://example.net/bubble/beef', false],
  ['https://www.example.net/bells/achiever.htm?ball=bear&bomb=birthday', 'example.net', false],
  ['https://apparel.example.com/acoustics.html', 'example.com', false],
  ['http://www.example.com/afterthought/beef.html#authority', 'http://example.co', false],
  ['http://example.com', '/', false],
  ['http://example.com', undefined, false],
];

describe.each(HREF)('isSameHost(%s, %s)', (a, b, expected) => {
  test(`returns ${expected}`, () => {
    expect(isSameHost(a, b)).toBe(expected);
  });
});
