
import React from 'react';

import {
  NavLink,
  Link,
  Redirect,
  useParams,
} from 'react-router-dom';

import Menu from './Menu'

export default function ReposView({
  list,
  page,
  pages,
}) {
  return (
    <Menu>
      {list ? (
        <>
          <div className="repo-list">
            <div className="list">
              {list.map(repo => (
                <div key={repo.node_id} className="repo">
                  <Link className="name" to={`/repo/${repo.name}`}>{repo.name}</Link>
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


