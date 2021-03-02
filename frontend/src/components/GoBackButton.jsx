import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const GoBackButton = () => {
  const history = useHistory();

  return (
    <Button
      className='btn btn-dark my-3'
      onClick={() => {
        history.goBack();
      }}
    >
      Go Back
    </Button>
  );
};

export default GoBackButton;
