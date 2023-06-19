import { makeStyles } from '@mui/styles';
import { styled } from '@mui/system';

const styles = (theme) => {
  return {
    appBackground: {
      backgroundColor: '#f5f5f7',
      minHeight: '85vh',
    },
    toolBar: {
      height: '10vh',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '20px',
      backgroundColor: 'white',
    },
    logo: {
      color: 'blue',
      cursor: 'pointer',
    },
    link: {
      color: "#000",
      fontWeight: 'bold !important',
    },
    calLogo: {
      marginTop: '0px',
      width: '80%',
      marginLeft: '50px',
    },
    menuIcon: {
      color: '#000',
    },
    formContainer: {
      flexGrow: 1,
      padding: '10px',
      maxWidth: '700px',
      margin: '30px auto',
      [theme.breakpoints.between('xs', 'sm')]: {
        width: '100%',
      },
    },
    form: {
      marginTop: '30px',
    },
    formHeading: {
      textAlign: 'center',
      margin: '90px ',
      
    },
    heroBox: {
      width: '100%',
      display: 'flex',
      minHeight: '600px',
      alignItems: 'center',
      justifyContent: 'center',
    },
    gridContainer: {
      width: '100%',
      display: 'flex',
      minHeight: '600px',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto', 
    },
    aboutUsContainer: {
      width: '100%',
      display: 'flex',
      minHeight: '400px',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '30px 0px 50px 0px',
    },
    aboutUsSubtitle: {
      opacity: '0.7',
      paddingBottom: '30px',
      fontSize: '18px',
    },
    title: {
      paddingBottom: '5px',
    },
    subtitle: {
      opacity: '0.7',
      //paddingBottom: '30px',
    },
    subtitle2: {
      opacity: '0.7',
      marginTop: '90px'
      //paddingBottom: '30px',
    },
    largeImage: {
      width: '100%',
    },
    medImage: {
      marginTop: '120px',
      // width: '50%',
    },
    smallImage: {
      marginTop: '0px',
      width: '80%',
    },
    sectionGridContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '300px',
    },
    sectionGridItem: {
      backgroundColor: '#f2f0f1',
      textAlign: 'center',
      padding: '30px',
      width: '200px',
      borderRadius: '10px',
      margin: '10px !important',
    },
    inputField: {
      marginBottom: '20px !important',
    },
    textArea: {
      width: '100%',
      marginBottom: '20px',
      fontSize: '16px',
      padding: '10px',
    },
    avatar: {
      marginRight: '10px',
    },
    footerContainer: {
      display: 'flex',
      alignItems: 'center',
      miHeight: '10vh',
      padding: '20px',
      justifyContent: 'center',
      backgroundColor: 'white',
      flexDirection: 'column',
    },
    footerText: {
      paddingBottom: '10px',
    },
    footerDate: {
      opacity: '0.4',
    },
  };
};

const useStyles = makeStyles(styles);
export default useStyles;