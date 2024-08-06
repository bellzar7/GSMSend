const express = require('express');
const multer  = require('multer');
const storage = multer.memoryStorage(); // Зберігає файли в пам'яті
const upload = multer({ storage });
const app = express();
const cors = require('cors');
const nodemailer = require("nodemailer");
const sharp = require('sharp');

const corsOptions = {
    origin: '*', // Дозволяє всі джерела
    methods: ['POST'], // Дозволяє тільки POST запити
};

app.use(cors(corsOptions));
app.use(express.json())
app.post('/post', upload.single('file'), (req, res) => {

    const file = req.file
    const { name, phone, email, comment, to } = req.body

    // Перевірка на обов'язкові поля (name та phone)
    if (!name || !email) {
        return res.status(400).send('Name and phone are required');
    }

    // Формування тексту електронного листа
    let mailText = `Name - ${name}\nEmail - ${email}`;
    if (phone) mailText += `\nPhone - ${phone}`;
    if (comment) mailText += `\nComment - ${comment}`;

    // Відправити електронного листа з файлом
    const nodemailer = require('nodemailer');
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'agencyznaesh@gmail.com',
            pass: 'paaqbhzbjnjxpssb'
        }
    });

    // Перевірка, чи є файл, перед його додаванням до вкладення
    let attachments = [];
    if (file && file.originalname && file.path) {
        attachments.push({
            filename: file.originalname,
            path: file.path
        });
    }
    let mailOptions = {
        from: email,
        to: to,
        subject: 'New lead from website',
        text: mailText,
        attachments: attachments
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });


    // Відповідь користувачеві
    res.send({response: 'Message send!'});
});



// Обробник для маршруту '/postImage'
app.post('/sendImage', upload.any(), async (req, res) => {
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

app.get('/', (req, res) => {
    res.status(200).json('Health check works!')
})

app.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});
