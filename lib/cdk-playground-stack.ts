import * as cdk from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';

export class CdkPlaygroundStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // https://constructs.dev/packages/@aws-cdk/pipelines/v/1.133.0?lang=typescript#synth-and-sources
    const modernPipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      selfMutation: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('karloscodes/cdk-playground', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    })
  }
}
