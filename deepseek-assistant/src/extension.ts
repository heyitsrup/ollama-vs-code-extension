import * as vscode from 'vscode';
import * as path from 'path';
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
	// Get the path to the external CSS and JS files
    const stylesUri = vscode.Uri.file(path.join(context.extensionPath, 'media', 'styles.css'));
    const scriptUri = vscode.Uri.file(path.join(context.extensionPath, 'media', 'scripts.js'));

    // Convert to webview URI
    const stylesUriWebview = stylesUri.with({ scheme: 'vscode-resource' });
    const scriptUriWebview = scriptUri.with({ scheme: 'vscode-resource' });

	return /*html*/`
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Deepseek Assistant</title>
		<link rel="stylesheet" href="${stylesUriWebview}">
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

		<script src="${scriptUriWebview}"></script>

	</body>
	</html>
	`;
}

export function deactivate() { }
