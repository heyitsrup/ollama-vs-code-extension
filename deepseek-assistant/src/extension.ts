import * as vscode from 'vscode';
import ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "deepseek-assistant" is now active!');

	const disposable = vscode.commands.registerCommand('deepseek-assistant.helloWorld', () => {
		const panel = vscode.window.createWebviewPanel(
			'Deepseek Assistant',
			'Deepseek Assistant',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		)

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(async (message: any) => {
			if (message.command === 'chat') {
				const userPrompt = message.text
				let responseText = ""

				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:8b',
						messages: [{ 
							role: 'user',
							content: userPrompt
						}],
						stream: true
					})

					for await (const part of streamResponse) {
						responseText += part.message.content
						panel.webview.postMessage({ 
							command: 'chatResponse',
							text: responseText
						})
					}
				} catch (err) {
					panel.webview.postMessage({
						command: 'chatResponse',
						text: `Error: ${String(err)}`
					})
				}
			} 
		})
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
	return /*html*/`
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Deepseek Assistant</title>
		<script src="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.js"></script>
	</head>
	<body class="bg-gray-100 flex items-center justify-center h-screen">

		<div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
			<!-- Title -->
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">Deepseek Assistant</h1>

			<!-- Text Area -->
			<textarea id="prompt" class="w-full h-40 p-4 border border-gray-300 rounded-lg mb-4" placeholder="Type your query here..."></textarea>

			<!-- Button -->
			<button id="askBtn" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">Submit</button>

			<div id="response"></div>
		</div>

		<script>
			const vscode = acquireVsCodeApi();

			document.getElementById('askBtn').addEventListener('click', () => {
				const text = document.getElementById('prompt').value;
				vscode.postMessage({ command: 'chat', text})
			});

			window.addEventListener('message', event => {
				const { command, text } = event.data;
				if (command === 'chatResponse') {
					document.getElementById('response').innerText = text;
				}
			})
		</script>

	</body>
	</html>
	`
}

export function deactivate() { }
