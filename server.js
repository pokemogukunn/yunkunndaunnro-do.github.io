const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/download', (req, res) => {
    const videoId = req.body.videoId;
    const filePath = path.join(__dirname, 'public', `videoplayback_${videoId}.mp4`);
    const downloadUrl = `https://pokemogukunn.github.io/yunkunndaunnro-do.github.io/videoplayback_${videoId}.mp4`;

    // YouTube動画をダウンロードするためのコマンド
    const downloadCommand = `youtube-dl -o ${filePath} https://www.youtube.com/watch?v=${videoId}`;

    exec(downloadCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ success: false });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ success: false });
        }
        console.log(`stdout: ${stdout}`);

        // Gitコマンドでファイルをリポジトリにコミット・プッシュ
        const gitCommands = `
            git config --global user.email "actions@github.com"
            git config --global user.name "GitHub Actions"
            git add ${filePath}
            git commit -m "Add videoplayback_${videoId}.mp4"
            git push https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPO}.git main
        `;

        exec(gitCommands, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).json({ success: false });
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({ success: false });
            }
            console.log(`stdout: ${stdout}`);
            res.json({ success: true, downloadUrl });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
