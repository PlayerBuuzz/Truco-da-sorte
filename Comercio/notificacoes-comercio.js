import { getFirestore, collection, query, where, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Inicializa depois que firebase já existe */

export function iniciarNotificacoes(uid){

  const db = window.db; // vem da tela principal
  const messaging = window.messaging;

  if(!db){
    console.error("Firestore não iniciado");
    return;
  }

  const q = query(
    collection(db,"pedidos"),
    where("comercioId","==",uid)
  );

  let iniciou = false;

  onSnapshot(q, snap => {

    if(!iniciou){
      iniciou = true;
      return;
    }

    snap.docChanges().forEach(change => {

      if(change.type === "added"){

        const p = change.doc.data();

        new Notification("📦 Novo Pedido!",{
          body: `${p.clienteNome} pediu ${p.produtoNome}`,
          icon: "/img/logo.png"
        });

      }

    });

  });

}
