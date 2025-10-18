import cron from 'node-cron';
import { Meeting } from '../models/Meeting.js';
import { sendMeetingReminder } from './emailService.js';

// Check for meetings that need reminders (15 minutes before)
export async function checkAndSendReminders() {
  try {
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // Find meetings scheduled between 15-20 minutes from now that haven't sent reminder
    const meetings = await Meeting.find({
      scheduledDate: {
        $gte: fifteenMinutesFromNow,
        $lt: twentyMinutesFromNow
      },
      status: 'scheduled',
      reminderSent: false
    });

    for (const meeting of meetings) {
      await sendMeetingReminder(meeting);
      meeting.reminderSent = true;
      await meeting.save();
      console.log(`✓ Reminder sent for meeting: ${meeting.title}`);
    }

    if (meetings.length > 0) {
      console.log(`✓ Processed ${meetings.length} meeting reminder(s)`);
    }
  } catch (error) {
    console.error('✗ Error sending reminders:', error);
  }
}

// Update past meetings to completed status
export async function updatePastMeetings() {
  try {
    const now = new Date();

    const result = await Meeting.updateMany(
      {
        scheduledDate: { $lt: now },
        status: 'scheduled'
      },
      {
        $set: { status: 'completed' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✓ Updated ${result.modifiedCount} past meeting(s) to completed`);
    }
  } catch (error) {
    console.error('✗ Error updating past meetings:', error);
  }
}

// Start reminder service using cron jobs
export function startReminderService() {
  console.log('🚀 Starting meeting reminder service with cron jobs...');

  // Check for reminders every 20 minutes
  // Pattern: */20 * * * * = every 20 minutes
  cron.schedule('*/20 * * * *', async () => {
    console.log('⏰ Running scheduled reminder check...');
    await checkAndSendReminders();
  });

  // Update past meetings to completed every hour
  // Pattern: 0 * * * * = at minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('📅 Running scheduled meeting status update...');
    await updatePastMeetings();
  });

  // Run initial check on startup
  console.log('⏰ Running initial reminder check...');
  checkAndSendReminders();
  updatePastMeetings();

  console.log('✓ Cron jobs scheduled successfully');
  console.log('  - Reminder check: Every 5 minutes');
  console.log('  - Status update: Every hour');
}
