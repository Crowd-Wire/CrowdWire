
const loaderStyle = {

    info: {
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 400,
        textAlign: 'center',
        "&>img": {
            marginBottom: '1rem',
        }
    },
    loader: {
        width: 100,
        height: 100,
        animation: '$loaderAnim 1.5s infinite',
    },
    '@keyframes loaderAnim': {
        '0%': {
            transform: 'rotate(0)',
            'animation-timing-function': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        },
        '50%': {
            transform: 'rotate(90deg)',
            'animation-timing-function': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        },
        '100%': {
            transform: 'rotate(360deg)',
        }
    },
}

export default loaderStyle;
