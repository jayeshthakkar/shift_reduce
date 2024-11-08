document.getElementById('parseButton').addEventListener('click', handleParse);

function handleParse() {
    const grammarText = document.getElementById('grammar').value;
    const input = document.getElementById('inputString').value;
    const errorElement = document.getElementById('error');
    const outputBody = document.getElementById('outputBody');

    // Clear previous error and output
    errorElement.innerText = '';
    outputBody.innerHTML = '';

    try {
        const grammarRules = parseGrammar(grammarText);
        const parsingSteps = parseInput(input, grammarRules);
        displaySteps(parsingSteps);
    } catch (e) {
        errorElement.innerText = e.message;
    }
}

function parseGrammar(grammarText) {
    const rules = {};
    grammarText.split('\n').forEach(line => {
        line = line.trim();
        if (line) {
            const [left, right] = line.split('->').map(s => s.trim());
            if (!left || !right) {
                throw new Error(`Invalid grammar rule: ${line}`);
            }
            if (!rules[left]) {
                rules[left] = [];
            }
            rules[left].push(right);
        }
    });
    return rules;
}

function parseInput(input, grammarRules) {
    const steps = [];
    const stack = [];
    let buffer = input.split(' ').filter(token => token);
   
    while (buffer.length > 0 || stack.length > 0) {
        if (buffer.length > 0) {
            stack.push(buffer.shift());
            steps.push({
                stack: [...stack],
                input: [...buffer],
                action: 'Shift'
            });
        }
       
        let reduced = false;
        for (const [nonTerminal, productions] of Object.entries(grammarRules)) {
            for (const production of productions) {
                const productionArray = production.split(' ');
                const stackStr = stack.slice(-productionArray.length).join(' ');
                if (stackStr === production) {
                    stack.splice(-productionArray.length);
                    stack.push(nonTerminal);
                    steps.push({
                        stack: [...stack],
                        input: [...buffer],
                        action: `Reduce ${production} to ${nonTerminal}`
                    });
                    reduced = true;
                    break;
                }
            }
            if (reduced) break;
        }
       
        if (!reduced && buffer.length === 0) {
            break;
        }
    }
    return steps;
}

function displaySteps(steps) {
    const outputBody = document.getElementById('outputBody');
    steps.forEach(step => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${step.stack.join(' ') || '(empty)'}</td>
            <td>${step.input.join(' ') || '(empty)'}</td>
            <td>${step.action}</td>
        `;
        outputBody.appendChild(row);
    });
}