
const userListStyle = {
    root: {
        display: 'flex',
        "flex-direction": 'column',
        height: '100%',
        padding: '20px 5px',
    },
    user: {
        display: "flex",
        alignItems: "center",
        "&:hover": {
            backgroundColor: "#224260"
        },
        padding: '0.5rem',
        borderRadius: "5px",
        // boxShadow: "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
    },
    avatar: {
        width: "3rem",
        height: "3rem",
        borderRadius: "50%",
        backgroundColor :"white"
    },
    content: {
        display: "flex",
        "flex-direction": "column",
        paddingLeft: "10px",
    },
    username: {
        fontSize: "1.125rem",
        fontWeight: 500,
        color: "white"
    },
    request: {
        paddingLeft: "15px",
        color: "#ccc",
    },
    requestButtons: {
        display: "flex",
    }
    // chatBox: {
    //     display: 'flex',
    //     flexGrow: 1,
    // },
    // chatInput: {
    //     display: 'flex',
    //     flexBasis: '3rem',
    //     justifyContent: 'center',
    //     margin: '15px'
    // },
    // chat: {
    //     display: 'flex',
    //     "flex-direction": 'column',
    //     border: '2px solid #f50057',
    //     borderRadius: '5px',
    //     width: '100%',
    //     margin: '15px',
    // },
    // message: {
    //     backgroundColor: '#1f344d',
    //     color: "white",
    //     borderRadius: '5px',
    //     padding: "0.5rem 0.2rem",
    //     margin: '5px',
    // },
}

export default userListStyle;