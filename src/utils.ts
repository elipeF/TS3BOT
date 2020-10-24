
export const strRepleace = (str: string, keys: Object): string => {
    let string = str;
    for(const key in keys) {
        string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), keys[key]);
    }
    return string;
}

export const arrIntersec = <T>(array1: Array<T>, array2: Array<T>) => array1.filter(value => array2.includes(value));