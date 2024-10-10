import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

const content = document.getElementById('content');

let authClient;
let principal;

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
  `;
  document.getElementById('loginButton').addEventListener('click', login);
}

function renderAuthenticated() {
  content.innerHTML = `
    <button id="whoamiButton">Who am I?</button>
    <button id="logoutButton">Logout</button>
    ${principal ? `<p>Principal ID: ${principal}</p>` : ''}
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
  const agent = new HttpAgent({ identity: authClient.getIdentity() });
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
  const result = await actor.whoami();
  principal = result.toString();
  renderAuthenticated();
}

init();
