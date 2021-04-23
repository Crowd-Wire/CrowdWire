const mapEditorStyle = {
    navbar: {
        background: '#666',
        height: '50px',
        alignItems: 'center'
    },
    navbarItem: {
        fontSize: '1.425rem',
        fontWeight: '400',
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
        width: '20px',
        padding: '0',
        cursor: 'ew-resize',
        flex: '0 0 auto',
        zIndex: 10,
    },
    handlerRow: {
        height: '20px',
        padding: '0',
        cursor: 'ns-resize',
        flex: '0 0 auto',
        zIndex: 10,
    },
} 

export default mapEditorStyle;
