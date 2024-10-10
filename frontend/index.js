import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

const content = document.getElementById('content');
const themeToggle = document.getElementById('themeToggle');

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

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.add(savedTheme);
  updateThemeToggleText();
}

function renderLogin() {
  content.innerHTML = `
    <button id="loginButton">Login</button>
    <p>Login with Internet Identity to view your user principal</p>
  `;
  document.getElementById('loginButton').addEventListener('click', login);
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
  if (!isAuthenticated) {
    console.error("User is not authenticated");
    return;
  }

  const agent = new HttpAgent({
    identity: authClient.getIdentity(),
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
    renderAuthenticated();
  } catch (error) {
    console.error("Error calling whoami:", error);
    content.innerHTML += `<p>Error: ${error.message}</p>`;
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.body.classList.remove(currentTheme);
  document.body.classList.add(newTheme);
  
  localStorage.setItem('theme', newTheme);
  updateThemeToggleText();
}

function updateThemeToggleText() {
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  themeToggle.textContent = `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`;
}

themeToggle.addEventListener('click', toggleTheme);

init();
