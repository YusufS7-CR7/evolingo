const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lessons = await prisma.lesson.findMany({ select: { title: true, content: true } });
    const personality = lessons.find(l => l.title.includes('Personality') || l.title.includes('Личность'));
    console.log('Found:', personality?.title);
    console.log('Content:', JSON.stringify(personality?.content, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
