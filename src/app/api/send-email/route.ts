import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();

        console.log("Attempting to send email to:", to);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'shipontalukdar.webestone@gmail.com',
                pass: 'gzmxxkcrmiqvblvv' // Spaces removed correctly
            }
        });

        const mailOptions = {
            from: '"Webestone Task Manager" <shipontalukdar.webestone@gmail.com>',
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Email Send Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
