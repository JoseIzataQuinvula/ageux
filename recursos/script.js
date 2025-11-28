document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const conteudo = document.getElementById('conteudo');

    let historico = [];
    const MAX_HIST = 5;
    let idx = -1;

    const cabecalho = `Ducklinux Terminal v1.0.0
© 2025 José Izata Quinvula - Todos os direitos reservados
Criado com orgulho em Angola 🇦🇴
Calculadora de idade com visual Linux puro
Digite "ajuda" para comandos | Tab = últimos 5 comandos

`.replace(/\n/g, '<br>');

    const linha = (html, classe = '') => {
        const div = document.createElement('div');
        div.className = 'linha ' + classe;
        div.innerHTML = html;
        conteudo.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    };

    const novoPrompt = () => {
        const div = document.createElement('div');
        div.className = 'linha input-line';
        div.innerHTML = `
            <span class="prompt">duck@ducklinux:~$</span>
            <input type="text" id="comando" autocomplete="off" spellcheck="false" autofocus>
        `;
        conteudo.appendChild(div);
        const input = div.querySelector('#comando');
        input.focus();

        input.addEventListener('keydown', function handler(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const valor = input.value;
                const cmd = valor.trim();

                if (cmd) {
                    historico.unshift(cmd);
                    if (historico.length > MAX_HIST) historico.pop();
                }

                input.removeEventListener('keydown', handler);
                div.innerHTML = `<span class="prompt">duck@ducklinux:~$</span> ${valor}`;
                div.classList.remove('input-line');

                if (cmd) executar(cmd.toLowerCase());
                else novoPrompt();
            }

            else if (e.key === 'Tab') {
                e.preventDefault();
                if (historico.length === 0) return;
                idx = (idx + 1) % historico.length;
                input.value = historico[idx];
            }

            else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (historico.length === 0) return;
                idx = e.key === 'ArrowUp' ? (idx + 1) % historico.length : (idx <= 0 ? -1 : idx - 1);
                input.value = idx === -1 ? '' : historico[idx];
            }
        });
    };

    const executar = (cmd) => {
        const partes = cmd.split(' ');
        const comando = partes[0];

        // === COMANDOS DE AJUDA ===
        if (['ajuda', 'help', '?', 'comandos'].includes(comando)) {
            linha(`<span class="success">Ducklinux Terminal v1.0.0 — Comandos disponíveis:</span>
<span class="success">─────────────────────────────────────</span>
  ajuda, help, ?                 → mostra esta lista
  limpar                         → limpa a tela
  calcular, calculadora, idade,
  calc, data, "quanto tempo"     → calcula idade ou diferença

<span class="success">Exemplos de uso:</span>
  calcular 12-12-2004
  calculadora 25/03/1995 14:30
  idade 12.12,2004 2h30m
  calc 15;08;1990 90m
  quanto tempo 01-01-2023 12h`, 'success');
        }

        // === LIMPAR ===
        else if (comando === 'limpar') {
            conteudo.innerHTML = '';
            linha(cabecalho, 'success');
        }

        // === COMANDOS DE CÁLCULO (vários nomes!) ===
        else if (['calcular', 'calculadora', 'idade', 'calc', 'data', 'quanto', 'tempo'].includes(comando)) {
            if (partes.length < 2) {
                linha("Falta a data → ex: calcular 12-12-2004", 'error');
            } else {
                calcularIdade(partes.slice(1));
            }
        }

        // === COMANDO DESCONHECIDO ===
        else {
            linha(`bash: ${comando}: comando não encontrado`, 'error');
        }
        novoPrompt();
    };

    // === PARSE DATA (igual à versão anterior, 100% flexível) ===
    const parseData = (texto) => {
        if (!texto) return null;
        texto = texto.trim();

        let hora = 0;
        let minuto = 0;

        // Tempo relativo: 12h, 90m, 2h30m
        const tempoRelativo = texto.match(/(\d+)h\s*(\d*)m?$/i) || texto.match(/(\d+)m$/i);
        if (tempoRelativo) {
            const h = tempoRelativo[1] ? parseInt(tempoRelativo[1]) : 0;
            const m = tempoRelativo[2] ? parseInt(tempoRelativo[2]) : (tempoRelativo[0].includes('m') ? parseInt(tempoRelativo[1]) : 0);
            hora = h;
            minuto = m;
            if (minuto >= 60) { hora += Math.floor(minuto / 60); minuto %= 60; }
            texto = texto.replace(/(\d+h\s*\d*m?|\d+m)$/i, '').trim();
        }

        // Hora com : depois de espaço
        const horaMatch = texto.match(/\s+(\d{1,2}):(\d{1,2})$/);
        if (horaMatch) {
            hora = parseInt(horaMatch[1]);
            minuto = parseInt(horaMatch[2]);
            texto = texto.replace(/\s+\d{1,2}:\d{1,2}$/, '').trim();
        }

        // Normaliza separadores de data
        texto = texto.replace(/[\/.,;\-]/g, ' ');

        const nums = texto.split(/\s+/).map(Number).filter(n => n > 0);
        if (nums.length < 3 && nums.length !== 1) return null;

        let dia, mes, ano;
        if (nums.length === 1) {
            ano = nums[0]; dia = 1; mes = 1;
        } else {
            if (nums[nums.length - 1] >= 1000) {
                ano = nums.pop();
                dia = nums[0];
                mes = nums[1] || 1;
            } else if (nums[0] >= 1000) {
                ano = nums.shift();
                mes = nums[0] || 1;
                dia = nums[1] || 1;
            } else return null;
        }

        const data = new Date(ano, mes - 1, dia, hora, minuto);
        return isNaN(data.getTime()) ? null : data;
    };

    const calcularIdade = (args) => {
        const entrada = args.join(' ');
        const d1 = parseData(entrada);
        const hoje = new Date();

        if (!d1) {
            linha("Data inválida — usa espaço antes da hora e : na hora", 'error');
            return;
        }

        const diff = Math.abs(hoje - d1);
        const anos = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        const dias = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const txt = hoje < d1
            ? `Faltam ${anos}a ${dias}d ${horas}h ${mins}m até lá`
            : `Passaram ${anos}a ${dias}d ${horas}h ${mins}m desde o nascimento`;

        linha(txt, 'success');
    };

    // INÍCIO
    linha(cabecalho, 'success');
    novoPrompt();
});