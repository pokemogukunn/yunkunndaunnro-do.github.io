const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate', (req, res) => {
    const videoId = req.body.videoId;
    const filePath = path.join(__dirname, `download=${videoId}.html`);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Download ${videoId}</title>
</head>
<body>
    <h1>Download Video</h1>
    <iframe width='560' height='315' src='https://www.youtube.com/embed/${videoId}' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>
</body>
</html>`;

    fs.writeFileSync(filePath, htmlContent, 'utf8');

    // Gitコマンドでファイルをリポジトリにコミット・プッシュ
    exec(`git add ${filePath} && git commit -m "Add download file for ${videoId}" && git push`, (error, stdout, stderr) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
