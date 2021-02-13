const core = require('@actions/core');
const github = require('@actions/github');

const milestones = core.getInput('milestone')
const mytoken = core.getInput('github-token')
const octokit = github.getOctokit(mytoken)


// most @actions toolkit packages have async methods
async function run() {
  try {
    calculate(github.context.payload, octokit, milestones)
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

function calculate(payload, octokit, milestones) {
  const hasValidMiles = validateOpenMilestone(payload, octokit)

  if (milestones === 'true') {
    if (hasValidMiles === false) {
      throw new Error('PR title does not contain a milestone')
    }
  }
}

async function validateOpenMilestone(payload, octokit) {
  let repoName = payload.repository.name
  let prNo = payload.pull_request.number
  let milestoneStatus;
  try {
    const { data: pullRequest } = await octokit.pulls.get({
      owner: 'dipjyotimetia',
      repo: repoName,
      pull_number: prNo
    })

    milestoneStatus = pullRequest.milestone.state;
    if (milestoneStatus != 'open') {
      throw new Error('Payload milestone is closed')
    }
  } catch (error) {
    core.setFailed("Milestone is closed")
  }

  return milestoneStatus != null
}