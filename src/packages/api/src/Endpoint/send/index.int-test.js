import API from '@misakey/api';

window.env = {
  API_ENDPOINT: 'https://api.misakey.com.local',
};

function getApplicationInfo(sendOptions) {
  const endpoint = API.endpoints.application.find;

  return API.use(endpoint).build().send(sendOptions);
}

describe('API send method', () => {
  it('gets a list of application info from Misakey with success', async () => {
    expect.assertions(1);
    await getApplicationInfo({ rawRequest: true })
      .then((response) => expect(response).toBeTruthy());
  });
  it('treats a json response correctly', async () => {
    expect.assertions(1);
    await getApplicationInfo().then((response) => expect(response).toBeTruthy());
  });
});
