importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyD6a29L24aFSgVjmC7NFGXpdWW4g1uQsio",
  authDomain: "tocomfome-754e1.firebaseapp.com",
  projectId: "tocomfome-754e1",
  storageBucket: "tocomfome-754e1.firebasestorage.app",
  messagingSenderId: "997975886937",
  appId: "1:997975886937:web:9bf408c35f1ed8aea13548",
  measurementId: "G-PYJME2PXRD"
});

const messaging = firebase.messaging();

// 🔔 Notificações recebidas em background
messaging.onBackgroundMessage((payload) => {
  console.log("Mensagem recebida em background:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
