###  Diploma work 'Drone Cafe' - group ND4".

### preinstall
```bash
    install and run MongoDB
```

### install
```bash
    git clone https://github.com/vadimkozin/dronecafe 
    cd dronecafe
    npm install
    ./load-data-to-db.js
    echo "JWT_SECRET=input_you_secret" > .env
    npm start
    http://localhost:3000
```

### run unit tests
```bash
    npm test
    
```

### before e2e tests
```bash
    npm run web-driver-update
```

### run e2e testa
```bash
    # run in separate terminal window
    npm run web-driver-start
    # run in another terminal window
    npm run protractor
```
