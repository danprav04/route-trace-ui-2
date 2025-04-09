import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ error, title = "Error" }) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message || 'An unexpected error occurred.';

  return (
    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;