const fs = require('fs');
const path = require('path');

const directory = './docs';

function escapeBraces(content) {
    let insideCodeBlock = false;
    let escapedContent = '';

    for (let i = 0; i < content.length; i++) {
        if (content[i] === '`' && content[i + 1] === '`' && content[i + 2] === '`') {
            insideCodeBlock = !insideCodeBlock;
            escapedContent += content[i] + content[i + 1] + content[i + 2];
            i += 2;
        } else if (content[i] === '{' && !insideCodeBlock) {
            escapedContent += '\\{';
        } else {
            escapedContent += content[i];
        }
    }

    return escapedContent;
}

fs.readdir(directory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach((file) => {
        if (path.extname(file) === '.md') {
            const filePath = path.join(directory, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const escapedContent = escapeBraces(data);
                
                fs.writeFile(filePath, escapedContent, (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return;
                    }

                    console.log('File processed:', filePath);
                });
            });
        }
    });
});