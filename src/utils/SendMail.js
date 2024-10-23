import nodemailer from 'nodemailer'

const sendMail = async (email, text, subject) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"HoteLuxury" <no-reply@hoteluxury.com>', // sender address
        to: email, // list of receivers
        subject, // Subject line
        text
    });

    return info
}

export default sendMail