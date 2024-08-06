const express = require('express');
const multer  = require('multer');
const storage = multer.memoryStorage(); // Зберігає файли в пам'яті
const upload = multer({ storage });
const index = express();
const cors = require('cors');
const nodemailer = require("nodemailer");
const sharp = require('sharp');

const corsOptions = {
    origin: '*', // Дозволяє всі джерела
    methods: ['POST'], // Дозволяє тільки POST запити
};

index.use(cors(corsOptions));
index.use(express.json())

// Обробник для маршруту '/postImage'
index.post('/sendImage', upload.any(), async (req, res) => {
    try {
        // Отримуємо перший файл з масиву файлів
        const file = req.files[0];
        const buffer = file.buffer;

        // Обробляємо фото (наприклад, змінюємо розмір)
        const processedBuffer = await sharp(buffer)
            .resize(800, 600) // Змінює розмір до 800x600
            .toBuffer();

        // Відправка фото на пошту
        await sendEmail(processedBuffer);

        res.status(200).send('Фото успішно отримано та відправлено на пошту!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Сталася помилка під час обробки фото.');
    }
});

// Функція для відправки фото на пошту
async function sendEmail(photoBuffer) {
    // Налаштування транспорту для Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'belelya.nazar1999@gmail.com',
            pass: 'fosb hyru eskc ueek'
        }
    });

    // Налаштування листа
    const mailOptions = {
        from: 'belelya.nazar1999@gmail.com',
        to: 'belelya.nazar1999@gmail.com',
        subject: 'Новий фото з GSM модуля',
        text: 'Будь ласка, знайдіть прикріплене фото.',
        attachments: [
            {
                filename: 'photo.jpg',
                content: photoBuffer,
                contentType: 'image/jpeg'
            }
        ]
    };

    // Відправка листа
    await transporter.sendMail(mailOptions);
}

index.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

index.get('/', (req, res) => {
    res.status(200).json('Health check works!')
})

index.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});
