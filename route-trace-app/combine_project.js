const fs = require('fs');
const path = require('path');

// --- Configuration ---

// Directories to completely ignore
const EXCLUDED_DIRS = [
    'node_modules',
    '.git',
    'build',
    'coverage',
    '.vscode',
    '.idea',
    '. Caches' // Example for specific tools
];

// Specific files to ignore
const EXCLUDED_FILES = [
    'package-lock.json',
    'yarn.lock',
    '.env',
    '.DS_Store'
];

// File extensions to ignore (lower-cased)
const EXCLUDED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', // Images
    '.svg', // SVGs can be code, but often treated as assets in CRA
    '.ico', // Favicon
    '.woff', '.woff2', '.ttf', '.eot', // Fonts
    '.mp4', '.mov', '.avi', // Videos
    '.mp3', '.wav', // Audio
    '.map', // Source maps
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', // Documents
    '.zip', '.gz', '.tar' // Archives
];

// File extensions to *include* (if not excluded elsewhere). Add more if needed.
// If empty, all non-excluded extensions will be included.
// Useful if you *only* want specific source types.
const INCLUDED_EXTENSIONS = [
    // '.js', '.jsx', '.ts', '.tsx', // Javascript/Typescript
    // '.css', '.scss', '.sass', '.less', '.module.css', // Stylesheets
    // '.json', // Config files, data
    // '.html', // HTML files (like public/index.html)
    // '.md' // Markdown
]; // Leave empty to include *all* non-excluded files

const OUTPUT_FILE = 'combined_project_output.txt';

// --- Helper Functions ---

function isExcluded(relativePath, stats) {
    const baseName = path.basename(relativePath);
    const ext = path.extname(baseName).toLowerCase();

    if (stats.isDirectory()) {
        return EXCLUDED_DIRS.includes(baseName);
    }

    if (EXCLUDED_FILES.includes(baseName)) {
        return true;
    }

    if (EXCLUDED_EXTENSIONS.includes(ext)) {
        return true;
    }

    // If INCLUDED_EXTENSIONS is specified, *only* include those
    if (INCLUDED_EXTENSIONS.length > 0 && !INCLUDED_EXTENSIONS.includes(ext)) {
        return true;
    }


    return false;
}

// --- Tree Generation ---

function generateTree(dir, rootDir, prefix = '', includedFiles) {
    let tree = '';
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const filteredEntries = entries
            .filter(entry => {
                 // Always check exclusion based on the *full* relative path from the root
                const entryRelativePath = path.relative(rootDir, path.join(dir, entry.name));
                const stats = fs.statSync(path.join(dir, entry.name)); // Need stats for isExcluded check
                 // Don't add excluded items to the tree *at all*
                return !isExcluded(entryRelativePath, stats);
            })
            .sort((a, b) => {
                // Directories first, then files, then alphabetically
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            });

        filteredEntries.forEach((entry, index) => {
            const isLast = index === filteredEntries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const entryPath = path.join(dir, entry.name);
            const entryRelativePath = path.relative(rootDir, entryPath); // Path relative to project root

            tree += `${prefix}${connector}${entry.name}\n`;

            if (entry.isDirectory()) {
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                tree += generateTree(entryPath, rootDir, newPrefix, includedFiles);
            } else {
                // Optionally: Only add files to the tree that will be included in the content part
                 if (includedFiles.has(entryRelativePath)) {
                     // File already added during tree build if check is here
                 } else {
                    // If we want the tree to show *all* non-excluded files, even if INCLUDED_EXTENSIONS
                    // limits content, then we don't need the check above.
                    // Current implementation shows all non-excluded files/dirs in the tree.
                 }
            }
        });
    } catch (err) {
        console.error(`Error reading directory ${dir}: ${err.message}`);
        tree += `${prefix}└── [Error reading directory]\n`;
    }
    return tree;
}


// --- File Content Gathering ---

function gatherFileContents(dir, rootDir) {
    let filesToInclude = new Map(); // Using Map to store { relativePath: absolutePath }

    function traverse(currentDir) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const absolutePath = path.join(currentDir, entry.name);
                const relativePath = path.relative(rootDir, absolutePath);
                 // Use statSync here to check if it's a file or dir for exclusion
                let stats;
                 try {
                     stats = fs.statSync(absolutePath);
                 } catch (statErr) {
                     console.warn(`Warning: Could not stat ${absolutePath}. Skipping. Error: ${statErr.message}`);
                     continue; // Skip if stat fails (e.g., broken symlink)
                 }


                if (isExcluded(relativePath, stats)) {
                    // console.log(`Excluding: ${relativePath}`); // Uncomment for debugging exclusions
                    continue;
                }

                if (entry.isDirectory()) {
                    traverse(absolutePath);
                } else if (entry.isFile()) {
                    // console.log(`Including: ${relativePath}`); // Uncomment for debugging inclusions
                    filesToInclude.set(relativePath, absolutePath);
                }
            }
        } catch (err) {
            console.error(`Error reading directory ${currentDir}: ${err.message}`);
        }
    }

    traverse(dir);
    return filesToInclude; // Return the Map
}

// --- Main Execution ---

function main() {
    // Use current directory as default, or first command-line argument
    const projectDir = path.resolve(process.argv[2] || '.');
    const outputFilePath = path.join(projectDir, OUTPUT_FILE); // Output in the project dir

    console.log(`Scanning project directory: ${projectDir}`);
    console.log(`Output will be written to: ${outputFilePath}`);

    if (!fs.existsSync(projectDir) || !fs.statSync(projectDir).isDirectory()) {
        console.error(`Error: Project directory not found or is not a directory: ${projectDir}`);
        process.exit(1);
    }

    // 1. Gather all files first to know what will be included in the content
    const includedFilesMap = gatherFileContents(projectDir, projectDir); // Map { relativePath: absolutePath }
    const includedFileRelativePaths = new Set(includedFilesMap.keys()); // Set { relativePath } for quick lookup in tree generation

    // 2. Generate the project tree (pass the set of included files for potential filtering)
    console.log("Generating project tree...");
    const projectName = path.basename(projectDir);
    const projectTree = `${projectName}/\n` + generateTree(projectDir, projectDir, '', includedFileRelativePaths);


    // 3. Read and combine file contents
    console.log(`Reading content of ${includedFilesMap.size} files...`);
    let combinedContent = '';
    const sortedRelativePaths = Array.from(includedFilesMap.keys()).sort(); // Sort for consistent order

    for (const relativePath of sortedRelativePaths) {
        const absolutePath = includedFilesMap.get(relativePath);
        try {
            const content = fs.readFileSync(absolutePath, 'utf8');
            combinedContent += `// ----- File: ${relativePath} -----\n\n`;
            combinedContent += content;
            combinedContent += '\n\n// ----- End File: ' + relativePath + ' -----\n\n';
        } catch (err) {
            console.warn(`Warning: Could not read file ${absolutePath}. Skipping. Error: ${err.message}`);
            combinedContent += `// ----- File: ${relativePath} -----\n\n`;
            combinedContent += `// ***** Error reading file: ${err.message} *****\n\n`;
             combinedContent += '// ----- End File: ' + relativePath + ' -----\n\n';
        }
    }

    // 4. Combine tree and content
    const finalOutput = `--- Project Tree ---\n\n${projectTree}\n\n--- File Contents ---\n\n${combinedContent}`;

    // 5. Write to output file
    console.log(`Writing combined output to ${outputFilePath}...`);
    try {
        fs.writeFileSync(outputFilePath, finalOutput, 'utf8');
        console.log('Done!');
    } catch (err) {
        console.error(`Error writing output file ${outputFilePath}: ${err.message}`);
        process.exit(1);
    }
}

main();