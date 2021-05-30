
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
        height : "100%",
        overflow: "auto",
        display: 'flex',
        "flex-direction": 'column',
        border: '2px solid #f50057',
        borderRadius: '5px',
        width: '100%',
    },
    message: {
        "white-space": "pre-wrap",      /* CSS3 */   
        "white-space": "-moz-pre-wrap", /* Firefox */    
        "white-space": "-pre-wrap",     /* Opera <7 */   
        "white-space": "-o-pre-wrap",   /* Opera 7 */    
        "word-wrap": "break-word",      /* IE */
        backgroundColor: '#1f344d',
        color: "white",
        borderRadius: '5px',
        padding: "0.5rem 0.2rem",
        margin: '5px',
    },
}

export default chatStyle;
