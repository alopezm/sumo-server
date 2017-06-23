const bodyParser = require('body-parser');
const app = require('express')();

const port = 8080;
const hostname = '127.0.0.1';
let speed = {
    m1: 0,
    m2: 0,
};

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const server = app.listen(port, hostname, () => { console.log(`Listening http://${hostname}:${port}`) });
const io = require('socket.io').listen(server);

app.get('/', (req, res) => { res.send('Hello world!') });
app.post('/', (req, res) => {
    const { m1, m2 } = req.body;
    updateSpeed(m1, m2);
    res.send(speed);
});

io.on('connection', (socket) => {
    console.log('New conection');
    socket.emit('position', speed);
    socket.on('position', ({ m1, m2 }) => {
        updateSpeed(m1, m2);
    });
});

// Util Functions
function updateSpeed(m1, m2) {
    speed.m1 = sanitizeSpeed(m1, speed.m1);
    speed.m2 = sanitizeSpeed(m2, speed.m2);
    console.log(`Speed  m1: ${speed.m1}   m2: ${speed.m2}`);
}

function sanitizeSpeed(newVal, oldVal) {
    const newValInt = parseInt(newVal);
    // If is a int and is between the range return the new value
    // in other case return the old value
    return !isNaN(newValInt) && Math.max(Math.min(newValInt, 255), -255) === newValInt
        ? newValInt
        : oldVal;
}