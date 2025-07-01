
# LogGuard AI - Guida alla Configurazione

## Prerequisiti

### 1. Graylog Server
- Graylog installato e configurato
- API REST abilitata
- Credenziali admin o API token

### 2. OpenWebUI + Ollama
- OpenWebUI installato e funzionante
- Almeno un modello AI scaricato (es. llama3.1, llama3.2)
- API key configurata

### 3. Telegram Bot (opzionale)
- Bot creato tramite @BotFather
- Bot token ottenuto
- Chat ID del gruppo/canale dove inviare le notifiche

## Configurazione Passo-Passo

### 1. Avvio dell'Applicazione
```bash
npm install
npm run dev
```

### 2. Configurazione Graylog
1. Vai su "Settings" nella sidebar
2. Sezione "Connessione Graylog":
   - **URL Server**: `http://your-graylog-server:9000`
   - **Username**: `admin` (o il tuo username)
   - **Password**: La tua password Graylog
   - **API Token**: (opzionale, alternativa a username/password)
3. Clicca "Test Connessione" per verificare

### 3. Configurazione OpenWebUI
1. Sezione "Analisi AI (OpenWebUI)":
   - **URL OpenWebUI**: `http://localhost:3000` (o il tuo URL)
   - **API Key**: La tua API key di OpenWebUI
   - **Modello AI**: Seleziona il modello installato
2. Clicca "Test AI" per verificare

### 4. Configurazione Notifiche Telegram
1. Crea un bot Telegram:
   - Cerca @BotFather su Telegram
   - Usa `/newbot` e segui le istruzioni
   - Salva il **Bot Token**

2. Ottieni il Chat ID:
   - Aggiungi il bot al tuo gruppo/canale
   - Invia un messaggio al bot
   - Vai su `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
   - Trova il **Chat ID** nella risposta

3. Nella sezione "Notifiche Telegram":
   - Abilita le notifiche
   - Inserisci **Bot Token** e **Chat ID**

### 5. Configurazione Soglie Alert
Imposta le soglie per gli alert automatici:
- **CPU Usage**: Default 85%
- **Memory Usage**: Default 90%
- **Disk Usage**: Default 95%
- **Failed Logins**: Default 10 tentativi

### 6. Salvataggio e Test
1. Clicca "Salva Configurazione"
2. Torna alla Dashboard
3. Clicca "Avvia Monitoraggio"

## Esempi di Configurazione

### Graylog Locale
```
URL: http://localhost:9000
Username: admin
Password: admin
```

### OpenWebUI con Ollama
```
URL: http://localhost:3000
API Key: your-api-key
Modello: llama3.1
```

### Telegram Bot
```
Bot Token: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz
Chat ID: -1001234567890
```

## Troubleshooting

### Errori Comuni

**Graylog - Connessione Fallita**
- Verifica che Graylog sia avviato
- Controlla URL e porta (default 9000)
- Verifica credenziali
- Controlla firewall/CORS

**OpenWebUI - Connessione AI Fallita**
- Verifica che OpenWebUI sia avviato
- Controlla che Ollama sia attivo
- Verifica API key
- Assicurati che il modello sia scaricato

**Telegram - Notifiche Non Arrivano**
- Verifica Bot Token
- Controlla Chat ID (deve iniziare con -)
- Assicurati che il bot sia nel gruppo
- Testa con API Telegram diretta

### Log e Debug
- Apri la console del browser (F12)
- Controlla i log dell'applicazione
- Verifica le chiamate API nella tab Network

## Sicurezza

- **Mai condividere** API key e token
- Le credenziali sono salvate solo nel browser (localStorage)
- Per produzione, considera l'uso di variabili d'ambiente
- Usa HTTPS per tutte le connessioni in produzione

## Supporto

Per problemi o domande:
1. Controlla i log della console
2. Verifica la configurazione passo-passo
3. Testa le connessioni singolarmente
4. Riavvia i servizi se necessario
