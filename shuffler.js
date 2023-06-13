const fs = require("fs-extra")
const path = require("path")
const {exec} = require("child_process")
const { stdout, stderr } = require("process")
const {v4: uuid4} = require("uuid") 

const rootPath = 'C:\\Users\\Jalen\\ShufflerDemo'
const currDir = process.cwd()
console.log(fs.readdirSync(rootPath))

const naviBranch = (folderName) => {
    if (!folderName) {
        throw new Error("A folder name must be specified: 'to-branch <folder-name>'")
        
    }
    const destPath = path.join(rootPath, folderName)
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath)

        fs.copySync(currDir, destPath)
    } else {
        console.log("branch already exists \nredirecting...");
        
    }
    openBranch(destPath)
}

const openBranch = (filepath) => {
    exec(`cd ${filepath} && code .`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return err
        }

        console.log("Shuffled to " + filepath);
    })
}

const pushToMain = (commitMessage) => {
    if (!commitMessage) {
        throw new Error("A descriptive message is required for this action: 'push-main <push-message>'")
        
    }
    const mainPath = path.join(rootPath, 'main')
    if(mainPath == currDir) {
        console.log("Already working in the main branch");
        return 
    }
    const backupPath = path.join(rootPath, 'backup')
    let folderName = commitMessage;
    if(fs.existsSync(path.join(backupPath, commitMessage))) {
        throw new Error("Please provide a unique descriptive message for this push")
    }
    const prevStateFolder = path.join(backupPath, folderName)

    fs.copySync(mainPath, prevStateFolder)

    fs.copySync(currDir, mainPath)

    openBranch(mainPath)
}

const deleteBranch = (folderName) => {
    const fullPath = path.join(rootPath, folderName)

    if(!fs.existsSync(fullPath)) {
        throw new Error("Branch does not exists within the repository")
    }

    fs.removeSync(fullPath)

    if(fs.existsSync(fullPath)) {
        throw new Error("Branch couldn't be deleted. Please make sure the branch folder is not currently open in any other window")
    }
}

const main = (args) => {
    switch(args[2]) {
        case 'to-branch':
            naviBranch(args[3])
            break
        case 'push-main':
            pushToMain(args[3])
            break
        case 'del-branch':
            deleteBranch(args[3])
            break
        default:
            console.log("Argument not recognized. Options: 'to-branch <folder-name>' and 'push-main <push-message>'")
            break
    }       
}

main(process.argv)
