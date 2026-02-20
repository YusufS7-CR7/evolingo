const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

// --- ImgBB Setup ---
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

// --- AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback chain: try models in order until one works
const AI_MODELS = [
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
];

async function generateWithFallback(prompt) {
    let lastError = null;
    for (const modelName of AI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            console.log(`[AI] Trying model: ${modelName}`);
            const result = await model.generateContent(prompt);
            console.log(`[AI] Success with model: ${modelName}`);
            return result.response.text();
        } catch (err) {
            const status = err.status || err.statusCode || 0;
            const msg = err.message || '';
            const isQuota = status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhausted');
            const isNotFound = status === 404 || msg.includes('404') || msg.toLowerCase().includes('not found');
            if (isQuota || isNotFound) {
                console.warn(`[AI] Model ${modelName} unavailable (${status}), trying next...`);
                lastError = err;
                continue;
            }
            throw err; // Non-quota error — rethrow immediately
        }
    }
    // All models exhausted
    throw lastError || new Error('All AI models quota exceeded');
}

// Keep aiModel for backward compatibility (used in lesson complete)
// Keep aiModel for backward compatibility (used in lesson complete) -> REMOVED to force fallback usage
// const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000'
];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL + (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'connection_limit=5&pool_timeout=30'
        }
    }
});
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
            return callback(null, true);
        }
        // Also allow any vercel.app subdomain
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Middleware ---
// Memory storage for ImgBB upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                level: 'Beginner' // Default, can be updated via placement
            }
        });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });
        // Return full user object structure
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                level: user.level,
                xp: user.xp,
                coins: user.coins,
                streak: user.streak,
                age: user.age,
                goal: user.goal,
                isPro: user.isPro,
                oldStreak: user.oldStreak,
                lastStreakLostAt: user.lastStreakLostAt,
                lastRepairUsedAt: user.lastRepairUsedAt,
                completedLessons: [] // New user has no lessons
            }
        });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        // Update Streak Logic (using midnight-relative comparison)
        const now = new Date(); // Declare now FIRST

        const lastStreakDate = new Date(user.lastStreakUpdate);
        lastStreakDate.setHours(0, 0, 0, 0);

        const nowDate = new Date();
        nowDate.setHours(0, 0, 0, 0);

        const diffTime = nowDate - lastStreakDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let streak = user.streak;
        let lastStreakUpdate = user.lastStreakUpdate;

        if (diffDays === 1) {
            // Consecutive day - increment streak
            streak += 1;
            lastStreakUpdate = now;
        } else if (diffDays > 1) {
            const missedDays = diffDays - 1;
            console.log(`[Streak] Missed ${missedDays} days. Checking for freezes/repairs...`);

            if (user.streakFreezes >= missedDays) {
                // Consume freezes
                console.log(`[Streak] Consuming ${missedDays} freezes to save streak of ${streak}`);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { streakFreezes: { decrement: missedDays } }
                });
                // Streak CONTINUES as if they logged in today
                streak += 1;
                lastStreakUpdate = now;
            } else {
                // Streak BREAKS
                console.log(`[Streak] No freezes. Resetting streak.`);
                // SAVE OLD STREAK for potential repair
                if (streak > 0) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            oldStreak: streak,
                            lastStreakLostAt: now
                        }
                    });
                }
                streak = 1; // Reset to 1 (active today)
                lastStreakUpdate = now;
            }
        } else if (diffDays === 0 && streak === 0) {
            // First activity ever
            streak = 1;
            lastStreakUpdate = now;
        }
        // if diffDays === 0 and streak > 0, keep current streak (same day login)

        // Daily Heart Refill (+2 per day)
        const lastHeartReset = new Date(user.lastHeartReset);
        const diffHeartDays = Math.floor((now - lastHeartReset) / (1000 * 60 * 60 * 24));
        let hearts = user.hearts;
        let lastHeartResetUpdate = user.lastHeartReset;

        if (diffHeartDays > 0) {
            hearts = Math.min(5, hearts + (diffHeartDays * 2));
            lastHeartResetUpdate = now;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: now, streak, lastStreakUpdate, hearts, lastHeartReset: lastHeartResetUpdate }
        });

        // Fetch completed lessons
        const progress = await prisma.progress.findMany({ where: { userId: user.id } });
        const completedLessons = progress.map(p => p.lessonId);

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                level: updatedUser.level,
                xp: updatedUser.xp,
                coins: updatedUser.coins,
                streak: updatedUser.streak,
                age: updatedUser.age,
                goal: updatedUser.goal,
                isPro: updatedUser.isPro,
                oldStreak: updatedUser.oldStreak,
                lastStreakLostAt: updatedUser.lastStreakLostAt,
                lastRepairUsedAt: updatedUser.lastRepairUsedAt,
                progress: progress, // Send full progress for UI
                completedLessons: completedLessons.filter(id => {
                    const prog = progress.find(p => p.lessonId === id);
                    return prog && prog.score >= 80;
                })
            }
        });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { progress: true }
        });

        // Daily Heart Refill check
        const now = new Date();
        const lastHeartReset = new Date(user.lastHeartReset);
        const diffHeartDays = Math.floor((now - lastHeartReset) / (1000 * 60 * 60 * 24));

        let finalUser = user;
        if (diffHeartDays > 0) {
            const newHearts = Math.min(5, user.hearts + (diffHeartDays * 2));
            finalUser = await prisma.user.update({
                where: { id: user.id },
                data: { hearts: newHearts, lastHeartReset: now },
                include: { progress: true }
            });
        }

        const completedLessons = finalUser.progress
            .filter(p => p.score >= 80)
            .map(p => p.lessonId);

        const { password, progress, ...userWithoutPassword } = finalUser;

        res.json({ ...userWithoutPassword, completedLessons, progress: finalUser.progress });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/auth/me', authenticateToken, async (req, res) => {
    const { name, age, goal, level } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, age, goal, level }
        });
        res.json(user);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/user/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to ImgBB
        const formData = new FormData();
        formData.append('image', req.file.buffer.toString('base64'));
        formData.append('name', `avatar-${req.user.id}-${Date.now()}`);

        const imgbbResponse = await axios.post(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            formData,
            { headers: formData.getHeaders() }
        );

        const avatarUrl = imgbbResponse.data.data.url;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatarUrl }
        });

        res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
        console.error('[Upload Error]', error);
        res.status(500).json({ message: error.message });
    }
});

// --- Socket.io Middleware ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);

    socket.on('join_group', (groupId) => {
        // Leave previous rooms except the default one
        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
            if (room !== socket.id) socket.leave(room);
        });

        socket.join(String(groupId));
        console.log(`User ${socket.user.id} joined group ${groupId}`);
    });

    socket.on('send_message', async (data) => {
        const { groupId, content } = data; // Don't trust userId from client
        const userId = socket.user.id;

        try {
            const message = await prisma.message.create({
                data: {
                    groupId: parseInt(groupId),
                    userId: userId,
                    content
                },
                include: { user: { select: { name: true, id: true, avatarUrl: true } } }
            });

            io.to(String(groupId)).emit('receive_message', message);
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.id);
    });
});

// --- Feature Routes ---
app.post('/api/placement', authenticateToken, async (req, res) => {
    const { level } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { level }
        });
        res.json(user);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });

        // Parse lesson content JSON
        const formattedCourses = courses.map(c => ({
            ...c,
            modules: c.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => ({
                    ...l,
                    content: JSON.parse(l.content)
                }))
            }))
        }));

        console.log('Sending courses to client. Sample lesson content:',
            formattedCourses[0]?.modules[0]?.lessons[0]?.content?.words?.length, 'words found in first lesson');

        res.json(formattedCourses);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { xp: 'desc' },
            take: 10,
            select: { id: true, name: true, xp: true, level: true, coins: true, avatarUrl: true }
        });
        res.json(users);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/shop/buy', authenticateToken, async (req, res) => {
    const { itemId } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        // Define item costs and logic
        let cost = 0;
        let updateData = {};

        switch (itemId) {
            case 'heart':
                cost = 50;
                if (user.hearts >= 5) return res.status(400).json({ error: 'Жизни уже полные' });
                updateData = { hearts: { increment: 1 } };
                break;
            case 'freeze':
                cost = 70;
                if (user.streakFreezes >= 2) return res.status(400).json({ error: 'Максимум 2 заморозки' });
                updateData = { streakFreezes: { increment: 1 } };
                break;
            case 'repair':
                // Repair Logic:
                // 1. Must have lost a streak recently (within 7 days)
                // 2. Cooldown 14 days
                // 3. Restores oldStreak
                cost = 150; // Increased price

                if (!user.lastStreakLostAt) return res.status(400).json({ error: 'Нет потерянного стрика для восстановления' });

                const daysSinceLoss = (new Date() - new Date(user.lastStreakLostAt)) / (1000 * 60 * 60 * 24);
                if (daysSinceLoss > 7) return res.status(400).json({ error: 'Срок восстановления истек (7 дней)' });

                if (user.lastRepairUsedAt) {
                    const daysSinceRepair = (new Date() - new Date(user.lastRepairUsedAt)) / (1000 * 60 * 60 * 24);
                    if (daysSinceRepair < 14) return res.status(400).json({ error: 'Ремонт доступен раз в 14 дней' });
                }

                updateData = {
                    streak: user.oldStreak, // Restore old streak
                    lastStreakUpdate: new Date(), // Set to now to make it active
                    lastRepairUsedAt: new Date(),
                    lastStreakLostAt: null, // Clear the loss record
                    oldStreak: 0 // Clear old streak
                };
                break;
            default:
                return res.status(400).json({ error: 'Неизвестный товар' });
        }

        if (user.coins < cost) return res.status(400).json({ error: 'Недостаточно монет' });

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                coins: { decrement: cost },
                ...updateData
            }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('[Shop Error]', error);
        res.status(500).json({ message: error.message });
    }
});

// Note: /api/user/lose-heart is defined below with full Pro logic

app.post('/api/user/promote', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { progress: true }
        });

        const levels = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced'];
        const currentIndex = levels.indexOf(user.level);

        if (currentIndex === -1 || currentIndex >= levels.length - 1) {
            return res.status(400).json({ error: 'Cannot promote further' });
        }

        const nextLevel = levels[currentIndex + 1];

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                level: nextLevel,
                coins: { increment: 100 }
            }
        });

        res.json({ user: updatedUser, bonus: 100 });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/user/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await prisma.progress.findMany({ // Changed from UserProgress to Progress
            where: { userId: req.user.id }
        });
        res.json(progress);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/lesson/complete', authenticateToken, async (req, res) => {
    const { lessonId, score } = req.body;
    const userId = req.user.id;

    console.log(`[Progress] User ${userId} completing lesson ${lessonId} with score ${score}`);

    // Server-side reward logic
    // Dynamic calculation: 50 XP, 20 Coins max

    try {
        // 0. Check & Update Streak
        const user = await prisma.user.findUnique({ where: { id: userId } });

        const now = new Date();
        const lastStreakDate = new Date(user.lastStreakUpdate);
        lastStreakDate.setHours(0, 0, 0, 0);

        const nowDate = new Date();
        nowDate.setHours(0, 0, 0, 0);

        const diffTime = nowDate - lastStreakDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let streak = user.streak;
        let lastStreakUpdate = user.lastStreakUpdate;
        let streakUpdated = false;

        if (diffDays === 1) {
            streak += 1;
            lastStreakUpdate = now;
            streakUpdated = true;
        } else if (diffDays > 1) {
            streak = 1;
            lastStreakUpdate = now;
            streakUpdated = true;
        } else if (diffDays === 0 && streak === 0) {
            streak = 1;
            lastStreakUpdate = now;
            streakUpdated = true;
        }

        if (streakUpdated) {
            await prisma.user.update({
                where: { id: userId },
                data: { streak, lastStreakUpdate }
            });
        }

        // 1. Fetch Existing Progress FIRST to calculate diff
        const existingProgress = await prisma.progress.findUnique({
            where: { userId_lessonId: { userId, lessonId } }
        });

        const oldScore = existingProgress ? existingProgress.score : 0;
        const oldCoins = Math.ceil(20 * (oldScore / 100)); // Coins already earned

        const newCoins = Math.ceil(20 * (score / 100));    // Coins worth for this run
        const coinsToAward = Math.max(0, newCoins - oldCoins); // Only give the difference

        // XP is always given for effort (optional: cap it too? sticking to coins for now)
        const earnedXp = Math.ceil(50 * (score / 100));

        console.log(`[Rewards] Lesson ${lessonId}. Score: ${score}% (Old Best: ${oldScore}%).`);
        console.log(`[Rewards] Coins: New=${newCoins}, Old=${oldCoins}, Awarding=${coinsToAward}. XP=${earnedXp}`);

        // Award coins/xp
        if (coinsToAward > 0 || earnedXp > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: earnedXp },
                    coins: { increment: coinsToAward },
                }
            });
        }

        // 2. Update Progress (Keep BEST score)
        if (existingProgress) {
            if (score > existingProgress.score) {
                await prisma.progress.update({
                    where: { id: existingProgress.id },
                    data: { score }
                });
            }
        } else {
            console.log(`[Progress] Creating new progress record for ${lessonId}`);
            await prisma.progress.create({
                data: { userId, lessonId, score }
            });
        }

        // Fetch user with updated stats and ALL progress
        const finalUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { progress: true }
        });



        // Completed lessons = score >= 80
        const completedLessons = finalUser.progress
            .filter(p => p.score >= 80)
            .map(p => p.lessonId);

        console.log(`[Progress] Current HIGH SCORE lessons for user ${userId}:`, completedLessons);

        // 2. Check for Level Completion
        const currentLevel = finalUser.level;
        let isLevelComplete = false;
        const levels = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced'];
        const currentIndex = levels.indexOf(currentLevel);

        let newLevel = null;
        if (currentIndex !== -1 && currentIndex < levels.length - 1) {
            const course = await prisma.course.findFirst({
                where: { level: currentLevel },
                include: { modules: { include: { lessons: { select: { id: true } } } } }
            });

            if (course) {
                const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
                const totalLessons = allLessonIds.length;
                // Strict check: Must have >= 80 score to count towards level completion
                const completedCount = finalUser.progress.filter(p => allLessonIds.includes(p.lessonId) && p.score >= 80).length;

                console.log(`[LevelUp] Checking level ${currentLevel}: ${completedCount}/${totalLessons} lessons passed (>=80%).`);

                if (completedCount >= totalLessons && totalLessons > 0) {
                    isLevelComplete = true;
                    console.log(`[LevelUp] Level ${currentLevel} marked as COMPLETE for user ${userId}.`);
                }
            }
        }

        const { password, progress, ...userWithoutSensitive } = finalUser;

        // --- AI statistics analysis every 5 lessons (PRO ONLY) ---
        let aiAdvice = null;
        if (finalUser.isPro && !existingProgress && completedLessons.length % 5 === 0 && completedLessons.length > 0) {
            console.log(`[AI] Generating advice for user ${userId} after ${completedLessons.length} lessons`);
            const last5Progress = await prisma.progress.findMany({
                where: { userId },
                include: { lesson: true },
                orderBy: { completedAt: 'desc' },
                take: 5
            });

            const avgScore = last5Progress.reduce((sum, p) => sum + p.score, 0) / 5;
            const weakLessons = last5Progress.filter(p => p.score < 80).map(p => p.lesson.title);
            const strongLessons = last5Progress.filter(p => p.score >= 90).map(p => p.lesson.title);

            try {
                const prompt = `You are a professional English tutor. User completed ${completedLessons.length} lessons. 
                Last 5 lessons performance:
                - Average Score: ${avgScore}%
                - Struggled with (weak): ${weakLessons.join(', ') || 'None'}
                - Excelled in (strong): ${strongLessons.join(', ') || 'None'}
                
                Provide a short, motivating specific advice (max 2 sentences) in Russian. Focus on what to repeat or what to do next.`;

                const result = await generateWithFallback(prompt);
                aiAdvice = result;
            } catch (aiError) {
                console.error('[AI Error]', aiError);
                aiAdvice = "Ты отлично поработал! Продолжай в том же духе, я подготовлю разбор позже.";
            }
        }

        res.json({
            user: { ...userWithoutSensitive, completedLessons },
            gained: { xp: earnedXp, coins: coinsToAward },
            isLevelComplete,
            aiAdvice
        });

    } catch (error) {
        console.error('[Progress Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Community / Groups ---
app.get('/api/groups/join', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Check if user is already in ANY group
        const existingMembership = await prisma.userGroup.findFirst({
            where: { userId },
            include: { group: true },
            orderBy: { joinedAt: 'desc' }
        });

        if (existingMembership) {
            return res.json(existingMembership.group);
        }

        const groups = await prisma.group.findMany({
            where: {
                isPublic: true
            },
            include: { _count: { select: { members: true } } }
        });

        let groupToJoin = groups.find(g => g._count.members < g.maxMembers);

        if (!groupToJoin) {
            groupToJoin = await prisma.group.create({
                data: {
                    name: `Global Squad ${Math.floor(Math.random() * 1000)}`,
                    level: 'All Levels',
                    maxMembers: 10,
                    isPublic: true
                }
            });
        }

        await prisma.userGroup.create({
            data: {
                userId,
                groupId: groupToJoin.id
            }
        });

        res.json(groupToJoin);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/groups', authenticateToken, async (req, res) => {
    const { name, level, maxMembers, isPublic } = req.body;
    try {
        const group = await prisma.group.create({
            data: {
                name,
                level,
                maxMembers: parseInt(maxMembers) || 10,
                isPublic: isPublic !== undefined ? isPublic : true
            }
        });

        // Automatically join the creator
        await prisma.userGroup.create({
            data: {
                userId: req.user.id,
                groupId: group.id
            }
        });

        res.json(group);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/groups/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) return res.json([]);

        // SQLite prefix search (case-insensitive by default in many setups)
        const groups = await prisma.group.findMany({
            where: {
                OR: [
                    { name: { startsWith: q }, isPublic: true },
                    { name: q, isPublic: false }
                ]
            },
            include: { _count: { select: { members: true } } }
        });

        // Strict verification for hidden groups: must be 100% exact including case
        const filtered = groups.filter(g => {
            if (g.isPublic) return true; // Keep public prefix matches
            return g.name === q; // Strict exact match for hidden
        });

        res.json(filtered);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/groups/available', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const groups = await prisma.group.findMany({
            where: {
                isPublic: true
            },
            include: { _count: { select: { members: true } } }
        });
        res.json(groups);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/groups/:id/join', authenticateToken, async (req, res) => {
    const groupId = parseInt(req.params.id);
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { _count: { select: { members: true } } }
        });

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group._count.members >= group.maxMembers) {
            return res.status(400).json({ message: 'Group is full' });
        }

        await prisma.userGroup.upsert({
            where: { userId_groupId: { userId: req.user.id, groupId } },
            update: {},
            create: { userId: req.user.id, groupId }
        });

        res.json(group);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/groups/:id/leave', authenticateToken, async (req, res) => {
    const groupId = parseInt(req.params.id);
    try {
        await prisma.userGroup.delete({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: groupId
                }
            }
        });
        res.json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/groups/:id/messages', authenticateToken, async (req, res) => {
    const groupId = parseInt(req.params.id);
    try {
        const messages = await prisma.message.findMany({
            where: { groupId },
            include: { user: { select: { name: true, id: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
// --- Admin Endpoints ---
const ADMIN_PASSWORD = '1a2a3a4a';

app.post('/api/admin/verify', async (req, res) => {
    const { password } = req.body;
    const received = (password || '').toString().trim();

    console.log('Admin verification attempt:', {
        received,
        expected: ADMIN_PASSWORD,
        receivedLen: received.length,
        expectedLen: ADMIN_PASSWORD.length,
        match: received === ADMIN_PASSWORD
    });

    if (received === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid admin password' });
    }
});

// For simplicity, we use a custom header for admin auth in this demo
const verifyAdmin = (req, res, next) => {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized admin access' });
    }
};

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    const { q } = req.query;
    try {
        const users = await prisma.user.findMany({
            where: q ? {
                OR: [
                    { name: { contains: q } },
                    { email: { contains: q } }
                ]
            } : {},
            orderBy: { level: 'asc' },
            select: { id: true, name: true, email: true, level: true, xp: true, coins: true }
        });
        res.json(users);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admin/users/:id/update-stats', verifyAdmin, async (req, res) => {
    const { xp, coins } = req.body;
    const { id } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                xp: { increment: xp || 0 },
                coins: { increment: coins || 0 }
            }
        });
        res.json(user);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Delete related data first
        await prisma.progress.deleteMany({ where: { userId: parseInt(id) } });
        await prisma.userGroup.deleteMany({ where: { userId: parseInt(id) } });
        await prisma.message.deleteMany({ where: { userId: parseInt(id) } });
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/groups', verifyAdmin, async (req, res) => {
    const { q } = req.query;
    try {
        const groups = await prisma.group.findMany({
            where: q ? { name: { contains: q } } : {},
            orderBy: { level: 'asc' },
            include: { _count: { select: { members: true } } }
        });
        res.json(groups);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/admin/groups/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.userGroup.deleteMany({ where: { groupId: parseInt(id) } });
        await prisma.message.deleteMany({ where: { groupId: parseInt(id) } });
        await prisma.group.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/groups/my', authenticateToken, async (req, res) => {
    try {
        const memberships = await prisma.userGroup.findMany({
            where: { userId: req.user.id },
            include: {
                group: {
                    include: { _count: { select: { members: true } } }
                }
            }
        });
        res.json(memberships.map(m => m.group));
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/courses', verifyAdmin, async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });
        res.json(courses);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/admin/lessons/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const lesson = await prisma.lesson.update({
            where: { id },
            data: {
                title,
                content: typeof content === 'string' ? content : JSON.stringify(content)
            }
        });
        res.json(lesson);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admin/lessons', verifyAdmin, async (req, res) => {
    const { moduleId, title, type, content } = req.body;
    try {
        // Generate a simple ID if not provided, for now just use title slug + random
        const id = title.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);

        const lesson = await prisma.lesson.create({
            data: {
                id,
                moduleId,
                title,
                type,
                content: typeof content === 'string' ? content : JSON.stringify(content)
            }
        });
        res.json(lesson);
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: error.message });
    }
});

// --- Pro & AI Features ---
app.post('/api/user/upgrade-pro', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user.coins < 300) return res.status(400).json({ message: 'Not enough coins' });
        if (user.isPro) return res.status(400).json({ message: 'Already Pro' });

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isPro: true,
                coins: { decrement: 300 }
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/user/lose-heart', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user.isPro) return res.json(user); // No heart loss for PRO

        if (user.hearts <= 0) return res.status(400).json({ message: 'No hearts left' });

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { hearts: { decrement: 1 } }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    const { message } = req.body;
    console.log(`[AI Chat] Request from user ${req.user.id}: "${message}"`);
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            console.error(`[AI Chat] User ${req.user.id} not found in database`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isPro) {
            return res.status(403).json({ message: 'AI Chat is only available for Pro users' });
        }

        try {
            const prompt = `You are a helpful and friendly English Tutor for a student named ${user.name}.
            Current Level: ${user.level} (Course: ${user.goal})
            Student says: "${message}"
            
            Respond concisely (max 3-4 sentences), helpfully, and encouragingly in Russian. If they ask about English rules, explain them simply.`;


            console.log('[AI Chat] Sending prompt to Gemini...');
            const reply = await generateWithFallback(prompt);
            console.log('[AI Chat] Success! Reply generated.');
            res.json({ reply });
        } catch (aiError) {
            console.error('[AI Chat AI-Model Error]', aiError);
            res.status(500).json({ message: "Извини, я притомился. Попробуй спросить позже! Ошибка ИИ: " + aiError.message });
        }
    } catch (error) {
        console.error('[AI Chat Server Error]', error);
        res.status(500).json({ message: "Ошибка сервера: " + error.message });
    }
});

app.post('/api/ai/analyze', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                progress: {
                    orderBy: { completedAt: 'desc' },
                    take: 5 // Analyze last 5 lessons
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isPro) {
            return res.status(403).json({ message: 'AI Analysis is only available for Pro users' });
        }

        // Check if there is enough data
        if (!user.progress || user.progress.length === 0) {
            return res.json({
                reply: "Пока недостаточно данных для анализа. Пройди хотя бы один урок!",
                lessonsAnalyzed: 0
            });
        }

        // Fetch progress with lesson titles
        const progressWithLessons = await prisma.progress.findMany({
            where: { userId: user.id },
            include: { lesson: { select: { title: true, type: true } } },
            orderBy: { completedAt: 'desc' },
            take: 5
        });

        const lessonsAnalyzed = progressWithLessons.length;
        const avgScore = Math.round(progressWithLessons.reduce((sum, p) => sum + p.score, 0) / lessonsAnalyzed);
        const weakLessons = progressWithLessons.filter(p => p.score < 70);
        const goodLessons = progressWithLessons.filter(p => p.score >= 85);

        const progressSummary = progressWithLessons.map((p, i) =>
            `${i + 1}. "${p.lesson.title}" (тип: ${p.lesson.type}) — результат: ${p.score}%`
        ).join('\n');

        const prompt = `
Ты — профессиональный репетитор по английскому языку. Проанализируй успехи ученика.

Имя ученика: ${user.name}
Текущий уровень: ${user.level}
Цель обучения: ${user.goal || 'не указана'}
Средний балл за последние ${lessonsAnalyzed} уроков: ${avgScore}%

Последние ${lessonsAnalyzed} уроков:
${progressSummary}

Слабые уроки (< 70%): ${weakLessons.map(p => `"${p.lesson.title}" (${p.score}%)`).join(', ') || 'нет'}
Сильные уроки (≥ 85%): ${goodLessons.map(p => `"${p.lesson.title}" (${p.score}%)`).join(', ') || 'нет'}

Дай анализ на РУССКОМ языке. Используй следующую структуру:

💪 **Сильные стороны:**
[Что ученик делает хорошо, основываясь на результатах]

📚 **Что нужно повторить:**
[Конкретные темы или уроки с низкими баллами, которые стоит пройти заново]

🎯 **Рекомендации:**
[2-3 конкретных совета: что изучить дальше, какие упражнения делать, как улучшить слабые места]

⭐ **Совет дня:**
[Один практический совет для уровня ${user.level}]

Ответ должен быть мотивирующим, конкретным и не более 200 слов.
        `;

        console.log('[AI Analyze] Sending prompt to Gemini...');
        const reply = await generateWithFallback(prompt);

        res.json({ reply, lessonsAnalyzed });

    } catch (error) {
        console.error('[AI Analyze Error]', error);
        const status = error.status || error.statusCode || (error.response && error.response.status) || 0;
        const msg = error.message || '';
        const errorDetails = JSON.stringify(error) || '';

        // Only treat genuine Gemini quota/rate-limit errors as daily limit exceeded
        const isQuotaError = (
            status === 429 ||
            msg.includes('429') ||
            msg.toLowerCase().includes('quota') ||
            msg.toLowerCase().includes('resource has been exhausted') ||
            errorDetails.includes('429') ||
            errorDetails.toLowerCase().includes('quota')
        );

        if (isQuotaError) {
            console.error('[AI Analyze] Quota/rate limit hit:', msg);
            return res.status(429).json({ code: 'DAILY_LIMIT_EXCEEDED', message: 'Дневной лимит на использование ИИ исчерпан. Попробуйте завтра.' });
        }

        // For all other errors, return a proper 500 with the real error message
        res.status(500).json({ message: 'Ошибка анализа: ' + msg });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
