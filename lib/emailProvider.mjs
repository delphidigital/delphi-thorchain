import sgMail from '@sendgrid/mail';

/**
 * If we wanted to implement other
 * email providers, we could simply add a provider argument to the
 * EmailProvider Factory to return different implementations with
 * the same API.
 *
 */
const EmailProvider = () => {
  const sendSengridErrorEmail = async (error, blockchain) => {
    const API_KEY = process.env.SENDGRID_API_KEY;
    if (!API_KEY) {
      // throw new Error('No Sendgrid API key specified');
      console.error('No Sendgrid API key specified');
      return false;
    } else {
      sgMail.setApiKey(API_KEY);
      const msg = {
        to: ['luke@delphidigital.io', 'federico@delphidigital.io'],
        from: 'thorchain@delphidigital.io',
        subject: 'Thorchain script <> error encountered',
        html: `<p>[${blockchain}]: Data fetch failed with: </p> <pre>${error}</pre>`,
      };
      await sgMail.send(msg);
      return true;
    }
  };
  return { sendErrorMail: sendSengridErrorEmail };
};


export default EmailProvider;
