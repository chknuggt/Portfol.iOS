// Mari OS - Complete Portfolio Operating System

class MariOS {
    constructor() {
        this.activeWindow = null;
        this.windows = new Map();
        this.systemStartTime = Date.now();
        this.processList = [];
        this.dragData = null;
        this.isMobile = this.checkMobileDevice();
        this.fullscreenWindow = null;

        this.init();
    }

    checkMobileDevice() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    init() {
        this.startBootSequence();
        this.initializeMatrix();
        this.setupWindowSystem();
        this.setupTaskbar();
        this.setupSystemMonitor();
        this.setupProjectTabs();
        this.startSystemUpdates();
        this.setupFormHandling();
        this.addEventListeners();
        this.setupMobileHandlers();
        this.setupHomeScreen();

        // Update tray icon on window resize
        window.addEventListener('resize', () => {
            this.isMobile = this.checkMobileDevice();
            this.updateTrayIcon();
        });
    }

    updateTrayIcon() {
        const trayIcon = document.getElementById('tray-icon');
        if (trayIcon) {
            if (this.isMobile) {
                trayIcon.textContent = '📱';
                trayIcon.style.background = 'none';
                trayIcon.style.fontSize = '16px';
                trayIcon.style.display = 'flex';
                trayIcon.style.alignItems = 'center';
                trayIcon.style.justifyContent = 'center';
            } else {
                trayIcon.textContent = '';
                trayIcon.style.background = '';
                trayIcon.style.fontSize = '';
                trayIcon.style.display = '';
                trayIcon.style.alignItems = '';
                trayIcon.style.justifyContent = '';
            }
        }
    }
    
    // Boot Sequence
    startBootSequence() {
        const bootSequence = document.getElementById('boot-sequence');
        const desktop = document.getElementById('desktop');
        
        setTimeout(() => {
            bootSequence.classList.add('hidden');
            desktop.classList.remove('hidden');
            this.playBootSound();
            this.showWelcomeMessage();
        }, 5000);
    }
    
    playBootSound() {
        // Simulate system startup sound with visual feedback
        const statusBar = document.querySelector('.status-bar');
        statusBar.style.animation = 'systemPulse 0.5s ease-out';
        setTimeout(() => {
            statusBar.style.animation = '';
        }, 500);
    }
    
    showWelcomeMessage() {
        this.createNotification('mar.iOS Initialized Successfully', 'success', 3000);
        setTimeout(() => {
            this.createNotification('All systems operational', 'info', 2000);
        }, 1000);
    }
    
    // Matrix Background Animation
    initializeMatrix() {
        this.matrixCanvas = document.getElementById('matrix-canvas');
        this.matrixCtx = this.matrixCanvas.getContext('2d');
        this.matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        this.matrixDrops = [];
        this.matrixFontSize = 14;
        
        this.resizeMatrix();
        this.animateMatrix();
        
        window.addEventListener('resize', () => this.resizeMatrix());
    }
    
    resizeMatrix() {
        this.matrixCanvas.width = window.innerWidth;
        this.matrixCanvas.height = window.innerHeight;
        
        const columns = Math.floor(this.matrixCanvas.width / this.matrixFontSize);
        this.matrixDrops = Array(columns).fill(1);
    }
    
    animateMatrix() {
        this.matrixCtx.fillStyle = 'rgba(10, 10, 15, 0.04)';
        this.matrixCtx.fillRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);
        
        this.matrixCtx.fillStyle = '#00ff41';
        this.matrixCtx.font = `${this.matrixFontSize}px monospace`;
        
        for (let i = 0; i < this.matrixDrops.length; i++) {
            const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
            const x = i * this.matrixFontSize;
            const y = this.matrixDrops[i] * this.matrixFontSize;
            
            this.matrixCtx.fillText(char, x, y);
            
            if (y > this.matrixCanvas.height && Math.random() > 0.975) {
                this.matrixDrops[i] = 0;
            }
            
            this.matrixDrops[i]++;
        }
        
        requestAnimationFrame(() => this.animateMatrix());
    }
    
    // Window Management System
    setupWindowSystem() {
        const windows = document.querySelectorAll('.window');
        
        windows.forEach((window, index) => {
            const windowId = window.id;
            this.windows.set(windowId, {
                element: window,
                isMinimized: false,
                originalPosition: {
                    x: parseInt(window.style.left) || 50 + (index * 30),
                    y: parseInt(window.style.top) || 50 + (index * 30)
                },
                zIndex: 50
            });
            
            this.setupWindowControls(window);
            this.makeWindowDraggable(window);
            this.makeWindowFocusable(window);
            
            // Hide all windows except terminal initially
            if (windowId !== 'terminal-main') {
                if (this.isMobile) {
                    // On mobile, hide with CSS classes for animations
                    window.classList.add('hidden-mobile');
                } else {
                    // On desktop, use display none
                    window.style.display = 'none';
                }
            } else if (windowId === 'terminal-main' && this.isMobile) {
                // On mobile, show home screen by default instead of opening terminal
                // Terminal will be available in taskbar for manual opening
            }
        });
        
        if (!this.isMobile) {
            this.focusWindow('terminal-main');
        }
    }
    
    setupWindowControls(window) {
        const controls = window.querySelectorAll('.control');
        
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = control.classList.contains('minimize') ? 'minimize' :
                             control.classList.contains('maximize') ? 'maximize' : 'close';
                
                this.handleWindowControl(window.id, action);
            });
        });
    }
    
    handleWindowControl(windowId, action) {
        const windowData = this.windows.get(windowId);
        const windowElement = windowData.element;
        
        switch (action) {
            case 'minimize':
                this.minimizeWindow(windowId);
                break;
            case 'maximize':
                this.toggleMaximize(windowId);
                break;
            case 'close':
                this.closeWindow(windowId);
                break;
        }
    }
    
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        windowData.element.style.display = 'none';
        windowData.isMinimized = true;
        
        // Update taskbar to show minimized state
        const launcher = document.querySelector(`[data-window="${windowId}"]`);
        if (launcher) {
            launcher.style.opacity = '0.5';
        }
        
        this.createNotification(`${windowId} minimized`, 'info', 1000);
    }
    
    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        const window = windowData.element;
        
        if (window.style.width === '95vw') {
            // Restore
            window.style.width = '';
            window.style.height = '';
            window.style.top = windowData.originalPosition.y + 'px';
            window.style.left = windowData.originalPosition.x + 'px';
        } else {
            // Maximize
            window.style.width = '95vw';
            window.style.height = '85vh';
            window.style.top = '40px';
            window.style.left = '2.5vw';
        }
    }
    
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        windowData.element.style.display = 'none';
        
        // Update taskbar
        const launcher = document.querySelector(`[data-window="${windowId}"]`);
        if (launcher) {
            launcher.style.opacity = '0.3';
        }
        
        this.createNotification(`${windowId} closed`, 'warning', 1000);
    }
    
    openWindow(windowId, clickedLauncher = null) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        if (this.isMobile) {
            this.openMobileFullscreen(windowId, clickedLauncher);
        } else {
            windowData.element.style.display = 'block';
            windowData.isMinimized = false;
            this.focusWindow(windowId);
        }

        // Update taskbar
        const launcher = document.querySelector(`[data-window="${windowId}"]`);
        if (launcher) {
            launcher.style.opacity = '1';
        }

        this.createNotification(`${windowId} opened`, 'success', 1000);
    }

    openMobileFullscreen(windowId, clickedLauncher = null) {
        // Hide currently fullscreen window if any
        if (this.fullscreenWindow && this.fullscreenWindow !== windowId) {
            this.hideMobileWindow(this.fullscreenWindow);
        }

        // Hide mobile home screen widgets and welcome message
        this.hideMobileHomeScreen();

        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const window = windowData.element;
        const desktopArea = document.querySelector('.desktop-area');

        // Calculate transform origin from clicked icon position
        if (clickedLauncher) {
            const iconRect = clickedLauncher.getBoundingClientRect();
            const iconCenterX = iconRect.left + iconRect.width / 2;
            const iconCenterY = iconRect.top + iconRect.height / 2;

            // Set transform origin to icon position
            window.style.transformOrigin = `${iconCenterX}px ${iconCenterY}px`;
        }

        // Move window outside desktop area first
        document.body.appendChild(window);

        // Show and prepare window with initial animation state
        window.style.display = 'block';
        window.style.visibility = 'visible';
        window.classList.remove('hidden-mobile', 'closing', 'opening');
        windowData.isMinimized = false;

        // Add pre-animation state
        window.classList.add('fullscreen', 'pre-open');
        desktopArea.classList.add('fullscreen-active');

        // Start animation after a brief delay
        setTimeout(() => {
            window.classList.remove('pre-open');
            window.classList.add('opening');

            // Ensure taskbar stays visible
            const taskbar = document.querySelector('.taskbar');
            if (taskbar && taskbar.parentElement !== document.body) {
                document.body.appendChild(taskbar);
            }

            // Remove opening class after animation completes
            setTimeout(() => {
                window.classList.remove('opening');

                // Debug: Check final state
                console.log(`Animation completed for ${windowId}`, {
                    hasFullscreenClass: window.classList.contains('fullscreen'),
                    classList: Array.from(window.classList),
                    windowOpacity: getComputedStyle(window).opacity,
                    windowTransform: getComputedStyle(window).transform
                });
            }, 2500); // Match animation duration

            // Debug log
            console.log(`Fullscreen and opening animation applied to ${windowId}`, {
                hasFullscreenClass: window.classList.contains('fullscreen'),
                hasOpeningClass: window.classList.contains('opening'),
                parent: window.parentElement.tagName,
                transformOrigin: window.style.transformOrigin,
                taskbarParent: taskbar ? taskbar.parentElement.tagName : 'none'
            });
        }, 50);

        this.fullscreenWindow = windowId;
        this.focusWindow(windowId);

        // Update active launcher
        this.updateActiveLauncher(windowId);
    }

    hideMobileWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const window = windowData.element;
        const desktopArea = document.querySelector('.desktop-area');

        // Set transform origin to the active launcher icon for closing animation
        const activeLauncher = document.querySelector(`[data-window="${windowId}"]`);
        if (activeLauncher) {
            const iconRect = activeLauncher.getBoundingClientRect();
            const iconCenterX = iconRect.left + iconRect.width / 2;
            const iconCenterY = iconRect.top + iconRect.height / 2;
            window.style.transformOrigin = `${iconCenterX}px ${iconCenterY}px`;
        }

        // Remove fullscreen class and add closing animation
        window.classList.remove('fullscreen');
        window.classList.add('closing');

        // Wait for closing animation to complete before cleanup
        setTimeout(() => {
            desktopArea.classList.remove('fullscreen-active');

            // Move window back to desktop area
            desktopArea.appendChild(window);

            // Move taskbar back to desktop if no other fullscreen windows
            if (!this.hasOtherFullscreenWindows(windowId)) {
                const taskbar = document.querySelector('.taskbar');
                const desktop = document.getElementById('desktop');
                if (taskbar && desktop && taskbar.parentElement !== desktop) {
                    desktop.appendChild(taskbar);
                }
            }

            // Clean up classes and hide
            window.classList.remove('closing');
            window.classList.add('hidden-mobile');

            // Show mobile home screen when no apps are open
            this.showMobileHomeScreen();

        }, 50); // Instant closing on mobile

        if (this.fullscreenWindow === windowId) {
            this.fullscreenWindow = null;
        }
    }

    hideMobileHomeScreen() {
        if (!this.isMobile) return;

        // Hide all old mobile widgets and new welcome message
        const allWidgets = document.querySelectorAll('.home-profile-card, .home-stats-widget, .home-activity-widget, .home-time-widget');
        const welcomeMessage = document.getElementById('mobile-welcome');

        allWidgets.forEach(widget => {
            if (widget) widget.style.display = 'none';
        });

        if (welcomeMessage) welcomeMessage.style.display = 'none';
    }

    showMobileHomeScreen() {
        if (!this.isMobile) return;

        // Hide all old mobile widgets
        const oldWidgets = document.querySelectorAll('.home-profile-card, .home-stats-widget, .home-activity-widget, .home-time-widget');
        const welcomeMessage = document.getElementById('mobile-welcome');

        oldWidgets.forEach(widget => {
            if (widget) widget.style.display = 'none';
        });

        if (welcomeMessage) welcomeMessage.style.display = 'block';
    }

    hasOtherFullscreenWindows(excludeWindowId) {
        return document.querySelector('.window.fullscreen:not(#' + excludeWindowId + ')') !== null;
    }

    updateActiveLauncher(activeWindowId) {
        // Remove active state from all launchers
        document.querySelectorAll('.app-launcher').forEach(launcher => {
            launcher.classList.remove('active');
        });

        // Add active state to current launcher
        if (activeWindowId) {
            const activeLauncher = document.querySelector(`[data-window="${activeWindowId}"]`);
            if (activeLauncher) {
                activeLauncher.classList.add('active');
            }
        }
    }
    
    focusWindow(windowId) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('active');
        });

        // Add active class to focused window
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.element.classList.add('active');
            this.activeWindow = windowId;

            // Bring window to front by increasing z-index
            this.bringToFront(windowId);
        }
    }

    bringToFront(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        // Get current highest z-index
        let maxZ = 50;
        this.windows.forEach((data, id) => {
            if (id !== windowId) {
                const currentZ = parseInt(data.element.style.zIndex || data.zIndex || 50);
                if (currentZ > maxZ) maxZ = currentZ;
            }
        });

        // Set this window's z-index higher
        const newZ = maxZ + 1;
        windowData.element.style.zIndex = newZ;
        windowData.zIndex = newZ;
    }
    
    makeWindowDraggable(window) {
        const header = window.querySelector('.window-header');
        
        header.addEventListener('mousedown', (e) => {
            this.startDrag(e, window);
        });
    }
    
    startDrag(e, window) {
        this.dragData = {
            window: window,
            startX: e.clientX - window.offsetLeft,
            startY: e.clientY - window.offsetTop
        };
        
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        
        window.style.cursor = 'grabbing';
        this.focusWindow(window.id);
    }
    
    handleDrag(e) {
        if (!this.dragData) return;
        
        const newX = e.clientX - this.dragData.startX;
        const newY = e.clientY - this.dragData.startY;
        
        // Constrain to viewport
        const maxX = window.innerWidth - this.dragData.window.offsetWidth;
        const maxY = window.innerHeight - this.dragData.window.offsetHeight;
        
        this.dragData.window.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        this.dragData.window.style.top = Math.max(35, Math.min(newY, maxY)) + 'px';
    }
    
    stopDrag() {
        if (this.dragData) {
            this.dragData.window.style.cursor = '';
            this.dragData = null;
        }
        
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    
    makeWindowFocusable(window) {
        window.addEventListener('mousedown', () => {
            this.focusWindow(window.id);
        });
    }
    
    // Taskbar System
    setupTaskbar() {
        const launchers = document.querySelectorAll('.app-launcher');

        launchers.forEach(launcher => {
            launcher.addEventListener('click', () => {
                const windowId = launcher.dataset.window;
                const windowData = this.windows.get(windowId);

                if (windowData) {
                    if (this.isMobile) {
                        // Mobile behavior: switch between apps
                        if (this.fullscreenWindow === windowId) {
                            // If clicking the same app, close it
                            this.hideMobileWindow(windowId);
                            this.updateActiveLauncher(null);
                        } else {
                            // Switch to different app
                            this.openWindow(windowId, launcher);
                        }
                    } else {
                        // Desktop behavior
                        const isHidden = windowData.element.style.display === 'none' ||
                                       windowData.element.classList.contains('hidden-mobile') ||
                                       windowData.isMinimized;

                        if (isHidden) {
                            this.openWindow(windowId, launcher);
                        } else if (this.activeWindow === windowId) {
                            this.closeWindow(windowId);
                        } else {
                            this.focusWindow(windowId);
                        }
                    }
                }
            });
            
            // Add hover effects
            launcher.addEventListener('mouseenter', () => {
                launcher.style.transform = 'translateY(-3px)';
            });
            
            launcher.addEventListener('mouseleave', () => {
                launcher.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Project Tabs System
    setupProjectTabs() {
        const tabItems = document.querySelectorAll('.tab-item');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Remove active class from all tabs
                tabItems.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding tab pane
                const targetPane = document.getElementById(targetTab + '-tab');
                if (targetPane) {
                    targetPane.classList.add('active');
                }
                
                // Create notification for tab switch
                const tabName = tab.querySelector('.tab-text').textContent;
                this.createNotification(`Switched to ${tabName}`, 'info', 1500);
            });
        });
    }
    
    // System Monitor
    setupSystemMonitor() {
        const monitor = document.getElementById('system-monitor');
        const toggle = document.querySelector('.monitor-toggle');
        const trayIcon = document.querySelector('[data-toggle="system-monitor"]');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                const content = monitor.querySelector('.monitor-content');
                const isVisible = content.style.display !== 'none';
                content.style.display = isVisible ? 'none' : 'block';
                toggle.textContent = isVisible ? '+' : '−';
            });
        }
        
        if (trayIcon) {
            trayIcon.addEventListener('click', () => {
                monitor.style.display = monitor.style.display === 'none' ? 'block' : 'none';
            });
        }
        
        this.updateSystemStats();
    }
    
    updateSystemStats() {
        // Update CPU usage (simulated)
        const cpuElement = document.querySelector('.status-indicator.cpu span');
        if (cpuElement) {
            const cpu = Math.floor(Math.random() * 40) + 15;
            cpuElement.textContent = cpu + '%';
        }
        
        // Update RAM usage (simulated)
        const ramElement = document.querySelector('.status-indicator.ram span');
        if (ramElement) {
            const ram = Math.floor(Math.random() * 30) + 50;
            ramElement.textContent = ram + '%';
        }
        
        // Update process list
        this.updateProcessList();
    }
    
    updateProcessList() {
        const processList = document.querySelector('.process-list');
        if (!processList) return;
        
        const processes = [
            { name: 'mari_core.exe', status: 'Running' },
            { name: 'matrix_render.dll', status: 'Active' },
            { name: 'portfolio.app', status: 'Loaded' },
            { name: 'security_daemon', status: 'Monitoring' }
        ];
        
        processList.innerHTML = processes.map(proc => 
            `<div class="process">${proc.name} <span>${proc.status}</span></div>`
        ).join('');
    }
    
    // System Updates (Time, Date, Stats)
    startSystemUpdates() {
        this.updateDateTime();
        this.updateSystemTime();
        
        // Update every second
        setInterval(() => {
            this.updateDateTime();
        }, 1000);
        
        // Update system stats every 3 seconds
        setInterval(() => {
            this.updateSystemStats();
        }, 3000);
        
        // Update system time every 30 seconds
        setInterval(() => {
            this.updateSystemTime();
        }, 30000);
    }
    
    updateDateTime() {
        const now = new Date();
        
        // Status bar time
        const statusTime = document.querySelector('.system-time');
        const statusDate = document.querySelector('.system-date');
        
        if (statusTime) {
            statusTime.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (statusDate) {
            statusDate.textContent = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Taskbar time
        const trayTime = document.querySelector('.time-display');
        const trayDate = document.querySelector('.date-display');
        
        if (trayTime) {
            trayTime.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false 
            });
        }
        
        if (trayDate) {
            trayDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    updateSystemTime() {
        const uptime = Math.floor((Date.now() - this.systemStartTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        // Could display uptime somewhere if needed
        console.log(`System uptime: ${hours}h ${minutes}m`);
    }
    
    // Form Handling
    setupFormHandling() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.transmit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            // Show loading state
            btnText.style.opacity = '0.5';
            btnLoader.style.display = 'block';
            submitBtn.disabled = true;
            
            this.createNotification('Initiating secure transmission...', 'info', 2000);
            
            try {
                const formData = new FormData(form);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    this.createNotification('TRANSMISSION SUCCESSFUL - Message encrypted and sent!', 'success', 4000);
                    form.reset();
                    this.showTransmissionSuccess();
                } else {
                    throw new Error('Transmission failed');
                }
            } catch (error) {
                this.createNotification('TRANSMISSION FAILED - Please try alternative channels', 'error', 4000);
            } finally {
                // Reset button state
                btnText.style.opacity = '1';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
    
    showTransmissionSuccess() {
        // Create a success overlay
        const overlay = document.createElement('div');
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 65, 0.1);
                border: 2px solid var(--cyber-green);
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                z-index: 1000;
                backdrop-filter: blur(20px);
                box-shadow: 0 0 50px rgba(0, 255, 65, 0.3);
            ">
                <h3 style="color: var(--cyber-green); font-family: var(--font-display); margin-bottom: 1rem;">
                    [TRANSMISSION_COMPLETE]
                </h3>
                <p style="color: #ccc; margin-bottom: 1.5rem;">
                    Your message has been successfully encrypted and transmitted through secure channels.
                </p>
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--cyber-green);
                    border-radius: 50%;
                    margin: 0 auto;
                    position: relative;
                    animation: successPulse 1.5s ease-in-out infinite;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: var(--cyber-green);
                        font-size: 1.5rem;
                    ">✓</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 3000);
    }
    
    // Notification System
    createNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        const colors = {
            success: '#00ff41',
            error: '#ff0040',
            warning: '#ffff00',
            info: '#00d4ff'
        };
        
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 45px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: ${colors[type]};
                border: 1px solid ${colors[type]};
                border-radius: 6px;
                padding: 0.8rem 1.2rem;
                font-family: var(--font-mono);
                font-size: 0.9rem;
                z-index: 1001;
                box-shadow: 0 0 20px rgba(${type === 'success' ? '0, 255, 65' : type === 'error' ? '255, 0, 64' : type === 'warning' ? '255, 255, 0' : '0, 212, 255'}, 0.3);
                animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in ${duration - 300}ms forwards;
                max-width: 300px;
                word-wrap: break-word;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    // Event Listeners
    addEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
            
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                if (this.activeWindow) {
                    this.minimizeWindow(this.activeWindow);
                }
            }
        });
        
        // Terminal typing effect
        this.setupTerminalTyping();
        
        // Random system events
        this.startRandomSystemEvents();
    }
    
    cycleWindows() {
        const visibleWindows = Array.from(this.windows.entries())
            .filter(([id, data]) => data.element.style.display !== 'none' && !data.isMinimized);
        
        if (visibleWindows.length <= 1) return;
        
        const currentIndex = visibleWindows.findIndex(([id]) => id === this.activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        
        this.focusWindow(visibleWindows[nextIndex][0]);
    }
    
    setupTerminalTyping() {
        const cursor = document.querySelector('.typing-cursor');
        if (!cursor) return;
        
        const commands = [
            'ls -la /home/marios/projects/',
            'cat /proc/cpuinfo | grep "model name"',
            'ps aux | grep mari',
            'systemctl status portfolio.service',
            'tail -f /var/log/mari.log',
            'whoami && id',
            'uname -a'
        ];
        
        let commandIndex = 0;
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                const command = commands[commandIndex % commands.length];
                this.typeCommand(cursor, command);
                commandIndex++;
            }
        }, 8000);
    }
    
    typeCommand(cursor, command) {
        cursor.style.opacity = '0';
        cursor.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            cursor.textContent = command.slice(0, i) + '|';
            i++;
            
            if (i > command.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    cursor.textContent = '|';
                    cursor.style.opacity = '1';
                }, 1000);
            }
        }, 80);
    }
    
    startRandomSystemEvents() {
        // Random CPU/RAM fluctuations
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.updateSystemStats();
            }
        }, 2000);
        
        // Random status updates
        setInterval(() => {
            if (Math.random() > 0.95) {
                const messages = [
                    'Security scan completed',
                    'Mari network optimized',
                    'Cache cleared successfully',
                    'Background process terminated',
                    'Memory defragmentation complete'
                ];
                const message = messages[Math.floor(Math.random() * messages.length)];
                this.createNotification(message, 'info', 2000);
            }
        }, 10000);
    }

    setupMobileHandlers() {
        // Handle window resize and orientation changes
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = this.checkMobileDevice();

            // If switching from desktop to mobile or vice versa
            if (wasMobile !== this.isMobile) {
                this.handleViewportChange();
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.isMobile = this.checkMobileDevice();
                this.handleViewportChange();
            }, 100);
        });
    }

    handleViewportChange() {
        if (this.isMobile && this.fullscreenWindow) {
            // Ensure fullscreen window stays fullscreen on mobile
            const windowData = this.windows.get(this.fullscreenWindow);
            if (windowData) {
                windowData.element.classList.add('fullscreen');
                document.querySelector('.desktop-area').classList.add('fullscreen-active');
            }
        } else if (!this.isMobile) {
            // Reset to desktop view
            this.resetToDesktop();
        }
    }

    resetToDesktop() {
        const desktopArea = document.querySelector('.desktop-area');
        const desktop = document.getElementById('desktop');

        // Remove fullscreen classes from all windows and move them back
        document.querySelectorAll('.window').forEach(window => {
            window.classList.remove('fullscreen', 'hidden-mobile');

            // Move window back to desktop area if it's not there
            if (window.parentElement !== desktopArea) {
                desktopArea.appendChild(window);
            }
        });

        desktopArea.classList.remove('fullscreen-active');

        // Move taskbar back to desktop
        const taskbar = document.querySelector('.taskbar');
        if (taskbar && desktop && taskbar.parentElement !== desktop) {
            desktop.appendChild(taskbar);
        }

        // Remove active states from launchers
        document.querySelectorAll('.app-launcher').forEach(launcher => {
            launcher.classList.remove('active');
        });

        this.fullscreenWindow = null;
    }

    setupHomeScreen() {
        this.updateTrayIcon();
        this.updateHomeScreenTime();

        // Update time every second
        setInterval(() => {
            this.updateHomeScreenTime();
        }, 1000);

        // Animate stats on mobile
        if (this.isMobile) {
            this.animateHomeScreenStats();
        }

    }

    updateHomeScreenTime() {
        const homeTimeElement = document.querySelector('.home-time');
        const homeDateElement = document.querySelector('.home-date');

        if (homeTimeElement && homeDateElement) {
            const now = new Date();
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            const dateOptions = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            homeTimeElement.textContent = now.toLocaleTimeString('en-US', timeOptions);
            homeDateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
        }
    }

    animateHomeScreenStats() {
        // Animate the activity status percentage
        const activeStatusElement = document.getElementById('active-status');
        if (activeStatusElement) {
            let count = 0;
            const target = 100;
            const increment = target / 50;

            const animate = () => {
                if (count < target) {
                    count += increment;
                    activeStatusElement.textContent = Math.round(count) + '%';
                    setTimeout(animate, 50);
                } else {
                    activeStatusElement.textContent = '100%';
                }
            };

            setTimeout(animate, 2000); // Start after 2 seconds
        }

        // Pulse the online indicator
        const onlineIndicator = document.querySelector('.online-indicator');
        if (onlineIndicator) {
            setInterval(() => {
                onlineIndicator.style.animation = 'pulse 1s ease-in-out';
                setTimeout(() => {
                    onlineIndicator.style.animation = '';
                }, 1000);
            }, 5000);
        }
    }
}

// Add required CSS animations
const additionalStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes systemPulse {
        0%, 100% { background: var(--glass-bg); }
        50% { background: rgba(0, 255, 65, 0.1); }
    }
    
    @keyframes successPulse {
        0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 10px var(--cyber-green);
        }
        50% { 
            transform: scale(1.1);
            box-shadow: 0 0 20px var(--cyber-green);
        }
    }
    
    .btn-loader {
        display: none;
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize Mari OS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mariOS = new MariOS();
    
    // Global functions for onclick handlers (if needed)
    window.openWindow = (windowId) => window.mariOS.openWindow(windowId);
    window.closeWindow = (windowId) => window.mariOS.closeWindow(windowId);
    window.minimizeWindow = (windowId) => window.mariOS.minimizeWindow(windowId);
});