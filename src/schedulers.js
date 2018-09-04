import * as schedule from 'node-schedule-tz';
import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccount = require(path.resolve('./config/firebaseKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://astro-android-13c44.firebaseio.com"
});
const texts = [
    "Διάβασε Τώρα Έγκυρες Προβλέψεις!",
    "Δες πως θα είναι τα οικονομικά σου!",
    "Μαθε πότε θα βρεις τον έρωτα της ζωής σου!",
    "Το μέλλον σου είναι γραμμένο εδω! Μάθε το τώρα!",
    "Άμεσες προβλέψεις για το μέλλον, από τους καλύτερους αστρολόγους!",
    "Ανακάλυψε τι σου επιφυλάσσει το μέλλον!"
];
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(2, 6)];
rule.hour = 8;
rule.minute = 0;
rule.tz = 'Europe/Athens';

var j = schedule.scheduleJob(rule, function(){
  
    // This registration token comes from the client FCM SDKs.
    var registrationToken = 'dmu4c2rXQZs:APA91bHGc-j87FMMqyLebuQXy4fPTqtw2Gs-Ok-Kc0-HmHKsL7E4WhGhMfIhFTbqh4TyscK1VYvlrH8s9lRHzrLeY2SRjIr3IXzvyveKq7AIQdf_S68iCK17SHSBOgP9Elrgu_c2kl5H8WFT7ADLDkX9knG7eaP4YA';

    // See documentation on defining a message payload.
    var message = {
        notification: {
            body: texts[Math.floor(Math.random() * texts.length)]
        },
        token: registrationToken
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
        })
        .catch((error) => {
        console.log('Error sending message:', error);
        });

});