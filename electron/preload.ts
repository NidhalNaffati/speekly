import {contextBridge, ipcRenderer} from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
    const protos = Object.getPrototypeOf(obj)

    for (const [key, value] of Object.entries(protos)) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) continue

        if (typeof value === 'function') {
            // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
            obj[key] = function (...args: any) {
                return value.call(obj, ...args)
            }
        } else {
            obj[key] = value
        }
    }
    return obj
}

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']): Promise<boolean> {
    return new Promise(resolve => {
        if (condition.includes(document.readyState)) {
            resolve(true)
        } else {
            document.addEventListener('readystatechange', () => {
                if (condition.includes(document.readyState)) {
                    resolve(true)
                }
            })
        }
    })
}

/**
 * Speekly custom loader implementation
 */
function createAppLoader() {
    const appendLoader = (): { style: HTMLStyleElement; loaderRoot: HTMLDivElement } => {
        const loaderRoot = document.createElement('div')
        loaderRoot.id = 'app-loader-root'
        document.body.appendChild(loaderRoot)

        const root = document.createElement('div')
        root.id = 'app-loader'
        loaderRoot.appendChild(root)

        // Create a style element
        const style = document.createElement('style')
        style.id = 'app-loader-style'
        style.textContent = `
      @keyframes wave {
        0% { transform: scaleY(1); }
        50% { transform: scaleY(0.5); }
        100% { transform: scaleY(1); }
      }
      
      .app-loader-wave-1 { animation: wave 1.2s linear infinite; }
      .app-loader-wave-2 { animation: wave 1.2s linear infinite 0.2s; }
      .app-loader-wave-3 { animation: wave 1.2s linear infinite 0.4s; }
      
      .app-loader-gradient-text {
        background: linear-gradient(90deg, #42b983, #0070ba);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      
      .app-loader-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        background-color: #0f0f0f;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }
      
      .app-loader-pulse {
        animation: app-loader-pulse 2s infinite;
      }
      
      @keyframes app-loader-pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `
        document.head.appendChild(style)

        // Create the loader HTML
        root.innerHTML = `
      <div class="app-loader-container">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem;">
          <div style="position: relative; display: flex; align-items: center;">
            <span style="font-size: 2rem; font-weight: bold;" class="app-loader-gradient-text">Speekly</span>
            <div style="position: absolute; bottom: -1.5rem; left: 0; right: 0; margin: 0 auto; font-size: 0.75rem; color: #999; text-align: center;">
              Smart AI Teleprompter
            </div>
          </div>
          
          <div style="display: flex; align-items: flex-end; gap: 0.5rem; height: 3rem; margin-top: 1.5rem;">
            <div style="width: 0.5rem; background: #42b983; border-radius: 9999px; height: 2rem;" class="app-loader-wave-1"></div>
            <div style="width: 0.5rem; background: #00ad8d; border-radius: 9999px; height: 3rem;" class="app-loader-wave-2"></div>
            <div style="width: 0.5rem; background: #009f99; border-radius: 9999px; height: 1.5rem;" class="app-loader-wave-3"></div>
            <div style="width: 0.5rem; background: #0090a7; border-radius: 9999px; height: 2.5rem;" class="app-loader-wave-1"></div>
            <div style="width: 0.5rem; background: #0070ba; border-radius: 9999px; height: 2rem;" class="app-loader-wave-2"></div>
          </div>
          
          <div style="font-size: 0.875rem; color: #999; letter-spacing: 0.05em;" class="app-loader-pulse">
            Initializing...
          </div>
        </div>
      </div>
    `

        return {
            style,
            loaderRoot
        }
    }

    const removeLoader = (): void => {
        const style = document.getElementById('app-loader-style')
        const loaderRoot = document.getElementById('app-loader-root')

        if (loaderRoot) {
            const container = loaderRoot.querySelector('.app-loader-container') as HTMLElement | null
            if (container) {
                // Fade out
                container.style.opacity = '0'

                // Remove after animation
                setTimeout(() => {
                    if (style) document.head.removeChild(style)
                    document.body.removeChild(loaderRoot)
                }, 500)
            } else {
                // Fallback if container not found
                if (style) document.head.removeChild(style)
                document.body.removeChild(loaderRoot)
            }
        }
    }

    return {
        appendLoader,
        removeLoader
    }
}

// ----------------------------------------------------------------------

const {appendLoader, removeLoader} = createAppLoader()

// Handle DOM ready and append loader
void domReady().then(() => {
    appendLoader()
})

window.onmessage = (ev: MessageEvent) => {
    if (ev.data.payload === 'removeLoading') {
        removeLoader()
    }
}

setTimeout(removeLoader, 4999)
