# Configuration

### .ENV Configuration

Here the .env file that you found in the repo:

```bash
PORT="80"                            # Service Port
HOST="0.0.0.0"                       # Host address
LOGGER="FALSE"                       # Active the logger
DEBUG="FALSE"                        # Active the debug
HTTPS="FALSE"                        # Switch to HTTPS
HTTPS_CERT="path/to/cert"            # Cert path ONLY if HTTPS is TRUE
HTTPS_KEY="path/to/key"              # Key cert path ONLY if HTTPS is TRUE
```

### Switch to HTTPS

If you want active the HTTPS protocol, you must have a valid SSL certificate, and you must change the `PORT`, `HTTPS`, `HTTPS_CERT` and `HTTPS_KEY` vars in the `.env` file

```bash
PORT="443"
HTTPS="TRUE"
HTTPS_CERT="path/to/cert"
HTTPS_KEY="path/to/key"
```

### Activate Logger

If active, the logger will write in a file in `logs` folder and not in console

```bash
LOGGER="TRUE"
```

### Activate Debug

If active, you can see all the detail of the coming request in the console or in the log file

```bash
DEBUG="TRUE"
```

