import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "deepseek-assistant" is now active!');

	const disposable = vscode.commands.registerCommand('deepseek-assistant.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from deepseek-assistant!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
