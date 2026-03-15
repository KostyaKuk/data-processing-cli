export function parseArgs(args, options = []){
    const result = {}

    const setOptions = new Set(options)

    for(let i = 0; i< args.length; i++){
        const arg = args[i]

        if(arg.startsWith('--')){
            const sliceName = arg.slice(2)

            if(!setOptions.has(sliceName)){
                throw new Error('Youre set has unknown option')
            }

            result[sliceName] = args[i+1]
            i++
        }
    }
    return result
}