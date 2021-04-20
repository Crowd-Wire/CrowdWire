const protocol = {
    PING: 'PING',
    PONG: 'PONG',
    JOIN_USER: 'JOIN_USER',
};


if (typeof module !== 'undefined') {
    module.exports = protocol;
}
  