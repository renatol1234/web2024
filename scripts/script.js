
// Configuração do Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-storage.js";
import { getDatabase, ref, set, push, get, update, remove } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBwBJRK4I1X98Jc_DWAOml7S8dTbtpPUrA",
    authDomain: "teste-web1-2024.firebaseapp.com",
    databaseURL: "https://teste-web1-2024-default-rtdb.firebaseio.com",
    projectId: "teste-web1-2024",
    storageBucket: "teste-web1-2024.appspot.com",
    messagingSenderId: "253023675656",
    appId: "1:253023675656:web:778c41088a47e39359b8bd"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getDatabase(app);
const auth = getAuth(app);
const adminId = "AHiWzdBaC3PJ9ao6BA9NCpO01Ir1"; // ID do administrador

function displayAlbums() {
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';
    const dbref = ref(db, 'Musicas');
    get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const album = childSnapshot.val();
                const albumId = childSnapshot.key;
                const albumDiv = document.createElement('div');
                albumDiv.className = 'album';

                // Adiciona as faixas como texto
                let faixasHTML = '<ul>';
                if (album.faixas) {
                    album.faixas.forEach((faixa, index) => {
                        faixasHTML += `<li> ${faixa}</li>`;
                    });
                }
                faixasHTML += '</ul>';

                albumDiv.innerHTML = `
                    <h3>${album.titulo}</h3>
                    <p>${album.artista}</p>
                    <img src="${album.fotoURL}" alt="${album.titulo}" />
                    ${faixasHTML}
                    <button class="favorite" data-album-id="${albumId}">Favorito (${album.favoritosCount || 0})</button>
                    <button class="like" data-album-id="${albumId}">Like (${album.likesCount || 0})</button>
                    ${auth.currentUser && auth.currentUser.uid === adminId ? `<button class="delete" data-album-id="${albumId}">Excluir</button>` : ''}
                `;
                albumList.appendChild(albumDiv);

                // Verifica se o álbum já foi marcado como favorito
                if (album.favorito && album.favorito[auth.currentUser.uid]) {
                    document.querySelector(`button.favorite[data-album-id="${albumId}"]`).classList.add('active');
                }

                // Verifica se o álbum já foi marcado como liked
                if (album.liked && album.liked[auth.currentUser.uid]) {
                    document.querySelector(`button.like[data-album-id="${albumId}"]`).classList.add('active');
                }
            });
        }
    }).catch((error) => {
        console.log("Erro ao buscar álbuns:", error);
    });
}



document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('albums-container').style.display = 'block';
            displayUserInfo();
            displayAlbums();
            
        })
        .catch((error) => {
            console.error("Erro de login:", error);
        });
});

document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            set(ref(db, 'users/' + userCredential.user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email
            });
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('albums-container').style.display = 'block';
            displayUserInfo();
            displayAlbums();
        })
        .catch((error) => {
            console.error("Erro ao cadastrar:", error);
        });
});

document.getElementById('google-login').addEventListener('click', function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('albums-container').style.display = 'block';
            displayUserInfo();
            displayAlbums();
        })
        .catch((error) => {
            console.error("Erro ao fazer login com Google:", error);
        });
});

document.getElementById('logout-button').addEventListener('click', function() {
    signOut(auth).then(() => {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('albums-container').style.display = 'none';
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
    });
});

function displayUserInfo() {
    const userInfo = document.getElementById('user-info');
    const user = auth.currentUser;
    if (user) {
        get(ref(db, 'users/' + user.uid)).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                userInfo.innerHTML = `Bem-vindo, ${userData.firstName} ${userData.lastName} (${user.email})!`;
            } else {
                userInfo.innerHTML = `Bem-vindo, ${user.email}`;
            }
        }).catch((error) => {
            console.error("Erro ao buscar informações do usuário:", error);
        });
    }
}

document.getElementById('album-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const titulo = document.getElementById('formTitulo').value;
    const artista = document.getElementById('formArtista').value;
    const foto = document.getElementById('formFoto').files[0];
    const faixas = Array.from(document.querySelectorAll('.faixa')).map(input => input.value);

    const newAlbumRef = push(ref(db, 'Musicas'));

    // Verifica se a foto foi selecionada
    if (!foto) {
        console.error("Nenhuma foto selecionada.");
        return;
    }

    // Upload da foto do álbum
    const fotoRef = storageRef(storage, `fotos/${newAlbumRef.key}/${foto.name}`);
    uploadBytes(fotoRef, foto).then(snapshot => {
        console.log("Foto enviada com sucesso:", snapshot);
        return getDownloadURL(snapshot.ref);
    }).then(fotoURL => {
        console.log("URL da foto obtida:", fotoURL);
        // Após obter a URL da foto, adiciona os dados do álbum ao Realtime Database
        return set(newAlbumRef, {
            titulo: titulo,
            artista: artista,
            faixas: faixas,
            fotoURL: fotoURL,
            favorito: {}, // Inicializa a lista de favoritos como vazia
            liked: {}     // Inicializa a lista de likes como vazia
        });
    }).then(() => {
        console.log("Álbum adicionado com sucesso.");
        // Atualiza a exibição dos álbuns
        displayAlbums();
    }).catch((error) => {
        console.error("Erro ao adicionar álbum:", error);
    });
});

document.getElementById('add-faixa').addEventListener('click', function() {
    const faixaContainer = document.getElementById('faixas-container');
    const numFaixas = document.querySelectorAll('.faixa').length;
    const newFaixa = document.createElement('input');
    newFaixa.type = 'text';
    newFaixa.className = 'faixa';
    newFaixa.placeholder = `Faixa ${numFaixas + 1}`;
    faixaContainer.appendChild(newFaixa);
});

document.getElementById('album-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('favorite')) {
        const albumId = event.target.getAttribute('data-album-id');
        const user = auth.currentUser;
        if (!user) {
            alert("Por favor, faça login para favoritar álbuns.");
            return;
        }
        const albumRef = ref(db, `Musicas/${albumId}`);
        get(albumRef).then((snapshot) => {
            if (snapshot.exists()) {
                const album = snapshot.val();
                const favoritoRef = ref(db, `Musicas/${albumId}/favorito/${user.uid}`);
                if (album.favorito && album.favorito[user.uid]) {
                    remove(favoritoRef).then(() => {
                        update(albumRef, { favoritosCount: (album.favoritosCount || 1) - 1 });
                        displayAlbums();
                    });
                } else {
                    set(favoritoRef, true).then(() => {
                        update(albumRef, { favoritosCount: (album.favoritosCount || 0) + 1 });
                        displayAlbums();
                    });
                }
            }
        });
    } else if (event.target.classList.contains('like')) {
        const albumId = event.target.getAttribute('data-album-id');
        const user = auth.currentUser;
        if (!user) {
            alert("Por favor, faça login para curtir álbuns.");
            return;
        }
        const albumRef = ref(db, `Musicas/${albumId}`);
        get(albumRef).then((snapshot) => {
            if (snapshot.exists()) {
                const album = snapshot.val();
                const likedRef = ref(db, `Musicas/${albumId}/liked/${user.uid}`);
                if (album.liked && album.liked[user.uid]) {
                    remove(likedRef).then(() => {
                        update(albumRef, { likesCount: (album.likesCount || 1) - 1 });
                        displayAlbums();
                    });
                } else {
                    set(likedRef, true).then(() => {
                        update(albumRef, { likesCount: (album.likesCount || 0) + 1 });
                        displayAlbums();
                    });
                }
            }
        });
    } else if (event.target.classList.contains('delete')) {
        const albumId = event.target.getAttribute('data-album-id');
        if (confirm("Tem certeza que deseja excluir este álbum?")) {
            remove(ref(db, `Musicas/${albumId}`)).then(() => {
                console.log("Álbum excluído com sucesso.");
                displayAlbums();
            }).catch((error) => {
                console.error("Erro ao excluir álbum:", error);
            });
        }
    }
});


// Função para carregar informações do usuário autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('albums-container').style.display = 'block';
        displayUserInfo();
        displayAlbums();
        displayComments();
    } else {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('albums-container').style.display = 'none';
    }
});

// Função para mostrar comentários
function displayComments() {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    const dbref = ref(db, 'comments');
    get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const comment = childSnapshot.val();
                const commentId = childSnapshot.key;
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <p><strong>${comment.user}</strong>: ${comment.text}</p>
                    ${auth.currentUser && auth.currentUser.uid === adminId ? `
                        <button class="reply" data-comment-id="${commentId}">Responder</button>
                        <button class="delete-comment" data-comment-id="${commentId}">Excluir</button>` : ''}
                `;
                commentsList.appendChild(commentDiv);
            });
        }
    }).catch((error) => {
        console.log("Erro ao buscar comentários:", error);
    });
}

// Função para adicionar comentário
document.getElementById('comment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const user = document.getElementById('comment-user').value;
    const text = document.getElementById('comment-text').value;

    const newCommentRef = push(ref(db, 'comments'));
    set(newCommentRef, {
        user: user,
        text: text,
        timestamp: Date.now()
    }).then(() => {
        displayComments();
    }).catch((error) => {
        console.error("Erro ao adicionar comentário:", error);
    });
});


// Função para excluir comentário (somente para administradores)
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-comment')) {
        const commentId = event.target.getAttribute('data-comment-id');
        remove(ref(db, 'comments/' + commentId))
            .then(() => {
                displayComments();
            })
            .catch((error) => {
                console.error("Erro ao excluir comentário:", error);
            });
    }
});

// Função para responder comentário (somente para administradores)
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('reply')) {
        const commentId = event.target.getAttribute('data-comment-id');
        const replyText = prompt("Digite sua resposta:");
        if (replyText) {
            const replyRef = push(ref(db, 'comments/' + commentId + '/replies'));
            set(replyRef, {
                user: auth.currentUser.uid,
                text: replyText,
                timestamp: Date.now()
            }).then(() => {
                displayComments();
            }).catch((error) => {
                console.error("Erro ao responder comentário:", error);
            });
        }
    }
});




// Função de pesquisa
document.getElementById('search-button').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const albumList = document.getElementById('album-list');
    albumList.innerHTML = '';
    const dbref = ref(db, 'Musicas');
    get(dbref).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const album = childSnapshot.val();
                const albumId = childSnapshot.key;
                if (album.titulo.toLowerCase().includes(searchTerm) || album.artista.toLowerCase().includes(searchTerm)) {
                    const albumDiv = document.createElement('div');
                    albumDiv.className = 'album';
                    
                    // Adiciona as faixas
                    let faixasHTML = '<ul>';
                    if (album.faixas) {
                        album.faixas.forEach(faixa => {
                            faixasHTML += `<li>${faixa}</li>`;
                        });
                    }
                    faixasHTML += '</ul>';

                    albumDiv.innerHTML = `
                        <h3>${album.titulo}</h3>
                        <p>${album.artista}</p>
                        <img src="${album.fotoURL}" alt="${album.titulo}" />
                        ${faixasHTML}
                        <button class="favorite" data-album-id="${albumId}">Favorito</button>
                        <button class="like" data-album-id="${albumId}">Like</button>
                        ${auth.currentUser && auth.currentUser.uid === adminId ? `<button class="delete" data-album-id="${albumId}">Excluir</button>` : ''}
                    `;
                    albumList.appendChild(albumDiv);

                    // Verifica se o álbum já foi marcado como favorito
                    if (album.favorito && album.favorito[auth.currentUser.uid]) {
                        document.querySelector(`button.favorite[data-album-id="${albumId}"]`).classList.add('active');
                    }

                    // Verifica se o álbum já foi marcado como liked
                    if (album.liked && album.liked[auth.currentUser.uid]) {
                        document.querySelector(`button.like[data-album-id="${albumId}"]`).classList.add('active');
                    }
                }
            });
        }
    }).catch((error) => {
        console.log("Erro ao buscar álbuns:", error);
    });
});

// Função para enviar mensagem de contato
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    const newMessageRef = push(ref(db, 'Mensagens'));

    set(newMessageRef, {
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString()
    }).then(() => {
        console.log("Mensagem enviada com sucesso");
        document.getElementById('contact-form').reset();
    }).catch((error) => {
        console.error("Erro ao enviar mensagem:", error);
    });
});
