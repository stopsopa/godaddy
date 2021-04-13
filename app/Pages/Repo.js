
import React, {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

import {
  fetchJson,
  proxyJson,
} from '../lib/transport';

import './Repo.scss'

import Menu from './Menu'

export default function Repos() {

  const params = useParams();

  const [ repo, setRepo ] = useState();

  const [ loading, setLoading ] = useState(true);

  const [ error, setError ] = useState();

  const name = (function () {

    try {

      if (typeof params.name === 'string' && params.name.trim()) {

        return params.name;
      }
    }
    catch (e) {}
  }());

  useEffect(() => {

    (async function () {

      if ( ! name ) {

        return;
      }

      const url = `https://api.github.com/repos/${env('API_ORG')}/${name}`

      try {

        // https://docs.github.com/en/rest/reference/repos
        const repo = await proxyJson(`${url}`);

        setRepo(repo);

        console.log('==repo: ', repo)
      }
      catch (e) {

        console.log('e: ', e);
      }

      setLoading(false);
    }());

  }, []);

  return (
    <Menu>
      {repo ? (
        <div className="repo">
          <div className="name">{repo.name}</div>
          <div className="description">{repo.description}</div>
          <a className="link" href={repo.html_url}>{repo.html_url}</a>
          <div className="language">Language: {repo.language}</div>
          <div className="forks">Is fork: {repo.fork ? 'Yes' : 'No'}, forks: {repo.forks}</div>
          <div className="watchers">Watchers: {repo.watchers}</div>
          <div className="issues">Open issues: {repo.open_issues_count}</div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </Menu>
  );
}


