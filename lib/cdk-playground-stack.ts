// import * as cdk from '@aws-cdk/core';
// import * as pipelines from '@aws-cdk/pipelines';

// export class CdkPlaygroundStack extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // https://constructs.dev/packages/@aws-cdk/pipelines/v/1.133.0?lang=typescript#synth-and-sources
//     const modernPipeline = new pipelines.CodePipeline(this, 'Pipeline', {
//       selfMutation: true,
//       synth: new pipelines.ShellStep('Synth', {
//         input: pipelines.CodePipelineSource.gitHub('karloscodes/cdk-playground', 'main'),
//         commands: [
//           'npm ci',
//           'npm run build',
//           'npx cdk synth',
//         ],
//       }),
//     })
//   }
// }

import * as CDK from "@aws-cdk/core";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";

export class CdkPlaygroundStack extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props: any) {
    super(scope, id, props);

    // AWS CodeBuild artifacts
    const outputSources = new CodePipeline.Artifact();
    const buildArtifact = new CodePipeline.Artifact();

    // AWS CodePipeline pipeline
    const pipeline = new CodePipeline.Pipeline(this, "Pipeline", {
      pipelineName: "CdkDemo",
      restartExecutionOnUpdate: true,
    });

    // AWS CodePipeline stage to clone sources from bitbucket repository
    pipeline.addStage({
      stageName: "Source",
      actions: [
        // https://constructs.dev/packages/@aws-cdk/aws-codepipeline-actions/v/1.114.0/?lang=typescript#github
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'GitHubSource',
          owner: 'karloscodes',
          repo: 'cdk-playground',
          oauthToken: CDK.SecretValue.secretsManager('github-cdk-token'),
          output: outputSources,
          branch: 'main',
        })
      ],
    });

    // AWS CodePipeline stage to build CRA website and CDK resources
    pipeline.addStage({
      stageName: "Build",
      actions: [
        // AWS CodePipeline action to run CodeBuild project
        new CodePipelineAction.CodeBuildAction({
          actionName: "Build",
          project: new CodeBuild.PipelineProject(this, "Build", {
            projectName: "CdkPlayground",
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename(
              ".build.yml"
            ),
          }),
          input: outputSources,
          outputs: [buildArtifact],
        }),
      ],
    });

    // const bucketWebsite = new S3.Bucket(this, "Files", {
    //   websiteIndexDocument: "index.html",
    //   websiteErrorDocument: "error.html",
    //   publicReadAccess: true,
    // });

    // // AWS CodePipeline stage to deploy website and CDK resources
    // pipeline.addStage({
    //   stageName: "Deploy",
    //   actions: [
    //     // AWS CodePipeline action to deploy website to S3
    //     new CodePipelineAction.S3DeployAction({
    //       actionName: "Website",
    //       input: outputWebsite,
    //       bucket: bucketWebsite,
    //     }),
    //   ],
    // });
  }
}
