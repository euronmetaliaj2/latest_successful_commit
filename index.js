const core = require('@actions/core');
const github = require('@actions/github');

try {
  const octokit = github.getOctokit(core.getInput('github_token'));

  octokit.actions.listWorkflowRuns({
    owner: process.env.GITHUB_REPOSITORY.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY.split('/')[1],
    workflow_id: core.getInput('workflow_id'),
    status: "success",
    branch: core.getInput('branch'),
    event: "push"
  }).then( res => {
    const headCommits = res.data.workflow_runs.map(run => {return run.head_commit});

    const sortedHeadCommits = headCommits.sort( (a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
    });

    const lastSuccessCommitHash = sortedHeadCommits[sortedHeadCommits.length -1].id;

    core.setOutput("commit_hash", lastSuccessCommitHash)
  })
} catch (error) {
  core.setFailed(error.message);
}