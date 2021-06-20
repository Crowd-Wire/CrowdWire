const spaceLeft = 10;

const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
}

const tabHeaderStyle = {
    root: {
        width: '100%', 
        display: 'flex',
        'flex-wrap': 'wrap',
        boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
        marginBottom: 10,
    },
    rootLeft: {
        display:'flex', 
        flexGrow: 1,
    },
    rootRight: {
        display:'flex',
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    inputState: {
        display: 'none',
    },
    inputControl: {
        transform: `translate(${spaceLeft}px, 8px) scale(1)`,
    },
    inputSelect: {
        paddingLeft: spaceLeft,
    },

    icon: {
        ...iconStyle,
        color: '#9c27b0',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    button: {
        ...iconStyle,
        cursor: 'pointer',
    },
    buttonActive: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    }
}

export default tabHeaderStyle;
