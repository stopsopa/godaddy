
import React from 'react';

const {
  fetchJson,
} = require('../fetchJsonForTests');

import { render, screen } from '../test-utils'

import ReposView from '../../app/Pages/ReposView'

describe('repo', () => {

  test('loading', async done => {

    render(<ReposView />);

    expect(document.body.innerHTML).toMatchSnapshot();

    done();
  });
});

describe('repo', () => {

  test('repo component', async done => {

    const json = await fetchJson(`https://api.github.com/orgs/godaddy/repos`);

    render(<ReposView
      list={json.body}
      page={1}
      pages={5}
    />);

    expect(document.body.innerHTML).toMatchSnapshot();

    done();
  });
});