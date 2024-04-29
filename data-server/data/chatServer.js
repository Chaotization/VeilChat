import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const privateChannels = {};

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('user_join', ({ userId, matchId }) => {
        console.log(`User ${userId} joined with match ${matchId}`);

        const channel = [userId, matchId].sort().join('-');

        if (!privateChannels[channel]) {
            privateChannels[channel] = new Set();
        }

        privateChannels[channel].add(socket);
        r
        socket.to(channel).broadcast.emit('user_join', userId);

        socket.join(channel);
    });

    socket.on('message', ({ userId, message, channel }) => {
        console.log(`Received message from ${userId} in channel ${channel}: ${message}`);
        io.to(channel).emit('message', { userId, message });
    });


    socket.on('disconnect', () => {
        console.log('Client disconnected');

        for (const channel in privateChannels) {
            if (privateChannels[channel].has(socket)) {
                privateChannels[channel].delete(socket);

                if (privateChannels[channel].size === 0) {
                    delete privateChannels[channel];
                }

                socket.to(channel).broadcast.emit('user_leave', socket.id);
            }
        }
    });
});

httpServer.listen(4000, () => {
    console.log(`Listening on *:${4000}`);
});
