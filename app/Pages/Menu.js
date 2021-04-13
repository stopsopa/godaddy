
import React from 'react';

import {
  Link,
} from 'react-router-dom';

export default function Repos({
  children
}) {
  return (
    <div>
      <Link to="/">Homepage</Link>
      <hr/>
      {children}
    </div>
  );
}


