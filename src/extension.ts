// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

function readFileAsNonEmptyLines(filePath: string): string[] {
    const absolutePath = path.resolve(filePath);
	console.log('Reading file:', absolutePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    return fileContent.split('\n').filter(line => line.trim() !== '');
}

function convertCommaSeparatedStringsToMap(lines: string[]): Map<string, string> {
	const map = new Map<string, string>();
	console.log('Converting lines to map:', lines.length);
	lines.map(line => line.split(','))
		.filter(parts => parts.length > 1)
		.map(parts => [parts[0].trim().toLowerCase(), parts[1].trim()])
		.filter(parts => parts[0] && parts[1])
		.forEach(parts => {
			map.set(parts[0], parts[1]);
		});

	console.log('Map created:', map.size);

	return map;
}

function createMapFromFile(filePath: string): Map<string, string> {
	const lines = readFileAsNonEmptyLines(filePath);
	return convertCommaSeparatedStringsToMap(lines);
}

const map = createMapFromFile(path.join(__dirname, 'index.csv'));

let panel: vscode.WebviewPanel | undefined = undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const DOC_URL = 'https://docs.opencv.org/4.10.0/';
	let panelWord: string = "";

	console.log('OpenCVDoc activated. Index contains ' + map.size + ' entries.');

	function createOrFillInWindowWithUrl(url: string) {
		if (!panel) {
			console.log('Creating new panel');
			panel = vscode.window.createWebviewPanel(
				'opencvdoc',
				'OpenCV Documentation',
				vscode.ViewColumn.One,
				{});
		}
		console.log('Filling in panel by url');
		panel.webview.html = getWebviewContent(url);
		panel.onDidDispose(() => {
			panel = undefined;
			panelWord = "";
		});
	}

	function getIndex(document: vscode.TextDocument, position: vscode.Position): string|null {
		const wordRange = document.getWordRangeAtPosition(position);
		const hoveredWord = wordRange ? document.getText(wordRange).toLocaleLowerCase() : '';
		console.log("Hovered word:", hoveredWord);

		const index = map.get(hoveredWord);

		if (!index) {
			return null;
		}

		const oldPanelWord = panelWord;
		panelWord = hoveredWord;

		return hoveredWord === oldPanelWord ? null : index;
	}

	

	const displayHtmlInWindow=vscode.languages.registerHoverProvider('python', {
		provideHover(document, position, token) {
			const index = getIndex(document, position);
			if (!index) {return null;}

			const url = DOC_URL + index;

			createOrFillInWindowWithUrl(url);

		  return null;
		}

	});

	context.subscriptions.push(displayHtmlInWindow);

	return {
		getMapSize : () => map.size,
		getPanel: () => panel,
		getPanelWord: () => panelWord
	};

}

function getWebviewContent(url: string): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>OpenCV Documentation</title>
			<style>
                html, body, iframe {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    border: 0;
                    overflow: hidden;
                }
            </style>
		</head>
		<body>
			<iframe src="${url}" frameborder="0"></iframe>
		</body>
		</html>
	`;
}


export function deactivate() {
	if (panel) {
		panel.dispose();
	}
}
