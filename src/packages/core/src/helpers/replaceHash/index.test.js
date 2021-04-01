import replaceHash from '.';

describe('test helper replaceHash', () => {
  beforeAll(() => {
    global.window = Object.create(window);
  });

  it('should return current url with no changes', () => {
    expect(replaceHash()).toEqual(window.location.href);
    expect(replaceHash('#mynewhash')).toEqual(window.location.href);
    expect(replaceHash('#mynewhash', undefined, true)).toEqual(`${window.location.href}#mynewhash`);
  });

  it('should remove hash from current url', () => {
    const currentUrl = 'https://app.misakey.com.local/boxes#test';
    Object.defineProperty(window, 'location', {
      value: {
        href: currentUrl,
      },
    });
    expect(replaceHash()).toEqual('https://app.misakey.com.local/boxes');
  });


  it('should replace hash for current url', () => {
    expect(replaceHash('#replacedHash')).toEqual('https://app.misakey.com.local/boxes#replacedHash');
  });

  it('should remove hash from given url', () => {
    const url = 'https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8';
    expect(replaceHash(undefined, url))
      .toEqual('https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88');

    expect(replaceHash(undefined, '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8'))
      .toEqual('/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88');
  });

  it('should replace hash from given url', () => {
    const url = 'https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8';
    expect(replaceHash('#replacedHash', url))
      .toEqual('https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#replacedHash');

    expect(replaceHash('#replacedHash', '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8'))
      .toEqual('/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#replacedHash');
  });

  it('should return given url with no changes', () => {
    const urlWithNoHash = 'https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88';
    expect(replaceHash(undefined, urlWithNoHash)).toEqual(urlWithNoHash);
  });

  it('should radd hash to url', () => {
    const urlWithNoHash = 'https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88';
    expect(replaceHash('#myhash', urlWithNoHash, true)).toEqual(`${urlWithNoHash}#myhash`);
  });
});
