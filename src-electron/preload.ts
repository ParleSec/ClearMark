import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  sendMessage: (channel: string, data: any) => {
    // whitelist channels
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receiveMessage: (channel: string, func: Function) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
}) 