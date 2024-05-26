const {JSDOM} = require('jsdom')

async function crawlPage(baseURL, currentURL, pages){
    

    const baseURLobj = new URL(baseURL)
    const currentURLobj = new URL(currentURL)
    if (baseURLobj.hostname !== currentURLobj.hostname){
        return pages
    }

    const normalizeCurrentURL = normalizeURL(currentURL)
    if (pages[normalizeCurrentURL] > 0){
        pages[normalizeCurrentURL]++
        return pages
    }

    pages[normalizeCurrentURL] = 1
    
    console.log(`actively crawling ${currentURL}`)

    try{
        const resp = await fetch(currentURL)

        if (resp.status > 399){
            console.log(`error in fetch with status code: ${resp.status} on page: ${currentURL}`)
            return pages
        }

        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")) {
            console.log(`non html response, content type: ${contentType} on page: ${currentURL}`)
            return pages
        }

        const htmlBody = await resp.text()

        nextURLs = getURLsFromHTML(htmlBody, baseURL)

        for (const nextURL of nextURLs){
            pages = await crawlPage(baseURL, nextURL, pages)
        }
        return pages
    } catch (err){
        console.log(`error in fetch: ${err.message}, on page: ${currentURL}`)
    }

}

function normalizeURL(urlString) {
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostPath.length > 0 && hostPath.slice(-1)) {/*return last character*/
        return hostPath.slice(0,-1) /*return all except last character*/
    } 
    return hostPath
}

function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    
    for (const linkElement of linkElements){
        if(linkElement.href.slice(0,1) === '/'){
            //relative
            try{
                const urlObj = new URL(`${baseURL}${linkElement.href}`)
                urls.push(urlObj.href)
            } catch (err){
                console.log(`error message: ${err.message}`)
            }
        } else{ 
            //absolute
            try{   
                const urlObj = new URL(linkElement.href)
                urls.push(urlObj.href)
            } catch (err){
                console.log(`error message: ${err.message}`)
            }
        }
       
    }
    return urls
}
module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}
