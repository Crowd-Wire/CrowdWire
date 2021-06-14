
export const isDesktop = () => {
    var isTouchDevice = function() {  
        return window.screenX === 0 && 'ontouchstart' in window || 'onmsgesturechange' in window; 
    };
    var isDesktop = !isTouchDevice() ? true : false;
    return isDesktop;
};
