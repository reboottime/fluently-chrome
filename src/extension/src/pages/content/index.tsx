import React from 'react';
import { createRoot } from 'react-dom/client';
import InjectActionButtons from './components/InjectActionButtons';
import './style.css';

function init() {
  const div = document.createElement('div');
  div.id = '__root';
  document.body.appendChild(div);

  const rootContainer = document.querySelector('#__root');
  if (!rootContainer) throw new Error("Can't find Content root element");

  const root = createRoot(rootContainer);
  root.render(<InjectActionButtons />);

  console.info('Fluently Helper content script is loaded');
}

init();