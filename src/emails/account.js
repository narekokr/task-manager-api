const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'narek.okroyan@outlook.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'narek.okroyan@outlook.com',
        subject: 'Goodbye',
        text: `We are sorry to see you leave ${name}. Let me know how we could have kept you with us.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}