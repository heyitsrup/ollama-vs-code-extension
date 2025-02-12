const vscode = acquireVsCodeApi();

document.getElementById('askBtn').addEventListener('click', () => {
    const text = document.getElementById('prompt').value;
    vscode.postMessage({ command: 'chat', text })
});

window.addEventListener('message', event => {
    const { command, text } = event.data;
    if (command === 'chatResponse') {
        document.getElementById('response').innerText = text;
    }
})
