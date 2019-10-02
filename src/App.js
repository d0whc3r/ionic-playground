import React from 'react';
import './App.css';

import { LiveError, LivePreview, LiveProvider } from 'react-live';
import MonacoEditor from 'react-monaco-editor';
import components from '@ionic/core/dist/types/components.d.ts';
import interfaces from '@ionic/core/dist/types/interface.d.ts';
import stencilCore from '@ionic/core/dist/types/stencil.core.d.ts';

const SCRIPTS = [
  {
    src: 'https://cdn.jsdelivr.net/npm/@ionic/core@4.6.2/dist/ionic/ionic.esm.js',
    type: 'module',
  },
];
const STYLES = [
  {
    href: 'https://cdn.jsdelivr.net/npm/@ionic/core@4.6.2/css/ionic.bundle.css',
    rel: 'stylesheet',
  },
];
const FILES = {
  '@types/components.d.ts': components,
  '@types/interface.d.ts': interfaces,
  '@types/stencil.core.d.ts': stencilCore,
};

const DEFAULT_CONTENT = `<div>
  <h1>Sample code</h1>
</div>`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const initialCode = this._getContent() || DEFAULT_CONTENT;
    this.state = {
      code: initialCode,
      savedCode: initialCode,
    };
    this.addModules();
    setTimeout(() => {
      document.querySelector('html').classList.add('hydrated');
    });
  }

  _getContent() {
    const content = new URL(window.location.href).searchParams.get('content');
    return content && atob(content);
  }

  editorDidMount(editor, monaco) {
    editor.focus();
    editor.addAction({
      id: 'save',
      label: 'Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
      keybindingContext: '!editorReadonly',
      contextMenuGroupId: '0_navigation',
      contextMenuOrder: .2,
      run: this.runSave.bind(this),
    });
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'h',
      // jsxFactory: 'React.createElement',
      lib: ['dom', 'es2019'],
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      // noEmit: true,
      // noUnusedLocals: true,
      // noUnusedParameters: true,
      target: monaco.languages.typescript.ScriptTarget.ES2019,
      typeRoots: ['inmemory://model/node_modules/@types'],
    });
    for (const fileName in FILES) {
      if (FILES.hasOwnProperty(fileName)) {
        const fakePath = `inmemory://model/node_modules/${fileName}`;
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            FILES[fileName],
            fakePath,
        );
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            FILES[fileName],
            fakePath,
        );
      }
    }
    // const suggestions = [
    //   {
    //     label: 'ion-button',
    //     kind: monaco.languages.CompletionItemKind.Property,
    //     documentation: 'The ion-button',
    //     insertText: 'ion-button',
    //   },
    // ];
    // monaco.languages.registerCompletionItemProvider('html', {
    //   provideCompletionItems(model, position) {
    //     return {
    //       suggestions,
    //     };
    //   },
    // });
  }

  runSave() {
    this.setState((state, props) => ({
      savedCode: state.code,
    }));
  }

  get generatedLink() {
    const content = encodeURIComponent(btoa(this.state.savedCode));
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?content=${content}`;
  }

  get isUnsaved() {
    return this.state.code !== this.state.savedCode;
  }

  onChange(newValue, e) {
    this.setState({ code: newValue });
  }

  addModules() {
    const head = document.querySelector('head');
    if (SCRIPTS) {
      SCRIPTS.forEach((module) => {
        const script = document.createElement('script');
        Object.keys(module).forEach((key) => {
          script[key] = module[key];
        });
        head.appendChild(script);
      });
    }
    if (STYLES) {
      STYLES.forEach((style) => {
        const link = document.createElement('link');
        Object.keys(style).forEach((key) => {
          link[key] = style[key];
        });
        head.appendChild(link);
      });
    }
  }

  render() {
    const code = this.state.code;
    const savedCode = this.state.savedCode;
    const options = {
      selectOnLineNumbers: true,
    };
    return (
        <div className="app">
          <p>
            {!this.isUnsaved && <a href={this.generatedLink} target="_blank" rel="noopener noreferrer">Share link</a>}
            {this.isUnsaved && <button onClick={this.runSave.bind(this)}>Save</button>}
          </p>
          <LiveProvider code={savedCode}>
            <div className="editor">
              <MonacoEditor
                  width="100%"
                  height="600"
                  language="html"
                  theme="vs"
                  value={code}
                  options={options}
                  onChange={this.onChange.bind(this)}
                  editorDidMount={this.editorDidMount.bind(this)}
              />
            </div>
            <LiveError className="error"/>
            <LivePreview className="viewer"/>
          </LiveProvider>
        </div>

    );
  }
}
