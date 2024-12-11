// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const opencv_doc=vscode.languages.registerHoverProvider('python', {
		provideHover(document, position, token) {
			console.log("hover provider:", document, position, token);
			return {
				contents: ['Hover Content XXX']
			};
		}
	});

	context.subscriptions.push(opencv_doc);
}

// This method is called when your extension is deactivated
export function deactivate() {}
