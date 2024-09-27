const path = require('path');
const fs = require('fs');

function removeAllFilesInDir(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            const filePath = path.join(directory, file);

            fs.lstat(filePath, (err, stats) => {
                if (err) throw err;

                if (stats.isFile()) {
                    fs.unlink(filePath, (err) => {
                        if (err) throw err;
                        console.log(`Deleted file: ${filePath}`);
                    });
                }
            });
        }
    });
}

module.exports = { removeAllFilesInDir }