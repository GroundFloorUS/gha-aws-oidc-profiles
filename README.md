# Setup Github Actions OIDC AWS Profiles

This GitHub Action sets up an AWS profile using OpenID Connect (OIDC) authentication. It obtains a GitHub token and uses it to assume an AWS IAM role, then configures an AWS profile with the temporary credentials.

The main difference from the original action is that this one writes the profile to the `~/.aws/config` file, allowing you to use the profile with the `aws` CLI tool.

It also doesn't populate the environment variables (as you can't unset them in github actions, see https://github.com/actions/runner/issues/1126).

## Usage

### Inputs

- `profile`: The name of the AWS profile to create.
- `role-to-assume`: The ARN of the AWS IAM role to assume.
- `role-session-name`: The name of the session to assume the role.
- `aws-region`: The AWS region to use.

Take care, there is no validation of the inputs and duplicate profiles are not detected.

### Example

```yaml
uses: krane-labs/gha-aws-oidc-profiles@v1
with:
  profile: my-profile
  role-to-assume: arn:aws:iam::123456789012:role/my-role
  role-session-name: my-session
  aws-region: us-east-1
```

### Building

```bash
npm install
ncc build index.js --license licenses.txt
```
