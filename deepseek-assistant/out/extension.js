"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const ollama_1 = __importDefault(require("ollama"));
function activate(context) {
    console.log('Congratulations, your extension "deepseek-assistant" is now active!');
    const disposable = vscode.commands.registerCommand('deepseek-assistant.helloWorld', () => {
        const panel = vscode.window.createWebviewPanel('Deepseek Assistant', 'Deepseek Assistant', vscode.ViewColumn.One, { enableScripts: true });
        panel.webview.html = getWebviewContent(context);
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                const userPrompt = message.text;
                let responseText = "";
                try {
                    const streamResponse = await ollama_1.default.chat({
                        model: 'deepseek-r1:8b',
                        messages: [{
                                role: 'user',
                                content: userPrompt
                            }],
                        stream: true
                    });
                    for await (const part of streamResponse) {
                        responseText += part.message.content;
                        panel.webview.postMessage({
                            command: 'chatResponse',
                            text: responseText
                        });
                    }
                }
                catch (err) {
                    panel.webview.postMessage({
                        command: 'chatResponse',
                        text: `Error: ${String(err)}`
                    });
                }
            }
        });
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent(context) {
    // Get the path to the external CSS and JS files
    const stylesUri = vscode.Uri.file(path.join(context.extensionPath, 'media', 'styles.css'));
    const scriptUri = vscode.Uri.file(path.join(context.extensionPath, 'media', 'scripts.js'));
    // Convert to webview URI
    const stylesUriWebview = stylesUri.with({ scheme: 'vscode-resource' });
    const scriptUriWebview = scriptUri.with({ scheme: 'vscode-resource' });
    return /*html*/ `
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
function deactivate() { }
//# sourceMappingURL=extension.js.map