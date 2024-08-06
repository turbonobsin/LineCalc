import fs from "fs/promises";

export function util_error(...text){
    console.log("\x1b[31m%s\x1b[0m",...text);
}
export function util_note(...text){
    console.log("\x1b[32m%s\x1b[0m",...text);
}

/**
 * @param {string} preset 
 */
async function calc(presetName="preset.json"){
    let config;
    try{
        config = JSON.parse(await fs.readFile("./config.json"));
    }
    catch(e){
        util_error("Error: Failed to read config.");
        return;
    }
    
    if(!presetName.endsWith(".json")) presetName += ".json";
    console.log("PRESET: "+presetName);
    let _text = "";
    try{
        _text = await fs.readFile(`./${config.presetPath??"presets"}/`+presetName,"utf8");
    }
    catch(e){
        util_error("Error: no preset file found for: ",presetName);
        return;
    }
    let preset = JSON.parse(_text);

    let root = getRoot(preset.root);
    console.log(`Root path: "${root}"\n`);
    
    let amts = {};
    let lines1 = {};
    let lines1NoBlank = {};

    for(const folder of preset.folders){
        let name = getDefaultName(folder.name);
        amts[name] = 0;
        lines1[name] = 0;
        lines1NoBlank[name] = 0;
    }
    
    /**
     * @param {string} path 
     * @param {string} key 
     * @param {string[]} ignore 
     * @param {string[]} allowedTypes 
     * @returns 
     */
    async function search(path,key,ignore,allowedTypes){
        let items = await fs.readdir(path);
        if(!items) return;
        for(const item of items){
            let fullPath = path+item;
            if(ignore.includes(fullPath)) continue;
            if(!item.includes(".")){ // is folder
                await search(fullPath+"/",key,ignore,allowedTypes);
            }
            else{ // is file
                let type = item.split(".").pop();
                if(type) if(allowedTypes.includes(type.toLowerCase())){
                    amts[key]++; // file total

                    // line total
                    let text = await fs.readFile(fullPath,"utf8");
                    text = text.replace(/\r/g,"");
                    let lines = text.split("\n");
                    lines1[key] += lines.length;
                    for(const l of lines){
                        if(l.length > 0){
                            lines1NoBlank[key]++;
                        }
                    }
                }
            }
        }
    }

    // 

    for(const folder of preset.folders){
        let name = getDefaultName(folder.name);
        let path = folder.path ?? "";
        if(!path.endsWith("/")) path += "/";
        let ignore = folder.ignore ?? [];
        let subRoot = (folder.root ? getRoot(folder.root) : root);
        await search(subRoot+path,name,ignore.map(v=>subRoot+path+v),preset.types.concat(folder.types ?? []));
    }

    // 

    let hr = "--------------------------------";
    if(preset.title){
        let space = Math.floor((hr.length-preset.title.length)/2);
        if(space <= 0) hr = "-".repeat(preset.title.length);
        console.log(hr);
        util_note(" ".repeat(space)+preset.title);
    }
    console.log(hr);
    console.log("Total Files: ",preset.folders.map(v=>amts[getDefaultName(v.name)]).reduce((p,v)=>p+v,0));
    
    console.log("");
    for(const folder of preset.folders){
        let name = getDefaultName(folder.name);
        let amt = amts[name];
        let lines1Amt = lines1[name];
        let linesNoBlank1Amt = lines1NoBlank[name];

        console.log(`-- ${name}: \n`,amt," files\n",lines1Amt," lines\n",linesNoBlank1Amt," lines (non blank)\n");
    }

    console.log("TOTAL LINES: ",preset.folders.map(v=>lines1[getDefaultName(v.name)]).reduce((p,v)=>p+v,0));
    console.log("TOTAL LINES (non blank): ",preset.folders.map(v=>lines1NoBlank[getDefaultName(v.name)]).reduce((p,v)=>p+v,0));
    console.log(hr);
}

function getDefaultName(name){
    return name ?? "Default";
}
function getRoot(root){
    root = root ?? "./";
    if(!root.endsWith("/")) root += "/";
    root = root.replaceAll("\\","/");
    return root;
}

await calc(process.argv[2]);