import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

const content = document.getElementById('content');

let authClient;
let principal;

const DEFAULT_UNAUTHENTICATED_PRINCIPAL = '2vxsx-fae';

async function init() {
  authClient = await AuthClient.create();
  const isAuthenticated = await authClient.isAuthenticated();

  if (isAuthenticated) {
    const identity = authClient.getIdentity();
    principal = identity.getPrincipal().toString();
    renderAuthenticated();
  } else {
    renderLogin();
  }
}

function renderLogin() {
  content.innerHTML = `
    <button id="loginButton">Login</button>
    <button id="whoamiButton">Who am I?</button>
  `;
  document.getElementById('loginButton').addEventListener('click', login);
  document.getElementById('whoamiButton').addEventListener('click', whoami);
}

function renderAuthenticated() {
  content.innerHTML = `
    <button id="whoamiButton">Who am I?</button>
    <button id="logoutButton">Logout</button>
    ${principal ? `<p>Authenticated Principal ID: ${principal}</p>` : ''}
  `;
  document.getElementById('whoamiButton').addEventListener('click', whoami);
  document.getElementById('logoutButton').addEventListener('click', logout);
}

async function login() {
  await authClient.login({
    identityProvider: process.env.II_URL,
    onSuccess: async () => {
      const identity = authClient.getIdentity();
      principal = identity.getPrincipal().toString();
      renderAuthenticated();
    },
  });
}

async function logout() {
  await authClient.logout();
  principal = null;
  renderLogin();
}

async function whoami() {
  const isAuthenticated = await authClient.isAuthenticated();
  const agent = new HttpAgent({
    identity: isAuthenticated ? authClient.getIdentity() : undefined,
  });
  
  const actor = Actor.createActor(
    ({ IDL }) => {
      return IDL.Service({
        'whoami': IDL.Func([], [IDL.Principal], ['query'])
      });
    },
    {
      agent,
      canisterId: process.env.BACKEND_CANISTER_ID,
    }
  );
  
  try {
    const result = await actor.whoami();
    principal = result.toString();
    
    if (isAuthenticated) {
      renderAuthenticated();
    } else {
      content.innerHTML = `
        <button id="loginButton">Login</button>
        <button id="whoamiButton">Who am I?</button>
        <p>Unauthenticated Principal ID: ${principal === DEFAULT_UNAUTHENTICATED_PRINCIPAL ? DEFAULT_UNAUTHENTICATED_PRINCIPAL : 'Unknown'}</p>
      `;
      document.getElementById('loginButton').addEventListener('click', login);
      document.getElementById('whoamiButton').addEventListener('click', whoami);
    }
  } catch (error) {
    console.error("Error calling whoami:", error);
    content.innerHTML += `<p>Error: ${error.message}</p>`;
  }
}

init();
