const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const coursesData = await prisma.course.findMany({ include: { modules: { include: { lessons: true } } } });
    console.log('--- DB STATE ---');
    console.log('Courses Count:', coursesData.length);
    console.log('Course Levels:', coursesData.map(c => c.level));

    coursesData.forEach(c => {
        const lessonCount = c.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        console.log(`Course ${c.level}: ${lessonCount} lessons`);
    });

    const user = await prisma.user.findFirst({ where: { email: 'focus@gmail.com' } });
    console.log('Current User Level:', user?.level);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
