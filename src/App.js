import React from 'react';
import './App.css';

import { LiveError, LivePreview, LiveProvider } from 'react-live';
import MonacoEditor from 'react-monaco-editor';

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
            {!this.isUnsaved && <a href={this.generatedLink} target="_blank" rel="noopener noreferrer">Example link</a>}
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
