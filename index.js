const bodyParser = require('body-parser');
const app = require('express')();
const five = require("johnny-five");

const port = 8080;
const hostname = '127.0.0.1';
const M1 = 5;
const M2 = 6;
const EIN1 = 8;
const EIN2 = 9;
const EIN3 = 10;
const EIN4 = 11;

let motors = [
    {
        speed: 0,
        pin: M1,
        einA: {
            state: false,
            pin: EIN1,
        },
        einB: {
            state: false,
            pin: EIN2,
        }
    },
    {
        speed: 0,
        pin: M2,
        einA: {
            state: false,
            pin: EIN3,
        },
        einB: {
            state: false,
            pin: EIN4,
        }
    },
];

const board = new five.Board();
board.on('ready', function () {
    const updateSpeed = (speeds) => {
        motors = speeds.map(updateMotor);
        motors.forEach(updateMotorState, this);
        console.log(motors);
    };

    motors.forEach(initMotors, this);
    initServer(updateSpeed);
});

// Functions
function updateMotorState(motor) {
    const {
        speed,
        pin,
        einA: { state: stateA, pin: pinA },
        einB: { state: stateB, pin: pinB },
    } = motor;

    this.digitalWrite(pin, Math.abs(speed));
    this.digitalWrite(pinA, stateA);
    this.digitalWrite(pinB, stateB);
}

function initMotors(motor) {
    const { pin, einA: { pin: pinA }, einB: { pin: pinB } } = motor;
    this.pinMode(pin, five.Pin.PWM);
    this.pinMode(pinA, five.Pin.OUTPUT);
    this.pinMode(pinB, five.Pin.OUTPUT);
}

function initServer(cb) {
    // to support URL-encoded bodies
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    const server = app.listen(port, hostname, () => { console.log(`Listening http://${hostname}:${port}`) });
    const io = require('socket.io').listen(server);

    app.get('/', (req, res) => { res.send('Hello world!') });
    app.post('/', (req, res) => {
        const { m1, m2 } = req.body;
        cb([ m1, m2 ]);
        res.send(motors);
    });

    io.on('connection', (socket) => {
        console.log('New conection');
        socket.emit('motors', motors);
        socket.on('motors', ({ m1, m2 }) => {
            cb([ m1, m2 ]);
        });
    });
}

function updateMotor(item, index) {
    const motor = motors[index];
    const { speed: oldSpeed, einA, einB } = motor;
    const speed = sanitizeSpeed(item, oldSpeed);

    motor.speed = speed;
    motor.einA.state = speed < 0;
    motor.einB.state = speed > 0;
    return motor;
}

function sanitizeSpeed(newVal, oldVal) {
    const newValInt = parseInt(newVal);
    // If is a int and is between the range return the new value
    // in other case return the old value
    return !isNaN(newValInt) && Math.max(Math.min(newValInt, 255), -255) === newValInt
        ? newValInt
        : oldVal;
}
