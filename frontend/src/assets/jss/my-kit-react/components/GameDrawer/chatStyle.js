
const chatStyle = {
    chatRoot: {
        display: 'flex',
        "flex-direction": 'column',
        height: '100%',
        padding: '1rem 0',
    },
    chatBox: {
        display: 'flex',
        flexGrow: 1,
    },
    chatInput: {
        display: 'flex',
        flexBasis: '3rem',
        justifyContent: 'center',
        margin: '15px'
    },
    chat: {
        display: 'flex',
        "flex-direction": 'column',
        border: '2px solid #f50057',
        borderRadius: '5px',
        width: '100%',
        margin: '15px'
    },
    message: {
        backgroundColor: '#1f344d',
        color: "white",
        borderRadius: '5px',
        padding: "0.5rem 0.2rem",
        display: 'flex',
        margin: '5px',
    },
}

export default chatStyle;