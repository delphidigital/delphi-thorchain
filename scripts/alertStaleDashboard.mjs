import axios from 'axios';

/*
  Every <checkInterval> seconds, hit the <endpointUrl>.
  If we don't see any change in the response even after <maxFailedChecks> attempts, we know that the endpoint is stale and public dashboard data is not being updated.
  Send an alert via the <notify> callback. Also send an alert if the endpoint resumes normal operation afterwards.
*/
function checkStaleEndpoint(endpointUrl, maxFailedChecks, checkInterval, notify) {

  let markedUnreachable = false;
  let markedStale = false;
  let failedChecks = 0;
  let previousResponse = '';

  setInterval(() => axios.get(endpointUrl)
    .then(({data}) => {

      const response = JSON.stringify(data) // JSON key order is not guaranteed by the spec so differences here might be spurious. Good enough in practice.

      if(response !== previousResponse)
        failedChecks = 0
      else
        failedChecks++;

      previousResponse = response;
      
      if(!markedStale && failedChecks >= maxFailedChecks) {
        markedStale = true
        notify(`Endpoint ${endpointUrl} has stopped updating (${maxFailedChecks*checkInterval} seconds ago on ${new Date().toISOString().slice(11,16)} UTC)`)
      }
        
      if(markedStale && failedChecks < maxFailedChecks) {
        markedStale = false
        notify(`Endpoint ${endpointUrl} is now updating again (${new Date().toISOString().slice(11,16)} UTC)`)
      }

      if(markedUnreachable) {
        markedUnreachable = false
        notify(`Endpoint ${endpointUrl} is reacheable again (${new Date().toISOString().slice(11,16)} UTC)`)
      }

    })
    .catch(error => {

      if(!markedUnreachable) {
        markedUnreachable = true
        notify(`Endpoint ${endpointUrl} is unreacheable (${new Date().toISOString().slice(11,16)} UTC)`)
      }

    }),
  checkInterval*1e3);

}


// Pop up a system tray notification if running this script locally on your own machine
//yarn add node-notifier --dev
//import notifier from 'node-notifier';
function localNotifier(message) {
  notifier.notify({
    title: 'Dashboard Status',
    message: message,
    sound: true,
    wait: true,
  })
}


// Simple REST call for Telegram (you need to fill in the token and chat_id, see t.me/botfather + https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id)
function telegramNotifier(message) {
  const TELEGRAM_API_TOKEN = '';
  const TELEGRAM_CHAT_ID = '';
  axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  })
}


// Send an email (you need to figure out the SMTP config on the host first, same as for linux sendmail)
//yarn add sendmail --dev
//import sendmail from 'sendmail';
function sendMail(message) {  
  sendmail({
    from: 'monitoring@delphidigital.io',
    to: 'alerts@delphidigital.io',
    subject: 'Dashboard Status',
    html: message,
  })
}


// Check the public dashboard
checkStaleEndpoint('https://defi.delphidigital.io/chaosnet/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('https://defi.delphidigital.io/chaosnet/v1/network', 5, 60, localNotifier)
checkStaleEndpoint('https://defi.delphidigital.io/chaosnet/int/extra', 5, 60, localNotifier)
checkStaleEndpoint('https://defi.delphidigital.io/testnet/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('https://defi.delphidigital.io/testnet/v1/network', 5, 60, localNotifier)
checkStaleEndpoint('https://defi.delphidigital.io/testnet/int/extra', 5, 60, localNotifier)

/*
// Check the API servers directly
checkStaleEndpoint('http://168.119.20.164:1317/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('http://168.119.20.164:8080/v1/network', 5, 60, localNotifier)
checkStaleEndpoint('http://138.201.80.182:1317/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('http://138.201.80.182:8080/v1/network', 5, 60, localNotifier)
*/

/*
// Check the localhost cache
checkStaleEndpoint('http://localhost:3021/chaosnet/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('http://localhost:3021/chaosnet/v1/network', 5, 60, localNotifier)
checkStaleEndpoint('http://localhost:3021/chaosnet/int/extra', 5, 60, localNotifier)
checkStaleEndpoint('http://localhost:3021/testnet/thorchain/lastblock', 5, 60, localNotifier)
checkStaleEndpoint('http://localhost:3021/testnet/v1/network', 5, 60, localNotifier)
checkStaleEndpoint('http://localhost:3021/testnet/int/extra', 5, 60, localNotifier)
*/