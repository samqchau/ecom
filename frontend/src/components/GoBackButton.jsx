import React from 'react';
import { Link, useHistory } from 'react-router-dom';

const GoBackButton = () => {
  const history = useHistory();

  return (
    <Link
      className='btn btn-dark my-3'
      onClick={() => {
        history.goBack();
      }}
    >
      Go Back
    </Link>
  );
};

export default GoBackButton;
