
const net = require('net');

const client = new net.Socket();
client.setTimeout(2000);

client.connect(5432, '127.0.0.1', function () {
    console.log('Connected to PostgreSQL port 5432');
    client.destroy();
});

client.on('error', function (err) {
    console.error('Connection error: ' + err.message);
    client.destroy();
});

client.on('timeout', function () {
    console.error('Connection timed out');
    client.destroy();
});
