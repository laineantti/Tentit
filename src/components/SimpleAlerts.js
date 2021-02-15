import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function SimpleAlerts(message) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* <Alert severity="error">This is an error alert — check it out!</Alert>
      <Alert severity="warning">This is a warning alert — check it out!</Alert> */}
      <Alert severity="info">{message}</Alert>
      {/* <Alert severity="success">This is a success alert — check it out!</Alert> */}
    </div>
  );
}