import * as vscode from 'vscode';
import * as path from 'path';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';

export function gotoServiceTemplate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.localResource.service.gotoTemplate',
    async (serviceName: string) => {
      recordPageView('/gotoServiceTemplate');
      await process(serviceName);
    })
  );
}

async function process(serviceName: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }
  const localRoot = path.join(cwd, 'template.yml');
  if (!isPathExists(localRoot)) {
    vscode.window.showErrorMessage(`${localRoot} did not found`);
    return;
  }
  const templateService = new TemplateService(cwd);
  const templateContent = await templateService.getTemplateContent();
  if (!templateContent) {
    vscode.window.showErrorMessage('template.yml is empty or not exist');
    return;
  }
  const templateContentLines = templateContent.split('\n');
  let lineNumber = 0;
  let serviceFound = false;
  for (const line of templateContentLines) {
    if (line.includes(serviceName)) {
      serviceFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = serviceFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
  });
}
