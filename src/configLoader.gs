// Configuration loader with .env file support
// Loads configuration from .env file with fallback to hard-coded CONFIG defaults

/**
 * Display current configuration (for debugging)
 */
function showConfig() {
  const config = loadConfig_();
  Logger.log('Current Configuration:');
  Logger.log(JSON.stringify(config, null, 2));
}

/**
 * Load configuration from .env file in Google Drive root if present
 * .env format: KEY=VALUE (one per line)
 * Lines starting with # are treated as comments
 */
function loadEnvFile_() {
  try {
    const envFiles = DriveApp.getRootFolder().getFilesByName('.env');
    
    if (!envFiles.hasNext()) {
      return {}; // No .env file found
    }
    
    const envFile = envFiles.next();
    const envContent = envFile.getBlob().getDataAsString();
    const envOverrides = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      const trimmedKey = key.trim();
      const value = valueParts.join('=').trim();
      
      // Only allow overriding existing CONFIG keys
      if (trimmedKey in CONFIG) {
        // Try to parse as JSON for booleans, numbers, strings
        try {
          envOverrides[trimmedKey] = JSON.parse(value);
        } catch (e) {
          // If JSON parse fails, treat as string
          envOverrides[trimmedKey] = value;
        }
      }
    });
    
    Logger.log('Loaded overrides from .env file');
    return envOverrides;
  } catch (e) {
    Logger.log('Warning: Could not read .env file: ' + e.toString());
    return {};
  }
}

/**
 * Load configuration - merges hard-coded CONFIG defaults with .env overrides
 * Priority: CONFIG (defaults) < .env (overrides)
 */
function loadConfig_() {
  // Start with CONFIG defaults as base
  const config = JSON.parse(JSON.stringify(CONFIG));
  
  // Merge .env overrides (if file exists)
  const envOverrides = loadEnvFile_();
  Object.assign(config, envOverrides);
  
  return config;
}

/**
 * Get current configuration
 * Use this instead of CONFIG directly in your scripts
 */
function getConfig() {
  return loadConfig_();
}

/**
 * Update a single configuration value in .env file
 * Creates or updates the .env file in Google Drive root
 * @param {string} key - The config key to update
 * @param {*} value - The new value
 */
function setConfigValue(key, value) {
  // Only allow overriding existing CONFIG keys
  if (!(key in CONFIG)) {
    Logger.log(`Error: "${key}" is not a valid CONFIG key`);
    return;
  }
  
  try {
    const root = DriveApp.getRootFolder();
    const envFiles = root.getFilesByName('.env');
    let envContent = '';
    let envFile = null;
    
    // Load existing .env if it exists
    if (envFiles.hasNext()) {
      envFile = envFiles.next();
      envContent = envFile.getBlob().getDataAsString();
    }
    
    // Parse existing content and update/add the key
    const lines = envContent.split('\n');
    const updatedLines = [];
    let keyFound = false;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith(key + '=')) {
        updatedLines.push(`${key}=${JSON.stringify(value)}`);
        keyFound = true;
      } else if (trimmedLine) {
        updatedLines.push(line);
      }
    });
    
    // Add key if it wasn't found
    if (!keyFound) {
      updatedLines.push(`${key}=${JSON.stringify(value)}`);
    }
    
    const newContent = updatedLines.join('\n');
    
    // Update or create .env file
    if (envFile) {
      envFile.setContent(newContent);
    } else {
      root.createFile('.env', newContent);
    }
    
    Logger.log(`Config value set in .env: ${key} = ${value}`);
  } catch (e) {
    Logger.log('Error: Could not write to .env file: ' + e.toString());
  }
}

/**
 * Reset configuration overrides by deleting .env file
 */
function resetConfigToDefaults() {
  try {
    const root = DriveApp.getRootFolder();
    const envFiles = root.getFilesByName('.env');
    
    if (envFiles.hasNext()) {
      envFiles.next().setTrashed(true);
      Logger.log('.env file removed, using CONFIG defaults');
    } else {
      Logger.log('No .env file found, already using CONFIG defaults');
    }
  } catch (e) {
    Logger.log('Error: Could not delete .env file: ' + e.toString());
  }
}

