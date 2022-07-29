

// Various async funcs

// async function asyncFunc(,cb) {

// }

// Promise
// async await, or .then
function promiseAdd(a,b) {
    return new Promise((resolve,reject) => {
        if (a+b > 10) {reject('TOO BIG')} else {resolve(a+b)}
    })
}

// Callbacks
function cbadd(a,b,cb) {
    let c = a+b
    cb(null,c)
}

async function main() {
    try {
        result = await promiseAdd(2,3)
        result = await promiseAdd(result,2)
        result = await promiseAdd(result,1)
        console.log(result)
    }
    catch(err) {
        console.log(err)
    }
    // PROMISE
    // promiseAdd(5,7).then((result) => {
    //     return promiseAdd(result,3)
    // }).then((result) => {
    //     console.log(result)
    // }).catch((err) => {console.log(err)})
    // CALLBACK
    // cbadd(5,3,(err,result) => {
    //     if (err) {throw ('err',err)}
    //     cbadd(result,3,(err,result) => {
    //         if (err) {throw ('err',err)}
    //         console.log(result)
    //     })
    // })
}

main()