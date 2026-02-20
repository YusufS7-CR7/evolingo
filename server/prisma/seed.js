require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Data helper
const createCourseMap = (id, level, title, desc) => ({ id, level, title, description: desc });
const createModuleMap = (id, courseId, title) => ({ id, courseId, title });
const createLessonMap = (id, moduleId, title, type, contentObj) => ({
    id,
    moduleId,
    title,
    type,
    content: JSON.stringify(contentObj)
});

// --- Detailed Curriculum ---
// --- Detailed Curriculum ---
// --- Detailed Curriculum ---
const curriculum = {
    'beginner': [
        {
            title: 'The Alphabet & Sounds',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Apple', translation: 'Яблоко', example: 'A is for Apple.' },
                    { word: 'Ball', translation: 'Мяч', example: 'The ball is red.' },
                    { word: 'Cat', translation: 'Кот', example: 'My cat is sleeping.' },
                    { word: 'Dog', translation: 'Собака', example: 'The dog says woof.' },
                    { word: 'Elephant', translation: 'Слон', example: 'Elephants are big.' },
                    { word: 'Fish', translation: 'Рыба', example: 'Fish live in water.' },
                    { word: 'Goat', translation: 'Коза', example: 'The goat is on the hill.' },
                    { word: 'Hat', translation: 'Шляпа', example: 'I wear a warm hat.' },
                    { word: 'Ice Cream', translation: 'Мороженое', example: 'I love chocolate ice cream.' },
                    { word: 'Jam', translation: 'Джем', example: 'Sweet jam on bread.' }
                ],
                theory: {
                    explanation: 'The English alphabet has 26 letters. Sounds are vowels (a, e, i, o, u) and consonants.',
                    examples: ['"A" is a vowel.', '"B" is a consonant.']
                },
                practice: [
                    { question: 'Translation of "Apple"?', options: ['Яблоко', 'Мяч', 'Кот', 'Рыба'], correct: 'Яблоко' },
                    { question: 'Which one is an animal?', options: ['Hat', 'Dog', 'Jam', 'Ball'], correct: 'Dog' },
                    { question: 'Complete: "The ___ live in water"', options: ['Fish', 'Elephant', 'Cat', 'Hat'], correct: 'Fish' },
                    { question: 'What says "Woof"?', options: ['Dog', 'Cat', 'Fish', 'Goat'], correct: 'Dog' },
                    { question: 'Opposite of small?', options: ['Big', 'Short', 'Cold', 'Red'], correct: 'Big' },
                    { question: 'What is cold and sweet?', options: ['Ice Cream', 'Jam', 'Hat', 'Fish'], correct: 'Ice Cream' }
                ]
            }
        },
        {
            title: 'Numbers 1-10',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'One', translation: 'Один', example: 'One sun in the sky.' },
                    { word: 'Two', translation: 'Два', example: 'Two hands and two feet.' },
                    { word: 'Three', translation: 'Три', example: 'Three little pigs.' },
                    { word: 'Four', translation: 'Четыре', example: 'A table has four legs.' },
                    { word: 'Five', translation: 'Пять', example: 'Five fingers on a hand.' },
                    { word: 'Six', translation: 'Шесть', example: 'Six eggs in a box.' },
                    { word: 'Seven', translation: 'Семь', example: 'Seven days in a week.' },
                    { word: 'Eight', translation: 'Восемь', example: 'Octopus has eight legs.' },
                    { word: 'Nine', translation: 'Девять', example: 'Nine lives of a cat.' },
                    { word: 'Ten', translation: 'Десять', example: 'Ten toes on my feet.' }
                ],
                theory: {
                    explanation: 'Cardinal numbers are used for counting quantity.',
                    examples: ['Count: 1, 2, 3...', 'We have 10 fingers.']
                },
                practice: [
                    { question: 'How many days in a week?', options: ['Seven', 'Five', 'Ten', 'Six'], correct: 'Seven' },
                    { question: 'What comes after eight?', options: ['Nine', 'Seven', 'Ten', 'Six'], correct: 'Nine' },
                    { question: 'A table has ___ legs.', options: ['Four', 'Two', 'Eight', 'One'], correct: 'Four' },
                    { question: '5 + 5 = ?', options: ['Ten', 'Eight', 'Nine', 'Seven'], correct: 'Ten' },
                    { question: 'Translation of "Two"?', options: ['Два', 'Три', 'Один', 'Пять'], correct: 'Два' },
                    { question: 'Translation of "Three"?', options: ['Три', 'Два', 'Один', 'Четыре'], correct: 'Три' }
                ]
            }
        },
        {
            title: 'Colors in English',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Red', translation: 'Красный', example: 'A red apple.' },
                    { word: 'Blue', translation: 'Синий', example: 'The sky is blue.' },
                    { word: 'Green', translation: 'Зеленый', example: 'The grass is green.' },
                    { word: 'Yellow', translation: 'Желтый', example: 'The sun is yellow.' },
                    { word: 'Orange', translation: 'Оранжевый', example: 'An orange orange.' },
                    { word: 'Purple', translation: 'Фиолетовый', example: 'Purple flowers.' },
                    { word: 'Black', translation: 'Черный', example: 'Night is black.' },
                    { word: 'White', translation: 'Белый', example: 'Snow is white.' },
                    { word: 'Pink', translation: 'Розовый', example: 'Pink flamingos.' },
                    { word: 'Brown', translation: 'Коричневый', example: 'Brown bears.' }
                ],
                theory: {
                    explanation: 'Colors describe the appearance of objects.',
                    examples: ['The sky is blue.', 'Leaves are green.']
                },
                practice: [
                    { question: 'What color is the sky?', options: ['Blue', 'Red', 'Black', 'Green'], correct: 'Blue' },
                    { question: 'What color is a red apple?', options: ['Red', 'Green', 'Pink', 'Yellow'], correct: 'Red' },
                    { question: 'Grass is usually...', options: ['Green', 'Blue', 'Orange', 'Purple'], correct: 'Green' },
                    { question: 'Night sky is...', options: ['Black', 'White', 'Pink', 'Yellow'], correct: 'Black' },
                    { question: 'Snow is...', options: ['White', 'Black', 'Blue', 'Gray'], correct: 'White' },
                    { question: 'The sun is...', options: ['Yellow', 'Blue', 'Red', 'Green'], correct: 'Yellow' }
                ]
            }
        },
        {
            title: 'Family Members',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Mother', translation: 'Мать', example: 'I love my mother.' },
                    { word: 'Father', translation: 'Отец', example: 'My father is tall.' },
                    { word: 'Sister', translation: 'Сестра', example: 'My sister is funny.' },
                    { word: 'Brother', translation: 'Брат', example: 'I have one brother.' },
                    { word: 'Grandmother', translation: 'Бабушка', example: 'Grandmother bakes cookies.' },
                    { word: 'Grandfather', translation: 'Дедушка', example: 'Grandfather tells stories.' },
                    { word: 'Aunt', translation: 'Тетя', example: 'My aunt lives in London.' },
                    { word: 'Uncle', translation: 'Дядя', example: 'My uncle is a pilot.' },
                    { word: 'Cousin', translation: 'Кузен', example: 'My cousin is my best friend.' },
                    { word: 'Baby', translation: 'Малыш', example: 'The baby is sleeping.' }
                ],
                theory: {
                    explanation: 'Family relates to people connected by blood or marriage.',
                    examples: ['My mother\'s sister is my aunt.', 'My father\'s father is my grandfather.']
                },
                practice: [
                    { question: 'Father of your father?', options: ['Grandfather', 'Uncle', 'Brother', 'Cousin'], correct: 'Grandfather' },
                    { question: 'Sister of your mother?', options: ['Aunt', 'Grandmother', 'Sister', 'Baby'], correct: 'Aunt' },
                    { question: 'Female parent?', options: ['Mother', 'Father', 'Brother', 'Uncle'], correct: 'Mother' },
                    { question: 'Male sibling?', options: ['Brother', 'Sister', 'Father', 'Uncle'], correct: 'Brother' },
                    { question: 'Young human?', options: ['Baby', 'Grandfather', 'Aunt', 'Uncle'], correct: 'Baby' },
                    { question: 'Child of your aunt?', options: ['Cousin', 'Brother', 'Sister', 'Father'], correct: 'Cousin' }
                ]
            }
        },
        {
            title: 'Body Parts',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Head', translation: 'Голова', example: 'I wear a hat on my head.' },
                    { word: 'Eye', translation: 'Глаз', example: 'I see with my eyes.' },
                    { word: 'Nose', translation: 'Нос', example: 'I smell with my nose.' },
                    { word: 'Mouth', translation: 'Рот', example: 'I eat with my mouth.' },
                    { word: 'Ear', translation: 'Ухо', example: 'I hear with my ears.' },
                    { word: 'Hand', translation: 'Рука (кисть)', example: 'Wave your hand.' },
                    { word: 'Arm', translation: 'Рука (вся)', example: 'Strong arms.' },
                    { word: 'Leg', translation: 'Нога', example: 'I walk with my legs.' },
                    { word: 'Foot', translation: 'Ступня', example: 'Left foot, right foot.' },
                    { word: 'Finger', translation: 'Палец', example: 'Ten fingers.' }
                ],
                theory: {
                    explanation: 'Human body parts and their functions.',
                    examples: ['Use eyes to see.', 'Use legs to walk.']
                },
                practice: [
                    { question: 'What do you see with?', options: ['Eyes', 'Ears', 'Nose', 'Feet'], correct: 'Eyes' },
                    { question: 'What do you hear with?', options: ['Ears', 'Eyes', 'Mouth', 'Hands'], correct: 'Ears' },
                    { question: 'What do you walk with?', options: ['Legs', 'Arms', 'Head', 'Nose'], correct: 'Legs' },
                    { question: 'Where is the hat?', options: ['Head', 'Foot', 'Hand', 'Finger'], correct: 'Head' },
                    { question: 'What do you smell with?', options: ['Nose', 'Mouth', 'Arm', 'Leg'], correct: 'Nose' },
                    { question: 'What do you eat with?', options: ['Mouth', 'Nose', 'Ears', 'Feet'], correct: 'Mouth' }
                ]
            }
        }
    ],
    'elementary': [
        {
            title: 'Daily Routine',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Wake up', translation: 'Просыпаться', example: 'I wake up at 7 AM.' },
                    { word: 'Brush teeth', translation: 'Чистить зубы', example: 'I brush my teeth twice a day.' },
                    { word: 'Take a shower', translation: 'Принимать душ', example: 'I take a shower in the morning.' },
                    { word: 'Get dressed', translation: 'Одеваться', example: 'I get dressed for work.' },
                    { word: 'Have breakfast', translation: 'Завтракать', example: 'I have breakfast with coffee.' },
                    { word: 'Go to work', translation: 'Идти на работу', example: 'I go to work by bus.' },
                    { word: 'Work', translation: 'Работать', example: 'I work at an office.' },
                    { word: 'Have lunch', translation: 'Обедать', example: 'I have lunch at 1 PM.' },
                    { word: 'Cook dinner', translation: 'Готовить ужин', example: 'I cook dinner for my family.' },
                    { word: 'Go to sleep', translation: 'Ложиться спать', example: 'I go to sleep at 11 PM.' }
                ],
                theory: {
                    explanation: 'Daily routine uses Present Simple for habitual actions.',
                    examples: ['I brush my teeth every day.', 'She wakes up early.']
                },
                practice: [
                    { question: 'What do you do first?', options: ['Wake up', 'Work', 'Lunch', 'Shower'], correct: 'Wake up' },
                    { question: 'What do you do at night?', options: ['Go to sleep', 'Wake up', 'Go to work', 'Lunch'], correct: 'Go to sleep' },
                    { question: 'Translation of "Breakfast"?', options: ['Завтрак', 'Обед', 'Ужин', 'Полдник'], correct: 'Завтрак' },
                    { question: 'Translation of "Brush teeth"?', options: ['Чистить зубы', 'Умываться', 'Одеваться', 'Спать'], correct: 'Чистить зубы' },
                    { question: 'I ___ to work by bus.', options: ['go', 'eat', 'sleep', 'read'], correct: 'go' },
                    { question: 'I ___ breakfast at 8 AM.', options: ['have', 'go', 'brush', 'work'], correct: 'have' }
                ]
            }
        },
        {
            title: 'In the City',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Street', translation: 'Улица', example: 'Main street is busy.' },
                    { word: 'Building', translation: 'Здание', example: 'Tall building.' },
                    { word: 'Park', translation: 'Парк', example: 'Walk in the park.' },
                    { word: 'Shop', translation: 'Магазин', example: 'Buy food in the shop.' },
                    { word: 'Hospital', translation: 'Больница', example: 'Doctors work in hospital.' },
                    { word: 'School', translation: 'Школа', example: 'Students go to school.' },
                    { word: 'Library', translation: 'Библиотека', example: 'Read books in library.' },
                    { word: 'Bank', translation: 'Банк', example: 'Keep money in a bank.' },
                    { word: 'Restaurant', translation: 'Ресторан', example: 'Eat dinner at a restaurant.' },
                    { word: 'Airport', translation: 'Аэропорт', example: 'Fly from the airport.' }
                ],
                theory: {
                    explanation: 'Public places and infrastructure in a city.',
                    examples: ['There is a big park nearby.', 'The hospital is on the left.']
                },
                practice: [
                    { question: 'Where do you read books?', options: ['Library', 'Bank', 'Airport', 'Shop'], correct: 'Library' },
                    { question: 'Where is money kept?', options: ['Bank', 'Park', 'School', 'Hospital'], correct: 'Bank' },
                    { question: 'Where do doctors work?', options: ['Hospital', 'Shop', 'Library', 'Bank'], correct: 'Hospital' },
                    { question: 'Where do you fly from?', options: ['Airport', 'Restaurant', 'School', 'Park'], correct: 'Airport' },
                    { question: 'Where can you eat?', options: ['Restaurant', 'Bank', 'Library', 'Street'], correct: 'Restaurant' },
                    { question: 'Where do students go?', options: ['School', 'Shop', 'Airport', 'Hospital'], correct: 'School' }
                ]
            }
        },
        {
            title: 'Food and Drinks',
            type: 'vocabulary',
            content: {
                words: [
                    { word: 'Bread', translation: 'Хлеб', example: 'Fresh white bread.' },
                    { word: 'Milk', translation: 'Молоко', example: 'Drink cold milk.' },
                    { word: 'Water', translation: 'Вода', example: 'I am thirsty for water.' },
                    { word: 'Meat', translation: 'Мясо', example: 'Grilled meat.' },
                    { word: 'Fruit', translation: 'Фрукты', example: 'Eat fresh fruit.' },
                    { word: 'Vegetable', translation: 'Овощи', example: 'Green vegetables.' },
                    { word: 'Sugar', translation: 'Сахар', example: 'Sweet sugar.' },
                    { word: 'Tea', translation: 'Чай', example: 'Hot cup of tea.' },
                    { word: 'Coffee', translation: 'Кофе', example: 'Morning coffee.' },
                    { word: 'Juice', translation: 'Сок', example: 'Orange juice.' }
                ],
                theory: {
                    explanation: 'Countable and uncountable nouns for food.',
                    examples: ['An apple (countable).', 'Some milk (uncountable).']
                },
                practice: [
                    { question: 'Unscramble: T-E-A', options: ['Tea', 'Eat', 'Ate', 'Ten'], correct: 'Tea' },
                    { question: 'White liquid from cows?', options: ['Milk', 'Water', 'Juice', 'Coffee'], correct: 'Milk' },
                    { question: 'You eat it with a sandwich...', options: ['Bread', 'Sugar', 'Water', 'Coffee'], correct: 'Bread' },
                    { question: 'Drink for waking up?', options: ['Coffee', 'Milk', 'Water', 'Tea'], correct: 'Coffee' },
                    { question: 'Which is a fruit?', options: ['Apple', 'Potato', 'Carrot', 'Bread'], correct: 'Apple' },
                    { question: 'Sugar tastes...', options: ['Sweet', 'Sour', 'Bitter', 'Salty'], correct: 'Sweet' }
                ]
            }
        }
    ]
};

const levelsMap = [
    { id: 'beginner', name: 'Beginner', desc: 'Start your journey' },
    { id: 'elementary', name: 'Elementary', desc: 'Basics of daily life' },
    { id: 'pre-intermediate', name: 'Pre-Intermediate', desc: 'Travel & Communication' },
    { id: 'intermediate', name: 'Intermediate', desc: 'Complex conversations' },
    { id: 'upper-intermediate', name: 'Upper-Intermediate', desc: 'Fluent expression' },
    { id: 'advanced', name: 'Advanced', desc: 'Mastery of English' }
];

// Fallback Word Bank for automatic filling
const fallbackWords = [
    { word: 'House', translation: 'Дом', example: 'This is my house.' },
    { word: 'Window', translation: 'Окно', example: 'Look out the window.' },
    { word: 'Table', translation: 'Стол', example: 'The book is on the table.' },
    { word: 'Chair', translation: 'Стул', example: 'Sit on the chair.' },
    { word: 'Bed', translation: 'Кровать', example: 'Go to bed.' },
    { word: 'Book', translation: 'Книга', example: 'I read a book.' },
    { word: 'Pen', translation: 'Ручка', example: 'Write with a pen.' },
    { word: 'Paper', translation: 'Бумага', example: 'Sheet of paper.' },
    { word: 'Phone', translation: 'Телефон', example: 'Call me on the phone.' },
    { word: 'Car', translation: 'Машина', example: 'Drive a car.' },
    { word: 'Bus', translation: 'Автобус', example: 'Wait for the bus.' },
    { word: 'Sun', translation: 'Солнце', example: 'The sun is hot.' },
    { word: 'Moon', translation: 'Луна', example: 'The moon is white.' },
    { word: 'Star', translation: 'Звезда', example: 'Look at the stars.' },
    { word: 'Sky', translation: 'Небо', example: 'The sky is big.' },
    { word: 'Ground', translation: 'Земля', example: 'Walk on the ground.' },
    { word: 'Tree', translation: 'Дерево', example: 'The tree is green.' },
    { word: 'Flower', translation: 'Цветок', example: 'The flower is beautiful.' },
    { word: 'Bird', translation: 'Птица', example: 'The bird is singing.' }
];

// Helper to fill missing words/practice to meet requirement
function ensureRequirements(lesson, index) {
    const content = lesson.content;
    const words = content.words || [];

    // Fill words from bank if empty
    while (words.length < 10) {
        const fallback = fallbackWords[(index * 10 + words.length) % fallbackWords.length];
        words.push({ ...fallback });
    }

    let theory = content.theory;
    if (typeof theory === 'string') {
        theory = { explanation: theory, examples: ['Example usage in context.', 'Observe the pattern.'] };
    } else if (!theory) {
        theory = { explanation: 'This lesson focuses on practical vocabulary and usage. Review the words carefully.', examples: ['Try to build your own sentences.'] };
    }

    const practice = Array.isArray(content.practice) ? content.practice : (content.practice ? [content.practice] : []);
    // Ensure at least 3 practice questions, but allow any number
    while (practice.length < 3) {
        const correctWord = words[practice.length % words.length];
        const correctAnswer = correctWord.translation;

        // Pick 3 random distractor translations from fallback bank
        const distractors = fallbackWords
            .map(w => w.translation)
            .filter(t => t !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        practice.push({
            question: `What is the correct translation of "${correctWord.word.split(' (')[0]}"?`,
            options: [correctAnswer, ...distractors].sort(() => Math.random() - 0.5),
            correct: correctAnswer
        });
    }

    return { ...content, words, theory, practice };
}

async function main() {
    console.log('Seeding courses, modules, and lessons (upsert only, nothing is deleted)...');

    for (const lvl of levelsMap) {
        const courseId = `${lvl.id}-course`;
        const moduleId = `${lvl.id}-module-1`;

        await prisma.course.upsert({
            where: { id: courseId },
            update: createCourseMap(courseId, lvl.name, `English ${lvl.name}`, lvl.desc),
            create: createCourseMap(courseId, lvl.name, `English ${lvl.name}`, lvl.desc)
        });

        await prisma.module.upsert({
            where: { id: moduleId },
            update: createModuleMap(moduleId, courseId, `Main Curriculum: ${lvl.name}`),
            create: createModuleMap(moduleId, courseId, `Main Curriculum: ${lvl.name}`)
        });

        const rawLessons = curriculum[lvl.id] || [];

        // Ensure at least 10 lessons per level for a good experience
        for (let i = 0; i < 10; i++) {
            const lData = rawLessons[i] || {
                title: `${lvl.name} Advanced Prep ${i + 1}`,
                type: 'vocabulary',
                content: { words: [], theory: null, practice: [] }
            };
            const lid = `${lvl.id}-l${i + 1}`;

            const fullContent = ensureRequirements(lData, i);

            await prisma.lesson.upsert({
                where: { id: lid },
                update: createLessonMap(lid, moduleId, `${i + 1}. ${lData.title}`, lData.type, fullContent),
                create: createLessonMap(lid, moduleId, `${i + 1}. ${lData.title}`, lData.type, fullContent)
            });
        }
        console.log(`Seeded ${lvl.name} with 10 lessons.`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
