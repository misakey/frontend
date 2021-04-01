import parseUrlFromLocation from '.';

const URLS = [
  ['https://example.org/airport.php', 'example.org'],
  ['https://example.com/', 'example.com'],
  ['http://www.example.com/airport/bee.aspx', 'www.example.com'],
  ['https://apparel.example.com/acoustics.html', 'apparel.example.com'],
  ['https://example.net/', 'example.net'],
  ['http://www.example.com/back.html', 'www.example.com'],
  ['http://www.example.com/amusement', 'www.example.com'],
  ['https://www.example.net/bells/achiever.htm?ball=bear&bomb=birthday', 'www.example.net'],
  ['http://www.example.com/beds/appliance.aspx', 'www.example.com'],
  ['https://www.example.edu/#baby', 'www.example.edu'],
  ['https://www.example.net/', 'www.example.net'],
  ['http://example.com/apparatus/birds.php', 'example.com'],
  ['http://example.com/balance#basketball', 'example.com'],
  ['https://www.example.com/beef.html', 'www.example.com'],
  ['http://www.example.com/afterthought/beef.html#authority', 'www.example.com'],
  ['http://example.org/bubble/beef', 'example.org'],
  ['/', window.location.hostname],
];

describe.each(URLS)('parseUrlFromLocation(%s)', (url, expected) => {
  test(`returns ${expected}`, () => {
    expect(parseUrlFromLocation(url).hostname).toBe(expected);
  });
});
