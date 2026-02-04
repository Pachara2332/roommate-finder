import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server, Socket } from 'socket.io';
import { prisma } from './lib/prisma.ts';
import { verifyToken } from './lib/auth.ts';
import type { IncomingMessage } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for auth
  io.use((socket: Socket, next: (err?:  Error) => void) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    
    const payload = verifyToken(token);
    if (!payload) {
        return next(new Error('Authentication error: Invalid token'));
    }
    
    // Attach user to socket
    (socket as any).userId = payload.userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Join user's own room for notifications
    socket.join(`user:${userId}`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
        try {
            const { conversationId, content } = data;
            
            // Validate input
            if (!conversationId || !content) return;

            // Save to DB
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId: userId,
                    content,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            fullName: true,
                            profileImage: true
                        }
                    }
                }
            });

            // Update conversation lastMessageAt
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() }
            });

            // Broadcast to conversation
            io.to(`conversation:${conversationId}`).emit('receive_message', message);
            
            // Find other participants to notify
            // (In a real app, query DB for participants. Here we broadcast to room, 
            // but if user is not in room (e.g. chat closed), we might want to push to user:ID)
            
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });
    
    socket.on('typing_start', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing_start', {
            conversationId,
            userId
        });
    });

    socket.on('typing_stop', (conversationId: string) => {
        socket.to(`conversation:${conversationId}`).emit('typing_stop', {
            conversationId,
            userId
        });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
