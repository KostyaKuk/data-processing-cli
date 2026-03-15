import path from "node:path";

let currentDir = process.cwd()

export function getCurrentDir(){
    return currentDir;
}

export function setCurrentDit(newDir){
    currentDir = newDir;
}

export function resolvePath(pathInput = '.'){
    return path.resolve(currentDir, pathInput)
}