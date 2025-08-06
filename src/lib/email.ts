export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (process.env.EMAIL_SIMULATION === 'true') {
    // Simulate email by logging
    console.log('[Simulated Email]', { to, subject, text });
    return true;
  }
  // Here you would integrate with a real email service
  return false;
}