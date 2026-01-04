const input = document.getElementById('terminal-input');
const ghost = document.getElementById('ghost-suggestion');
const resultArea = document.getElementById('result-area');
const terminalBody = document.getElementById('terminal');

// Lista de comandos para o sistema de sugestão e autocomplete
const COMANDOS = ["./ageux.sh --calc --date=", "help", "clear", "neofetch", "about"];

// Monitora a digitação para sugestão dinâmica (Ghost Suggestion)
input.addEventListener('input', () => {
    const value = input.value.toLowerCase();
    ghost.innerText = "";
    
    if (value) {
        // Encontra um comando que comece com o que o usuário está digitando
        const match = COMANDOS.find(c => c.startsWith(value));
        if (match) {
            ghost.innerText = match;
        }
    }
});

input.addEventListener('keydown', (e) => {
    // Autocompletar com a tecla Tab ou Seta para Direita
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghost.innerText !== "") {
        e.preventDefault();
        input.value = ghost.innerText;
        ghost.innerText = "";
    }

    if (e.key === 'Enter') {
        const fullCommand = input.value.trim();
        if (fullCommand !== "") {
            processarComando(fullCommand);
        }
        input.value = "";
        ghost.innerText = "";
    }
});

async function processarComando(cmd) {
    // Adiciona a linha de comando ao histórico
    resultArea.insertAdjacentHTML('beforeend', `<p><span class="prompt">user@ageux:~$</span> ${cmd}</p>`);
    terminalBody.scrollTop = terminalBody.scrollHeight;

    const cleanCmd = cmd.toLowerCase();

    // 1. Comando CLEAR
    if (cleanCmd === 'clear') {
        resultArea.innerHTML = "";
        return;
    }

    // 2. Comando HELP
    if (cleanCmd === 'help') {
        resultArea.insertAdjacentHTML('beforeend', `
            <p class="output" style="color: #50fa7b;">Comandos disponíveis:</p>
            <p class="output">  ./ageux.sh --calc --date=AAAA-MM-DD</p>
            <p class="output">  neofetch - Informações do sistema e desenvolvedor</p>
            <p class="output">  about    - Sobre o projeto</p>
            <p class="output">  clear    - Limpar terminal</p>
        `);
    } 

    // 3. Comando NEOFETCH
    else if (cleanCmd === 'neofetch') {
        resultArea.insertAdjacentHTML('beforeend', `
            <div style="display: flex; gap: 20px; margin: 10px 0;">
                <pre style="color: #50fa7b; font-size: 10px; line-height: 10px;">
    _    ____ _____ 
   / \\  / ___| ____|
  / _ \\| |  _|  _|  
 / ___ \\ |_| | |___ 
/_/   \\_\\____|_____|
                </pre>
                <div style="font-size: 13px;">
                    <p><b style="color: #50fa7b;">user</b>@<b style="color: #50fa7b;">ageux</b></p>
                    <p>-----------</p>
                    <p><b style="color: #50fa7b;">OS:</b> AgeUX Web Engine v1.1</p>
                    <p><b style="color: #50fa7b;">Dev:</b> José Izata Quinvula</p>
                    <p><b style="color: #50fa7b;">Shell:</b> bash 5.0.17</p>
                    <p><b style="color: #50fa7b;">Loc:</b> Luanda, Angola 🇦🇴</p>
                </div>
            </div>
        `);
    }

    // 4. Comando ABOUT
    else if (cleanCmd === 'about') {
        resultArea.insertAdjacentHTML('beforeend', `
            <p class="output">AgeUX é um utilitário de terminal web focado em experiência de usuário imersiva.</p>
            <p class="output">Desenvolvido por José Izata para simular um ambiente Bash real.</p>
        `);
    }

    // 5. Comando de Cálculo com Simulação de Instalação (Lento para segurança)
    else if (cmd.includes('--date=')) {
        const dateStr = cmd.split('--date=')[1];
        if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            
            input.disabled = true; // Bloqueia para evitar comandos simultâneos
            
            const logs = [
                { text: "Connecting to repository: https://ageux.io/stable...", delay: 800 },
                { text: "Resolving dependencies...", delay: 1000 },
                { text: "Downloading ageux-v1.1-bin... [22KB]", delay: 1200 },
                { text: "Checking MD5 integrity... OK", delay: 800 },
                { text: "Installing: age-calculator-engine...", delay: 500 },
                { text: "Finalizing system environment...", delay: 1500 }
            ];

            for (let log of logs) {
                resultArea.insertAdjacentHTML('beforeend', `<p class="output" style="color: #888;">> ${log.text}</p>`);
                terminalBody.scrollTop = terminalBody.scrollHeight;
                await new Promise(r => setTimeout(r, log.delay));
            }

            const idade = calcularIdade(dateStr);
            
            resultArea.insertAdjacentHTML('beforeend', `
                <div class="result-box">
                    <p style="color: #f1fa8c;">------------------------------------------</p>
                    <p>SYSTEM REPORT: Calculation Complete</p>
                    <p>TARGET DATE: ${dateStr}</p>
                    <p>IDENTIFIED AGE: <b style="color: #fff;">${idade} years</b></p>
                    <p style="color: #f1fa8c;">------------------------------------------</p>
                </div>
            `);
            
            input.disabled = false;
            input.focus();
        } else {
            resultArea.insertAdjacentHTML('beforeend', `<p class="error" style="color: #ff5555;">bash: format error. Use --date=YYYY-MM-DD</p>`);
        }
    } 
    
    // 6. Comando não encontrado
    else {
        resultArea.insertAdjacentHTML('beforeend', `<p class="error" style="color: #ff5555;">bash: command not found: ${cmd}</p>`);
    }
    
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function calcularIdade(dataStr) {
    const hoje = new Date();
    const nasc = new Date(dataStr);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return isNaN(idade) ? "Invalid Date" : (idade < 0 ? "Not born yet" : idade);
}