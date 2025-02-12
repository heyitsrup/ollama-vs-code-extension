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

		panel.webview.html = getWebviewContent(context);

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

function getWebviewContent(context: vscode.ExtensionContext): string {
	return /*html*/`
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Deepseek Assistant</title>
		<style>
			body {
				background-color: #f3f4f6;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.container {
				background-color: white;
				padding: 2rem;
				border-radius: 0.5rem;
				box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				max-width: 24rem;
				width: 100%;
				text-align: center;
			}

			h1 {
				font-size: 1.5rem;
				font-weight: 600;
				color: #1f2937;
				margin-bottom: 1.5rem;
			}

			textarea {
				width: 100%;
				height: 10rem;
				padding: 1rem;
				border: 1px solid #d1d5db;
				border-radius: 0.5rem;
				margin-bottom: 1rem;
				resize: none;
			}

			button {
				width: 100%;
				background-color: #3b82f6;
				color: white;
				padding: 0.5rem;
				border: none;
				border-radius: 0.5rem;
				cursor: pointer;
				transition: background-color 0.2s;
			}

			button:hover {
				background-color: #2563eb;
			}

			#response {
				margin-top: 1rem;
			}
    	</style>
	</head>
	<body>

		<div class="container">
			<!-- Title -->
			<h1>Deepseek Assistant</h1>

			<!-- Text Area -->
			<textarea id="prompt" placeholder="Type your query here..."></textarea><br>

			<!-- Button -->
			<button id="askBtn">Submit</button>

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
