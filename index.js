const core = require('@actions/core');
const { STSClient, AssumeRoleWithWebIdentityCommand, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function assumeRoleWithOIDC(roleArn, sessionName, awsRegion) {
    const idToken = await core.getIDToken("sts.amazonaws.com");
    console.log('got id token:', idToken);

    const stsClient = new STSClient({ region: awsRegion });
    const creds = await stsClient.send(new AssumeRoleWithWebIdentityCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        WebIdentityToken: idToken,
    }));

    return creds;
}

async function setupProfile(creds, profileName, awsRegion) {

    const awsConfigDir = path.join(os.homedir(), '.aws');
    await fs.mkdir(awsConfigDir, { recursive: true });

    const configContent = `[profile ${profileName}]
aws_access_key_id = ${creds.Credentials.AccessKeyId}
aws_secret_access_key = ${creds.Credentials.SecretAccessKey}
aws_session_token = ${creds.Credentials.SessionToken}
region = ${awsRegion}

`;

    const configPath = path.join(awsConfigDir, 'config');
    await fs.appendFile(configPath, configContent, 'utf8');

    const config = await fs.readFile(configPath, 'utf8');
}

async function main() {
    try {
        const profile = core.getInput('profile');
        const roleArn = core.getInput('role-to-assume');
        const sessionName = core.getInput('role-session-name');
        const awsRegion = core.getInput('aws-region');

        const creds = await assumeRoleWithOIDC(roleArn, sessionName, awsRegion);
        await setupProfile(creds, profile, awsRegion);

        console.log(`Configured ${profile}!`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
