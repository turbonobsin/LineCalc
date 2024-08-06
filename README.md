## What is this?
- This is a utility program to calculate how many lines of code are in your projects
- You can define presets for different projects to easily recalculate them
- Let's you ignore certain files and folders
- calculates lines of code as well as totals excluding empty lines

## How to use
Create a folder called `presets` in the application directory and you can put presets in there. They will be `<name>.json` and follow the scheme below.
<br><br>
Presets can be ran with either of the following syntax:
- `npm start <preset name>`
- `node index.mjs <preset name>`

### Example
- `npm start mygame`
- *This will read the file named mygame.json that's in the `presets` folder*

## Notes
- preset.json is the default file when using no arguments
- it's a simple program but hasn't been tested much so problems could occur

## Preset Format
```typescript
interface Preset {
    "$schema": "./presetFormat.json"; // include this for autocomplete in the json file
    
    /**
     * The root dir to scan folders in; if omitted will default to program directory
     * (can be relative or absolute)
     */
    root?: string;

    /**
     * Allowed types/extensions of files to scan
     * Ex: ["html","css","ts"]
     */
    types: string[];

    /**
     * Option title to be displayed above the output
     */
    title?: string;

    folders: PresetFolder[];
}

interface PresetFolder {
    /**
     * Label to display the folder as
     * Default: "Default"
     */
    name?: string;

    /**
     * Optional root path to use instead of the global one defined.
     * This lets you be able to include results from multiple projects together
     */
    root?: string;

    /**
     * Optional sub path from "root" that you'd like this folder to scan
     */
    path?: string;

    /**
     * The list of paths/files off of "root" that you'd like to be ignored
     * This can be sub file/folders like "src/notes"
     */
    ignore: string[];
}
```