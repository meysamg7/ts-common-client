export default (options = { coreDump: false, timeout: 500 }) => {
    return (code: number, reason: string) => (err: any, promise: Promise<any>) => {
        console.log(reason);
        if (err && err instanceof Error) {
            // Log error information, use a proper logging library here :)
            console.log(err.message, err.stack)
        }

        // Attempt a graceful shutdown
        setTimeout(()=>{
            options.coreDump ? process.abort() : process.exit(code)
        }, options.timeout).unref()
    }

}