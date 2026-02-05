import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import cors from 'cors';
import { verifyToken } from './lib/auth';
import { prisma } from './lib/prisma';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const expressApp = express();
    expressApp.use(cors());

    const httpServer = createServer(expressApp);
    
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Socket.io authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const payload = verifyToken(token);
            if (!payload) {
                return next(new Error('Invalid token'));
            }
            socket.data.userId = payload.userId;
            socket.data.email = payload.email;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.data.userId}`);

        // Join conversation room
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
        });

        // Leave conversation room
        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${socket.data.userId} left conversation ${conversationId}`);
        });

        // Send message
        socket.on('send_message', async (data: { conversationId: string; content: string }) => {
            try {
                const message = await prisma.message.create({
                    data: {
                        content: data.content,
                        senderId: socket.data.userId,
                        conversationId: data.conversationId,
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                fullName: true,
                                profileImage: true,
                            }
                        }
                    }
                });

                // Update conversation lastMessageAt
                await prisma.conversation.update({
                    where: { id: data.conversationId },
                    data: { lastMessageAt: new Date() }
                });

                // Broadcast to all users in the conversation
                io.to(`conversation:${data.conversationId}`).emit('new_message', message);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicators
        socket.on('typing_start', (conversationId: string) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                conversationId,
                userId: socket.data.userId,
            });
        });

        socket.on('typing_stop', (conversationId: string) => {
            socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
                conversationId,
                userId: socket.data.userId,
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);
        });
    });

    // Handle all other routes with Next.js
    expressApp.all('/{*path}', (req, res) => {
        return handle(req, res);
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io server running`);
    });
});
