
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getDatabase, ref, get, set, child, push, update, remove } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";


// config API
const firebaseConfig = {
     apiKey: "AIzaSyBwBJRK4I1X98Jc_DWAOml7S8dTbtpPUrA",
     authDomain: "teste-web1-2024.firebaseapp.com",
     databaseURL: "https://teste-web1-2024-default-rtdb.firebaseio.com",
     projectId: "teste-web1-2024",
     storageBucket: "teste-web1-2024.appspot.com",
     messagingSenderId: "253023675656",
     appId: "1:253023675656:web:778c41088a47e39359b8bd"
   };


const app= initializeApp(firebaseConfig);

const db=getDatabase();

/* -------- References ---------- */
let varId=document.getElementById("formId");
let varTitulo=document.getElementById("formTitulo");
let varArtista=document.getElementById("formArtista");
let gravar=document.getElementById("btGravar");
let ler=document.getElementById("btLer");
let atualizar=document.getElementById("btEdit");
let excluir=document.getElementById("btExcluir");

/*----- botoes e funcoes -----*/
gravar.addEventListener('click',inserirDados);
ler.addEventListener('click',lerDados);
atualizar.addEventListener('click',atualizarDados);
excluir.addEventListener('click',excluirDados);

/*-------- funções -----------*/
function inserirDados(){
     //para gerar chaves automáticas use: const novaChave = push(child(ref(db), 'Musicas')).key;

     set(ref(db, "Musicas/"+varId.value),{
          titulo:varTitulo.value,
          artista: varArtista.value

     }).then(()=>{
          console.log("incluído com sucesso");
     })
     .catch((error)=>{
          console.log("erro de inclusão");
     })
}

function lerDados(){
     const dbref = ref(db);
     get(child(dbref, "Musicas/"+varId.value)).then((snapshot)=>{
          if(snapshot.exists()){
               varTitulo.value = snapshot.val().titulo;
               varArtista.value= snapshot.val().artista;
          }
          else alert("nao existe dado");

     }).catch((error)=>{
          console.log("erro ",error);
     })
}

function atualizarDados(){
    update(ref(db, "Musicas/"+varId.value),{
          titulo:varTitulo.value,
          artista: varArtista.value

     }).then(()=>{
          console.log("atualizado com sucesso");
     })
     .catch((error)=>{
          console.log("erro de atualizacao");
     })
}
function excluirDados(){
     remove(ref(db, "Musicas/"+varId.value),{
           titulo:varTitulo.value,
           artista: varArtista.value
 
      }).then(()=>{
           console.log("excluído com sucesso");
      })
      .catch((error)=>{
           console.log("erro de exclusão");
      })
 }