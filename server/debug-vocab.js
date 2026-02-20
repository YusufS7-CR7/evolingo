const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lesson = await prisma.lesson.findFirst({
        where: { title: { contains: 'Личность' } } // Look for personality lesson (Intermedite 1 usually)
    });

    if (lesson) {
        console.log('Lesson Title:', lesson.title);
        console.log('Content:', JSON.stringify(lesson.content, null, 2));
    } else {
        const anyLesson = await prisma.lesson.findFirst();
        console.log('Any Lesson Title:', anyLesson?.title);
        console.log('Content:', JSON.stringify(anyLesson?.content, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
