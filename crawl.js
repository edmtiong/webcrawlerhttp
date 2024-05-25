function normalizeURL(urlString) {
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostPath.length > 0 && hostPath.slice(-1)) {/*return last character*/
        return hostPath.slice(0,-1) /*return all except last character*/
    } 
    return hostPath
    
}

module.exports = {
    normalizeURL
}