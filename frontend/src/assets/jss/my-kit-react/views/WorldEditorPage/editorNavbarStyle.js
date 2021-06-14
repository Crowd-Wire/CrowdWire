const editorNavbarStyle = {
    navbar: {
        background: 'rgb(11, 19, 43)',
        maxHeight: 30,
        height: 30,
        alignItems: 'center'
    },
    navbarItem: {
        fontSize: 15,
        fontWeight: 400,
        color: 'white',
        padding: '0 20px',
        cursor: 'pointer',
    },
    navbarItemDisable: {
        opacity: 0.5,
        cursor: 'default',
    },
    dropdownItem: {
        display: 'flex',
        fontSize: 15,
        padding: '.25rem .75rem',
        paddingRight: 'calc(.75rem + 18px)',
        color: 'white',
        "&:hover": {
            color: '#212529'
        },
        "&>*": {
            position: 'absolute',
            marginTop: 2,
            right: '.25rem',
        },
        "&>svg": {
            color: '#5BC0BE',
            fontSize: 18,
        },
        "&>span": {
            right: '.5rem',
        }
    },
}

export default editorNavbarStyle;
