import loaderStyle from "../loaderStyle";

const mapEditorStyle = {
    ...loaderStyle,

    backgroundGradient: {
        height: '100%',
        width: '100%',
        backgroundColor: '#2B9BFD',
        backgroundImage: 'linear-gradient(to bottom right, #2B9BFD 4%, #71d1b9 90%)',
    },
    center: {
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        flexWrap: 'wrap',
    },
    card: {
        margin: 0,
        ['@media (min-width:767px)']: {
            margin: '0 50px',
        },
        ['@media (min-width:1023px)']: {
            margin: '0 150px'
        },
        ['@media (min-width:1439px)']: {
            margin: '0 50px',
        }
    },
    wrapper: {
        display: 'flex',
        height: '100vh',
        width: '100vw'
    },
    chatWindow: {
        width: '300px',
    },
    gameWindow: {
        width: 'calc(100vh - 300px)',
        height: '100vh',
        flexGrow: 1,
        backgroundColor: "#0b1117",
    },
} 

export default mapEditorStyle;
