import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	
    test('Hover over OpenCV commands and check webview', async () => {
		const extension = vscode.extensions.getExtension('borkutip.opencvdoc');
        assert.ok(extension, 'Extension not found');
        await extension.activate();

		const api = extension.exports;
        const doc = await vscode.workspace.openTextDocument({
            content: 'imshow\nimread\nresize',
            language: 'python'
        });
        await vscode.window.showTextDocument(doc);

        const editor = vscode.window.activeTextEditor;
        assert.ok(editor, 'No active editor');

		const position = doc.positionAt(doc.getText().indexOf('imshow'));
        await vscode.commands.executeCommand('vscode.executeHoverProvider', doc.uri, position);

        // Wait for the webview to be created and filled
        await new Promise(resolve => setTimeout(resolve, 1000));

		assert.equal('imshow', api.getPanelWord());
		assert.ok(api.getPanel());
		assert.equal('OpenCV Documentation', api.getPanel().title);
	});
});
