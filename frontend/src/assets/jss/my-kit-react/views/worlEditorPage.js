const worldEditorPage = {
    navbar: {
        background: '#666',
        maxHeight: 30,
        height: 30,
        alignItems: 'center'
    },
    navbarItem: {
        fontSize: 15,
        fontWeight: 400,
        color: 'white',
        margin: '0 20px',
        cursor: 'pointer'
    },
    wrapperCol: {
        display: 'flex',
        flexDirection: 'column'
    },
    wrapperRow: {
        display: 'flex',
        flexDirection: 'row'
    },
    handlerCol: {
        width: 20,
        padding: '0',
        cursor: 'ew-resize',
        flex: '0 0 auto',
        zIndex: 10,
    },
    handlerRow: {
        height: 20,
        padding: '0',
        cursor: 'ns-resize',
        flex: '0 0 auto',
        zIndex: 10,
    },
} 

export default worldEditorPage;
