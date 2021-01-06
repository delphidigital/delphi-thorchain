import sgMail from '@sendgrid/mail';

const API_KEY = process.env.SENDGRID_API_KEY;
if (!API_KEY) { throw new Error('No Sendgrid API key specified'); }
sgMail.setApiKey(API_KEY);

const sendErrorEmail = async (error, blokchain) => {
  const msg = {
    to: 'henryollh205@gmail.com',
    from: 'achejuega@gmail.com', // Use the email address or domain you verified above
    subject: 'Thorchain script <> error encountered',
    text: '',
    html: `<p>It seems the fetch data job has stopped for the ${blokchain}</p> <pre>${error}</pre>`,
  };
  await sgMail.send(msg);
};

export default {
  sendErrorEmail,
};
