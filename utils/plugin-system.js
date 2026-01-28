/**
 * Plugin System for Fax-lang Compiler
 * 
 * This module provides a plugin architecture that allows extending
 * the compiler with additional functionality.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class PluginError extends Error {
  constructor(message, code = 'PLUGIN_ERROR') {
    super(message);
    this.code = code;
    this.name = 'PluginError';
  }
}

class PluginManager {
  constructor(options = {}) {
    this.plugins = new Map();
    this.hooks = new Map(); // Hook name -> [plugin names]
    this.pluginDirs = options.pluginDirs || ['./plugins', './compiler/plugins'];
    this.activePlugins = new Set();
    this.pluginConfigs = new Map();
  }

  /**
   * Load plugins from specified directories
   */
  async loadPlugins() {
    for (const dir of this.pluginDirs) {
      const absoluteDir = path.resolve(process.cwd(), dir);
      if (fs.existsSync(absoluteDir)) {
        const files = fs.readdirSync(absoluteDir);
        for (const file of files) {
          const fullPath = path.join(absoluteDir, file);
          if (this.isPluginFile(fullPath)) {
            await this.loadPlugin(fullPath);
          }
        }
      }
    }
  }

  /**
   * Check if a file is a plugin file
   */
  isPluginFile(filePath) {
    const ext = path.extname(filePath);
    return ext === '.js' || ext === '.ts';
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(pluginPath) {
    try {
      // Dynamically import the plugin
      const pluginModule = require(pluginPath);
      const pluginInfo = this.extractPluginInfo(pluginModule, pluginPath);
      
      if (!pluginInfo) {
        console.warn(`Invalid plugin: ${pluginPath}`);
        return;
      }

      // Store plugin
      this.plugins.set(pluginInfo.name, {
        ...pluginInfo,
        module: pluginModule,
        path: pluginPath
      });

      console.log(`Loaded plugin: ${pluginInfo.name} v${pluginInfo.version}`);
    } catch (error) {
      throw new PluginError(`Failed to load plugin ${pluginPath}: ${error.message}`);
    }
  }

  /**
   * Extract plugin information from module
   */
  extractPluginInfo(module, pluginPath) {
    // Check if it's a valid plugin
    if (!module || typeof module !== 'object' || (!module.name && !module.hooks)) {
      return null;
    }
    
    if (!module.name || !module.version) {
      // Try to infer from filename if not explicitly defined
      const inferredName = path.basename(pluginPath, path.extname(pluginPath));
      return {
        name: inferredName,
        version: '1.0.0',
        description: `Plugin ${inferredName}`,
        hooks: module.hooks || {},
        activate: module.activate || (() => {}),
        deactivate: module.deactivate || (() => {})
      };
    }

    return {
      name: module.name,
      version: module.version,
      description: module.description || `Plugin ${module.name}`,
      hooks: module.hooks || {},
      activate: module.activate || (() => {}),
      deactivate: module.deactivate || (() => {})
    };
  }

  /**
   * Register hooks from plugins
   */
  registerHooks() {
    for (const [name, plugin] of this.plugins) {
      for (const hookName in plugin.hooks) {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(name);
      }
    }
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(`Plugin not found: ${pluginName}`);
    }

    try {
      await plugin.activate();
      this.activePlugins.add(pluginName);
      console.log(`Activated plugin: ${pluginName}`);
    } catch (error) {
      throw new PluginError(`Failed to activate plugin ${pluginName}: ${error.message}`);
    }
  }

  /**
   * Activate all plugins
   */
  async activateAllPlugins() {
    for (const [name] of this.plugins) {
      await this.activatePlugin(name);
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new PluginError(`Plugin not found: ${pluginName}`);
    }

    try {
      await plugin.deactivate();
      this.activePlugins.delete(pluginName);
      console.log(`Deactivated plugin: ${pluginName}`);
    } catch (error) {
      throw new PluginError(`Failed to deactivate plugin ${pluginName}: ${error.message}`);
    }
  }

  /**
   * Execute a hook, calling all registered plugin functions
   */
  async executeHook(hookName, ...args) {
    const pluginNames = this.hooks.get(hookName) || [];
    const results = [];

    for (const pluginName of pluginNames) {
      if (this.activePlugins.has(pluginName)) {
        const plugin = this.plugins.get(pluginName);
        const hookFunction = plugin.hooks[hookName];

        if (typeof hookFunction === 'function') {
          try {
            const result = await hookFunction(...args);
            results.push({ plugin: pluginName, result });
          } catch (error) {
            console.error(`Error in plugin ${pluginName} hook ${hookName}:`, error);
          }
        }
      }
    }

    return results;
  }

  /**
   * Get list of loaded plugins
   */
  getLoadedPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get list of active plugins
   */
  getActivePlugins() {
    return Array.from(this.activePlugins);
  }

  /**
   * Get plugin information
   */
  getPluginInfo(pluginName) {
    return this.plugins.get(pluginName);
  }
}

// Example plugin interface
class Plugin {
  constructor(name, version, description) {
    this.name = name;
    this.version = version;
    this.description = description;
    this.hooks = {};
  }

  // Method to register a hook
  registerHook(hookName, callback) {
    this.hooks[hookName] = callback;
  }

  // Activation function
  async activate() {
    // Override in subclass
  }

  // Deactivation function
  async deactivate() {
    // Override in subclass
  }
}

module.exports = {
  PluginManager,
  Plugin,
  PluginError
};