### Step 1: 
    Install Docker Desktop Application, Node.js, Ollama to your device
### Step 2:
    - Open the terminal to run Ollama:
        - ollama run gemma:7b
### Step 3:
    - Open the terminal and run 
        - cd ..\frontend
        - npm install
        - npm run build
### Step 4:
    - Open Docker Desktop
    - Open the terminal to run the command
        - cp .env.example .env
    - Acess backend/config/config.yaml and change ingestion/run: True then
        - run two command
            - docker-compose build
            - docker-compose up 
    - Change run: True to run: False then repeat two command above
### Step 5: 
    - Open Ollama then access localhost:3000 to run the project

