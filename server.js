const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config(); // dotenvパッケージを読み込み

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate', (req, res) => {
    const videoId = req.body.videoId;
    const filePath = path.join(__dirname, 'videoplayback.mp4');

    // YouTube動画をダウンロードするためのコマンド
    const downloadCommand = `youtube-dl -o ${filePath} https://www.youtube.com/watch?v=${videoId}`;

    exec(downloadCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Internal Server Error');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`stdout: ${stdout}`);

        // Gitコマンドでファイルをリポジトリにコミット・プッシュ
        const gitCommands = `
            git config --global user.email "actions@github.com"
            git config --global user.name "GitHub Actions"
            git add ${filePath}
            git commit -m "Add videoplayback.mp4 for ${videoId}"
            git push https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPO}.git main
        `;

        exec(gitCommands, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send('Internal Server Error');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`stdout: ${stdout}`);
            res.send('File generated and pushed to GitHub');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
