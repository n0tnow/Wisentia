'use client';

import { useEffect, useState } from 'react';

export default function Web3Handler({ onConnect, onDisconnect }) {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    const checkIfMetaMaskIsConnected = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccounts(accounts);
            if (onConnect) onConnect(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to get accounts', error);
        }
      }
    };
    
    checkIfMetaMaskIsConnected();
    
    // MetaMask events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length > 0) {
          if (onConnect) onConnect(newAccounts[0]);
        } else {
          if (onDisconnect) onDisconnect();
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [onConnect, onDisconnect]);

  return null;
}