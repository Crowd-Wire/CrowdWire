
const chatStyle = {
    chatRoot: {
        display: 'flex',
        "flex-direction": 'column',
        height: '100%',
    },
    chatBox: {
        height: "calc(100vh - 64px - 64px - 64px - 1px)",
        "box-sizing": "border-box",
        display: 'flex',
        padding: '10px 10px',
    },
    chatInput: {
        height: "64px",
        display: 'flex',
        justifyContent: 'center',
        padding: '0 10px',
    },
    sendToInput: {
        height: "64px",
        display: 'flex',
        justifyContent: 'right',
        padding: '0 10px',
    },
    chat: {
        height: "100%",
        overflow: "auto",
        display: 'flex',
        "flex-direction": 'column',
        boxShadow: 'rgb(50 50 93 / 25%) 0px 30px 60px -12px inset, rgb(50 50 93 / 25%) 0px -30px 60px -12px inset',
        borderRadius: '5px',
        width: '100%',
        "&::-webkit-scrollbar-track": {
            backgroundColor: 'transparent',
            borderRadius: 5,
        },
        "&::-webkit-scrollbar": {
            backgroundColor: 'transparent',
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: 'rgba(255, 255, 255, .6)',
            backdropFilter: 'blur(5px)',
            borderRadius: 5,
        }
    },
    message: {
        "white-space": "pre-wrap",      /* CSS3 */
        "white-space": "-moz-pre-wrap", /* Firefox */
        "white-space": "-pre-wrap",     /* Opera <7 */
        "white-space": "-o-pre-wrap",   /* Opera 7 */
        "word-wrap": "break-word",      /* IE */
        // backgroundColor: '#1f344d',
        color: "white",
        borderRadius: '5px',
        padding: "0.5rem 0.2rem",
        margin: '5px',
        backgroundColor: 'rgba(255, 255, 255, .15)',
        backdropFilter: 'blur(5px)',
    },
}

export default chatStyle;
