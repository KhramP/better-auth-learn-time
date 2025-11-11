import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_APP_PASSWORD,
  },
});

export function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to,
    subject: `${subject}`,
    html: `${html}`,
  };

  return transporter.sendMail(mailOptions);
}
