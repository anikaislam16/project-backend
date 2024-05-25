const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abdurrayhancse19018@gmail.com', // Replace with your Gmail email
        pass: 'geoz zrbf zsss ncki',  // Replace with your Gmail password or an App Password if using 2-factor authentication
    },
});
const sendJoingProjectEmail = (toEmail, username, projectId, projectName, role) => {
    const mailOptions = {
        from: 'abdurrayhancse19018@gmail.com',  // Replace with your Gmail email
        to: toEmail,
        subject: `Joining request for ${projectName} as a ${role}`,
        html: `<p>Congratulations ${username}, you have been selected for the project named ${projectName} as a ${role}.</p>
      <p>Click the button below to check the board:</p>
      <a href="http://localhost:3000/project/kanban/${projectId}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Check Board</a>`,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    })
};
const sendJoingcardEmail = (toEmail, username, projectId, boardName, cardName, role) => {
    const mailOptions = {
        from: 'abdurrayhancse19018@gmail.com',  // Replace with your Gmail email
        to: toEmail,
        subject: `Joining request in a card named, ${cardName} as a ${role}`,
        html: `<p>Congratulations ${username}, you have been assigned for the card named ${cardName}, under the board ${boardName} as a role of ${role}.</p>
      <p>Click the button below to check the board:</p>
      <a href="http://localhost:3000/project/kanban/${projectId}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Check Board</a>`,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    })
};
const sendRemovingcardEmail = (toEmail, username, projectId, boardName, cardName) => {
    const mailOptions = {
        from: 'abdurrayhancse19018@gmail.com',  // Replace with your Gmail email
        to: toEmail,
        subject: `Removing request from a card named, ${cardName}`,
        html: `<p> Dear ${username}, you have been sacked for the card named ${cardName}, under the board ${boardName} .</p>
      <p>Stay with us for further update</p>
      <a href="http://localhost:3000/project/kanban/${projectId}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">Check Board</a>`,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    })
};
const sendRemovingProjectEmail = (toEmail, username, projectName, role) => {
    const mailOptions = {
        from: 'abdurrayhancse19018@gmail.com',  // Replace with your Gmail email
        to: toEmail,
        subject: `Sacked from ${projectName} as a ${role}`,
        html: `<p>dear ${username}, Sorry to say, you have been sacked for the project named ${projectName} as a ${role}.</p>
      <p>Stay Connected, for furthur notifications</p>`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    })
};

module.exports = { sendJoingProjectEmail, sendRemovingProjectEmail, sendJoingcardEmail, sendRemovingcardEmail }