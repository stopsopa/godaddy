
const {
  fetchJson,
} = require('../fetchJsonForTests');

describe('api', () => {

  test('organisation', async done => {

    const json = await fetchJson(`https://api.github.com/orgs/godaddy`);

    expect({
      name    : json.body.name,
      html_url: json.body.html_url,
      type    : json.body.type,
    }).toEqual({
      name: 'GoDaddy',
      html_url: 'https://github.com/godaddy',
      type: 'Organization',
    });

    done();
  });
});