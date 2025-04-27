// ----- File: src\components\Common\ErrorMessage.jsx -----
import React from 'react';
import { Alert, AlertTitle, Collapse } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // More prominent icon

const ErrorMessage = ({ error, title = "Error" }) => {
  const hasError = !!error;
  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';

  return (
    // Use Collapse for smooth appearance/disappearance
    <Collapse in={hasError}>
        <Alert
            severity="error"
            icon={<ReportProblemIcon fontSize="inherit" />} // Custom icon
            sx={{
                mt: 2,
                mb: 2,
                // Improve visual prominence
                border: (theme) => `1px solid ${theme.palette.error.dark}`,
                bgcolor: 'error.lighter', // Use theme-defined lighter error background if available
                '& .MuiAlert-message': { // Ensure message area takes full width
                    width: '100%',
                },
            }}
            // You might add an action button, e.g., to dismiss or retry
            // action={
            //   <Button color="inherit" size="small">
            //     RETRY
            //   </Button>
            // }
        >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>
        {message}
        {/* Optional: Display more details if error is an object */}
        {typeof error === 'object' && error?.details && (
            <pre style={{ fontSize: '0.75rem', marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(error.details, null, 2)}
            </pre>
        )}
        </Alert>
    </Collapse>
  );
};

export default ErrorMessage;