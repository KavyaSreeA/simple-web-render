/* ════════════════════════════════════════════════════════════
   EMAIL SERVICE  –  EmailJS Integration
   ──────────────────────────────────────────────────────────
   HOW TO SET UP:
   1. Go to https://www.emailjs.com and create a free account
   2. Add an Email Service (Gmail, Outlook, etc.)
   3. Create an Email Template with these variables:
        {{to_email}}, {{to_name}}, {{event_title}},
        {{event_date}}, {{event_location}}, {{amount}},
        {{confirmation_id}}
   4. Copy your Service ID, Template ID, and Public Key below
   ══════════════════════════════════════════════════════════ */

const EMAIL_CONFIG = {
  serviceId:  'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey:  'YOUR_EMAILJS_PUBLIC_KEY',
};

function isEmailConfigured() {
  return EMAIL_CONFIG.serviceId !== 'YOUR_EMAILJS_SERVICE_ID';
}

function sendConfirmationEmail(data) {
  if (!isEmailConfigured()) {
    console.log('EmailJS not configured. Email data:', data);
    return Promise.resolve({ status: 200, text: 'Email service not configured (dev mode)' });
  }

  return emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, {
    to_email:        data.email,
    to_name:         data.name,
    event_title:     data.eventTitle,
    event_date:      data.eventDate || '',
    event_location:  data.eventLocation || '',
    amount:          data.amount ? '₹' + Number(data.amount).toLocaleString('en-IN') : 'Free',
    confirmation_id: data.confirmationId || generateId('CONF'),
  }, EMAIL_CONFIG.publicKey);
}
