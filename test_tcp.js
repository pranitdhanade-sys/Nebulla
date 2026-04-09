const net = require('net');

const client = new net.Socket();
client.setTimeout(3000);

client.connect(3306, '127.0.0.1', () => {
    console.log('Connected to 3306');
});

client.on('data', (data) => {
    console.log('Received:', data.toString());
    client.destroy();
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Error:', err);
});

client.on('timeout', () => {
    console.log('Connection timed out');
    client.destroy();
});
