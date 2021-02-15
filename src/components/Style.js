import { Button, styled, withStyles, makeStyles, Checkbox } from '@material-ui/core'
import { green } from '@material-ui/core/colors'

export const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      fontSize: '0.875rem',
      flexWrap: 'wrap',
    },
    title: {
      flexGrow: 1,
    },
    cover: {
      width: 50,
      padding: 10,
    },
    margin: {
        margin: theme.spacing(1),
    },
    withoutLabel: {
        marginTop: theme.spacing(3),
    },
    textField: {
        width: '25ch',
    },
  }))

  export const GreenCheckbox = withStyles({
    root: {
      color: green[400],
      '&$checked': {
        color: green[600],
      },
    },
    checked: {},
  })((props) => <Checkbox color="default" {...props} />)
  
  export const MenuButton = styled(Button)({
    color: '#fff',
    padding: '6px 8px',
    fontSize: '0.875rem',
  })
  
  export const ExamButton = styled(Button)({
    color: '#3f51b5',
    padding: '6px 8px',
  })