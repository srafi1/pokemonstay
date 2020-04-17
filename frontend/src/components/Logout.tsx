import React from 'react';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';

function Logout(props: any) {
  fetch('/api/logout')
  .then((res: Response) => {
    if (res.status === 200) {
      props.history.push('/login');
    }
  })
  return <Loading />; 
}

export default withRouter(Logout);
