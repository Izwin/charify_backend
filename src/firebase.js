import admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert('src/services/YOUR_FILE_NAME.json'),
});

export default admin;
