require('dotenv').config();
const { Probot } = require('probot');
const fs = require('fs');
const { exec } = require('child_process');

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

const app = new Probot({
  appId: process.env.APP_ID,
  privateKey: privateKey,
  secret: process.env.WEBHOOK_SECRET,
  logLevel: process.env.LOG_LEVEL,
});

app.on('pull_request', async (context) => {
  const { action, pull_request } = context.payload;
  const repo = context.repo();
  const branch = pull_request.head.ref;

  if (action === 'opened' || action === 'synchronize') {
    // Deployment logic
    const deploymentUrl = `http://3.21.156.158:8080`; // Replace with your deployment URL
    
    exec(`docker build -t my-app:${branch} . && docker run -d --name my-app-${branch} -p 8080:80 my-app:${branch}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    await context.github.issues.createComment(context.issue({
      body: `Deployment successful: ${deploymentUrl}`
    }));
  } else if (action === 'closed') {
    // Cleanup logic
    exec(`docker stop my-app-${branch} && docker rm my-app-${branch}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    await context.github.issues.createComment(context.issue({
      body: 'PR closed. Cleaning up resources...'
    }));
  }
});

app.start();

