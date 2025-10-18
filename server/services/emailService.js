import nodemailer from 'nodemailer';

let transporter = null;

export function initializeEmailService() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email credentials not configured. Email service will not be available.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  console.log('Email service initialized');
  return transporter;
}

export async function sendMeetingInvite(meeting) {
  if (!transporter) {
    console.log('Email service not configured, skipping invite email');
    return;
  }

  const meetingDate = new Date(meeting.scheduledDate);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #000000;
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          background: white;
          padding: 40px 30px;
        }
        .content h2 {
          color: #111827;
          font-size: 20px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .content p {
          color: #4b5563;
          margin-bottom: 16px;
        }
        .meeting-details {
          background: #f9fafb;
          padding: 24px;
          border-radius: 8px;
          margin: 24px 0;
          border: 1px solid #e5e7eb;
        }
        .detail-row {
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
        }
        .label {
          font-weight: 600;
          color: #111827;
          min-width: 100px;
          margin-right: 12px;
        }
        .value {
          color: #4b5563;
          flex: 1;
        }
        .join-button {
          display: inline-block;
          background: #000000;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .join-button:hover {
          background: #1f2937;
        }
        .link-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
        }
        .link-section p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .link-section a {
          color: #2563eb;
          word-break: break-all;
          font-size: 13px;
        }
        .footer {
          text-align: center;
          padding: 24px 30px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Meeting Invitation</h1>
        </div>
        <div class="content">
          <h2>You're invited to join a meeting</h2>
          <p>Hi there,</p>
          <p>You have been invited to the following video meeting:</p>

          <div class="meeting-details">
            <div class="detail-row">
              <span class="label">Meeting:</span>
              <span class="value">${meeting.title}</span>
            </div>
            ${meeting.description ? `
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${meeting.description}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Host:</span>
              <span class="value">${meeting.hostName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${meeting.duration} minutes</span>
            </div>
          </div>

          <center>
            <a href="${meeting.meetingLink}" class="join-button">Join Meeting</a>
          </center>

          <div class="link-section">
            <p>Or copy and paste this link into your browser:</p>
            <a href="${meeting.meetingLink}">${meeting.meetingLink}</a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email from Video Meet. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const participants = meeting.participants || [];
  const allEmails = [meeting.hostEmail, ...participants.map(p => p.email)];
  const uniqueEmails = [...new Set(allEmails)];

  try {
    await transporter.sendMail({
      from: `"Video Meet" <${process.env.EMAIL_USER}>`,
      to: uniqueEmails.join(', '),
      subject: `Meeting Invitation: ${meeting.title}`,
      html: emailHTML
    });
    console.log(`Meeting invite sent to: ${uniqueEmails.join(', ')}`);
  } catch (error) {
    console.error('Error sending meeting invite:', error);
  }
}

export async function sendMeetingReminder(meeting) {
  if (!transporter) {
    console.log('Email service not configured, skipping reminder email');
    return;
  }

  const meetingDate = new Date(meeting.scheduledDate);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #000000;
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          background: white;
          padding: 40px 30px;
        }
        .content h2 {
          color: #111827;
          font-size: 20px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .content p {
          color: #4b5563;
          margin-bottom: 16px;
        }
        .reminder-badge {
          background: #ef4444;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          display: inline-block;
          margin: 24px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .meeting-details {
          background: #f9fafb;
          padding: 24px;
          border-radius: 8px;
          margin: 24px 0;
          border: 1px solid #e5e7eb;
        }
        .detail-row {
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
        }
        .label {
          font-weight: 600;
          color: #111827;
          min-width: 100px;
          margin-right: 12px;
        }
        .value {
          color: #4b5563;
          flex: 1;
        }
        .join-button {
          display: inline-block;
          background: #000000;
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 24px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .join-button:hover {
          background: #1f2937;
          color: white;
        }
        .link-section {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 24px;
        }
        .link-section p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .link-section a {
          color: #2563eb;
          word-break: break-all;
          font-size: 13px;
        }
        .footer {
          text-align: center;
          padding: 24px 30px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Meeting Reminder</h1>
        </div>
        <div class="content">
          <center>
            <span class="reminder-badge">Starting in 15 minutes!</span>
          </center>

          <h2>Your meeting is about to start</h2>
          <p>This is a reminder that your meeting is starting soon:</p>

          <div class="meeting-details">
            <div class="detail-row">
              <span class="label">Meeting:</span>
              <span class="value">${meeting.title}</span>
            </div>
            ${meeting.description ? `
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${meeting.description}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="label">Host:</span>
              <span class="value">${meeting.hostName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${meeting.duration} minutes</span>
            </div>
          </div>

          <center>
            <a href="${meeting.meetingLink}" class="join-button">Join Meeting Now</a>
          </center>

          <div class="link-section">
            <p>Or copy and paste this link into your browser:</p>
            <a href="${meeting.meetingLink}">${meeting.meetingLink}</a>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated email from Video Meet. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const participants = meeting.participants || [];
  const allEmails = [meeting.hostEmail, ...participants.map(p => p.email)];
  const uniqueEmails = [...new Set(allEmails)];

  try {
    await transporter.sendMail({
      from: `"Zoom Clone" <${process.env.EMAIL_USER}>`,
      to: uniqueEmails.join(', '),
      subject: `⏰ Reminder: ${meeting.title} starts in 15 minutes`,
      html: emailHTML
    });
    console.log(`Meeting reminder sent to: ${uniqueEmails.join(', ')}`);
  } catch (error) {
    console.error('Error sending meeting reminder:', error);
  }
}
