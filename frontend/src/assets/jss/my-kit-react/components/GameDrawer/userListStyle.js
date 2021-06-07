
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
    },
    avatar: {
        width: "2.5rem",
        height: "2.5rem",
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
    },
    userMenu: {
        fontSize: "1rem",
        color: "white",
        display: "flex",
        "flex-direction": "column",
        borderRadius: 5,
        padding: 5,
        backgroundColor: "#1f344d",
        boxShadow: "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
    },
    userMenuItem: {
        padding: "5px 10px",
        borderRadius: 5,
        "&:hover": {
            backgroundColor: "#224260"
        },
    }
}

export default userListStyle;