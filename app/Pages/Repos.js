
import React, {
  useEffect,
  useState,
} from 'react';

import {
  NavLink,
  Redirect,
  useParams,
} from 'react-router-dom';

import {
  fetchJson,
  proxyJson,
} from '../lib/transport';

import './Repos.scss'

import Menu from './Menu'

const PER_PAGE = 10;

export default function Repos() {

  const params = useParams();

  let [ org, setOrg ] = useState();

  const [ list, setList ] = useState();

  const [ loading, setLoading ] = useState(true);

  const [ error, setError ] = useState();

  const pages = (function () {
    try {

      return Math.ceil(org.public_repos / PER_PAGE);
    }
    catch (e) {}
  }());

  const page = (function () {

    try {

      if (/^\d+$/.test(params.page)) {

        const page = parseInt(params.page, 10);

        if (page > 0) {

          return page;
        }
      }
    }
    catch (e) {}

    return 1;
  }());

  useEffect(() => {

    (async function () {

      const url = `https://api.github.com/orgs/${env('API_ORG')}`

      try {

        let _org;

        if ( ! org ) {

          _org = await proxyJson(url);

          setOrg(_org);
        }

        org = _org || org;

        // https://docs.github.com/en/rest/reference/repos
        const list = await proxyJson(`${url}/repos?per_page=${PER_PAGE}&page=${page}&sort=created&direction=desc`);

        setList(list);
      }
      catch (e) {

        console.log('e: ', e);
      }

      setLoading(false);
    }());

  }, [page]);

  if (page > pages) {

    return <Redirect to="/repos/1" />
  }

  return (
    <Menu>
      {list ? (
        <>
          <div className="repo-list">
            <div className="list">
              {list.map(repo => (
                <div key={repo.node_id} className="repo">
                  <a className="name" href={`/repo/${repo.name}`}>{repo.name}</a>
                  <div className="description">{repo.description}</div>
                </div>
              ))}
            </div>
            <div className="pagination">
              {(function () {
                const buttons = [];
                for (let i = 1 ; i <= pages ; i += 1 ) {
                  buttons.push(i);
                }
                return buttons;
              }()).map(i => (<NavLink key={i} to={`/repos/${i}`} activeClassName="active">{i}</NavLink>))}
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </Menu>
  );
}


