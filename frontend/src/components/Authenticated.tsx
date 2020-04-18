import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';

function Authenticated(props: any) {
  const [checkAuth, setCheckAuth] = useState(true);
  if (checkAuth) {
    fetch('/api/auth', {
      method: 'POST',
      credentials: 'same-origin',
    })
    .then((res: Response) => {
      setCheckAuth(false);
      if (res.status !== 200) {
        props.history.push('/login');
      }
    })
    return <Loading />;
  } else {
    return <props.component />;
  }
}

export default withRouter(Authenticated);
