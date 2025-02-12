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
    return /*html*/ `
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
	`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map