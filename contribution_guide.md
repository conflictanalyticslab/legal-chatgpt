# Please follow the guide below when working on new features/fixing issues of previous 

# General rules:
1. Never push to master branch directly, always make changes on a separate branch then merge the branch to master branch.
2. Always remember to pull the latest changes before coding.
3. Create a new branch when implementing new features, this makes the branch history more readable and easier to manage.
4. Try to make small changes in each commits, if a commit contains changes to multiple components or hooks, break it to several commits.
5. Create a pull request (PR) on github after testing changes on local end and pushing the commits, once PR is merged, make sure to test your features in netlify's deployment preview before uploading it to production.
6. Always notify your supervisor when you created a PR, and arrange a Code Review (CR).
7. When there is unexpected issue of a feature or operation, create an issue on github, give it the appropriate tags, and notify your supervisor.


# Guides For Each Topic

### Git Basics
This topics covers some basic git commands that will be crucial for the development process, if you are already familiar with these, feel free to skip it.

When first starting the project, run the following command to clone the repo first, then follow the ReadMe.md file in the git repo to install dependencies.
```bash
git clone https://github.com/conflictanalyticslab/legal-chatgpt.git
```

When you are done with editing the files, use the commands below to add the changes to be staged, commit the changes, then push the commits to repo
```bash
git add --all
git commit -m"write your commit message here"
git push
```

Remember to always pull the latest commit changes before pushing, you can use the command below to check for your current branch's status. Note: git pull will try to merge the latest changes from repo with your current branch, you can use the git status command below to check which files have a merge conflict and resolve it by opening the files with your code editor and change the code there.
```bash
git status
git pull
```

### Yarn Basics
Yarn is the package manager we use for this project, it works similar to npm.

Note: Currently (June.28.2024) there is a package conflict between the MUI library and React, and trying to install new packages to the project with npm will always run into the error of dependency conflict, which makes installing with Yarn the only possible solution.

Running the following command will start a server on your local machine at https://localhost:3000, you can access OpenJustice by opening up a browser and going to this url.

The steps on how to set up the project can be found in the readme of the git repo, please refer to that as to how to set up the project.


### New Features:
When working on a new feature, use the command below to create a new branch, replace the new_feature with the name of your feature

```bash
git branch new_feature
```
After creating the branch, use the command below to swtich to the new branch just created

```bash
git checkout new_feature
```
To check what branches you are at and what other branches are on your local end, use the following command, the branch you are currently in will appear in green

```bash
git branch
```

### Editing Code in a Branch:

If the branch you want to work on is not on your local machine, you would want to fetch the branch from the remote repository. Below command fetches all branches from the remote repository:

```bash
git fetch origin
```

After fetching all branches, check if the branch you want to work on is available by using following command:

```bash
git branch -a
```

If the branch is available, check it out using the command below, replace `branch_name` with the name of your branch:

```bash
git checkout branch_name
```

After editing your code, add your changes for commit:

```bash
git add .
```

Commit your changes with a message. Replace `commit_message` with your message:

```bash
git commit -m "commit_message"
```

Lastly Push your changes to the repository using the command to create PR:

```bash
git push origin branch_name
```

### Rebasing in Git:

Rebasing is used to modify your commit history by placing the changes from the current branch onto another branch.

To rebase, switch to the branch that you want to rebase onto. Replace `base_branch` with the name of the branch that you want to rebase onto.

```bash
git checkout base_branch
```

Pull the latest updates for this branch from the remote repository:

```bash
git pull origin base_branch
```

Switch back to the branch that you want to rebase:

```bash
git checkout branch_name
```

To start the rebase, use the following command which allows you to see the last 20 commits from your HEAD, change the number if you wish to see more/less:

```bash
git rebase -i HEAD~20
```

While rebasing, there can be conflict, resolve the conflict and run the following commands to add changes from the rebase:

```bash
git add .
git rebase --continue
```

If something goes wrong in the rebase or you don't want to rebase anymore, run the following command:

```bash
git rebase --abort
```

After rebase, if you want to update the remote branch with your rebased branch, then you need to force push. (NOTE: Be careful with this, as it overwrites the remote branch) :

```bash
git push origin branch_name --force
```

### Commit messages:

https://www.conventionalcommits.org/en/v1.0.0/

### React/JSX Style guide:

https://airbnb.io/javascript/react/ 
