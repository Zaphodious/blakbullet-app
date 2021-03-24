const REQUIRED_METADATA_KEYS = ["name"];
const TEXT_FILE_EXTENSIONS = ["txt"];
const fs = require('fs');
const path = require('path');
// NOTE: when you want them to run their module code, you do `mod.runModuleCode()` where mod's type is the Mod class

const defaultmodname = "Default"
console.log(nw.App.dataPath)

function make_modpath(modname) {
    if (modname === defaultmodname) {
        return './defaults/mod/'
    }
    return nw.App.dataPath + '/mods/' + modname + '/'
}

export default class Mod {
    constructor(modname) {
        let modpath = make_modpath(modname)
        console.log(modpath)
        this.name = modname;
        this.assets = {};
        this.modpath = modpath;
        // this.loadData(this.loadJSON(filepath));
    }
    async load() {
        let filepath = this.modpath + "mod.json";
        return await this.loadData(this.loadJSON(filepath))
    }
    async loadModule(path) {
        let promise = import(path);
        return await promise;
    }
    async runModuleCode() {
        if (this.module) {
            if (this.module.run) {
                this.module.run();
            }
        }
    }
    async loadData(metadata) {
        if (!this.isMetadataValid(this.metadata)) {
            throw new Error("invalid metadata"); 
        }
        this.metadata = await metadata;
        this.name = this.metadata["name"];
        this.assets = await this.loadAssets(this.modpath + "assets/");
        let jspath = this.modpath + "module.js"
        if (this.name === defaultmodname) {
            jspath = '../../defaults/mod/mod.js'
        }
        this.module = await this.loadModule(jspath); // ?????
    }
    // test this later
    async loadAssets(assetsPath) {
        console.log(assetsPath)
        let record = {};
        fs.readdir(assetsPath, async (e, items) => {
            for (let item of items) {
                let itemPath = path.join(assetsPath, item);
                fs.stat(itemPath, async (e, stats) => {
                    if (stats.isDirectory()) {
                        for (let [k, v] of Object.entries(this.loadAssets(itemPath))) {
                            record[strip_front(k)] = v;
                        }
                    }
                    else {
                        let asset = await this.loadAsset(itemPath);
                        if (asset)
                            record[strip_front(itemPath)] = asset;
                    }
                });
            }
        });
        return record;
    }
    async loadAsset(path) {
        if (this.isFileIMG(path)) {
            let asset = {
                type: AssetType.IMG,
                data: await this.loadImageURI(path)
            };
            return asset;
        }
        if (this.isFileJSON(path)) {
            let asset = {
                type: AssetType.JSON,
                data: await this.loadJSON(path)
            };
            return asset;
        }
        if (this.isFileCSS(path)) {
            let asset = {
                path: this.modpath + 'assets/' + strip_front(path),
                type: AssetType.CSS, 
                data: await this.loadText(path)
            };
            return asset
        }
        if (this.isFileText(path)) {
            let asset = {
                type: AssetType.TEXT,
                data: await this.loadText(path)
            };
            return asset;
        }
        return undefined;
    }
    isFileIMG(path) {
        let lower = path.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg");
    }
    // TODO
    isFileCSS(path) {
        return path.toLowerCase().endsWith(".css");
    }
    isFileText(path) {
        for (let extension of TEXT_FILE_EXTENSIONS) {
            if (path.toLowerCase().endsWith("." + extension)) {
                return true;
            }
        }
        return false;
    }
    isFileJSON(path) {
        return path.toLowerCase().endsWith(".json");
    }
    async loadJSON(path) {
        let fileContents = await this.loadText(path);
        console.log(fileContents)
        if (!fileContents)
            return undefined;
        return JSON.parse(fileContents);
    }
    isMetadataValid(metadata) {
        // for (let required of REQUIRED_METADATA_KEYS) {
        //     if (required in metadata) {
        //         continue;
        //     }
        //     return false;
        // }
        return true;
    }
    async loadImageURI(path) {
        fs.readFile(path, "binary", (err, data) => {
            let buffer = Buffer.from(data);
            if (buffer)
                return "data:image/png;base64," + buffer.toString("base64");
        });
        return undefined;
    }
    async loadText(path) {
        return new Promise((res,rej) => fs.readFile(path, 'utf8', (err, data) => err ? rej(err) : res(data)))
    }
}
// export var AssetType;
// (function (AssetType) {
//     AssetType[AssetType["JSON"] = 0] = "JSON";
//     AssetType[AssetType["IMG"] = 1] = "IMG";
//     AssetType[AssetType["TEXT"] = 2] = "TEXT";
//     AssetType[AssetType["CSS"] = 3] = "CSS";
// })(AssetType || (AssetType = {}));
export var AssetType = {
    'JSON': 'JSON',
    'IMG': 'IMG',
    'TEXT': 'TEXT',
    'CSS': 'CSS',
}
        function strip_front(s) {
            return path.parse(s).base
        }