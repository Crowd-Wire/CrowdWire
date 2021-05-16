
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
        color: "#ccc",
    },
    requestButtons: {
        display: "flex",
    }
}

export default userListStyle;