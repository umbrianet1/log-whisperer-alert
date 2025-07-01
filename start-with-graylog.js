
#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

// Legge la configurazione dal localStorage simulato (file)
const getGraylogUrl = () => {
  try {
    // In un ambiente reale, questo dovrebbe leggere da un file di configurazione
    // Per ora usiamo un valore di default che può essere sovrascritto
    return process.env.GRAYLOG_URL || 'http://localhost:9000';
  } catch (error) {
    return 'http://localhost:9000';
  }
};

const graylogUrl = getGraylogUrl();
console.log(`🚀 Avvio server con Graylog URL: ${graylogUrl}`);

// Avvia il server Vite con la variabile d'ambiente
const child = spawn('npm', ['run', 'dev'], {
  env: {
    ...process.env,
    VITE_GRAYLOG_URL: graylogUrl,
  },
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code);
});
