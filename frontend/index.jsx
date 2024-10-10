import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/backend/backend.did.js';

const App = () => {
  const [principal, setPrincipal] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authClient, setAuthClient] = React.useState(null);

  React.useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal().toString());
      }
    });
  }, []);

  const login = async () => {
    await authClient.login({
      identityProvider: process.env.II_URL,
      onSuccess: async () => {
        setIsAuthenticated(true);
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toString());
      },
    });
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
  };

  const whoami = async () => {
    const agent = new HttpAgent({ identity: authClient.getIdentity() });
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.BACKEND_CANISTER_ID,
    });
    const result = await actor.whoami();
    setPrincipal(result.toString());
  };

  return (
    <div className="container">
      <h1>Who am I?</h1>
      {!isAuthenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <div>
          <button onClick={whoami}>Who am I?</button>
          <button onClick={logout}>Logout</button>
          {principal && <p>Principal ID: {principal}</p>}
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
