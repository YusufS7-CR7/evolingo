const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.findMany({
        where: { level: 'Intermediate' },
        include: { modules: { include: { lessons: true } } }
    });

    courses.forEach(c => {
        console.log('Course:', c.id);
        c.modules.forEach(m => {
            console.log('  Module:', m.title);
            m.lessons.forEach(l => {
                console.log('    Lesson:', l.title, 'Type:', l.type);
                try {
                    const content = JSON.parse(l.content);
                    console.log('      Words:', content.words?.length || 0);
                } catch (e) {
                    console.log('      FAILED TO PARSE');
                }
            });
        });
    });
}

main().finally(() => prisma.$disconnect());
